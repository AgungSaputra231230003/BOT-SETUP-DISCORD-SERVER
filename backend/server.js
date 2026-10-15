require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
  OverwriteType
} = require('discord.js');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// In-memory guild settings storage (e.g. logChannelId)
const guildSettings = new Map();

// Valid channel overwrite permissions according to Discord API
const CHANNEL_PERMISSION_FLAGS = new Set([
  'CreateInstantInvite',
  'ManageChannels',
  'AddReactions',
  'PrioritySpeaker',
  'Stream',
  'ViewChannel',
  'SendMessages',
  'SendTTSMessages',
  'ManageMessages',
  'EmbedLinks',
  'AttachFiles',
  'ReadMessageHistory',
  'MentionEveryone',
  'UseExternalEmojis',
  'Connect',
  'Speak',
  'MuteMembers',
  'DeafenMembers',
  'MoveMembers',
  'UseVAD',
  'ManageRoles',
  'ManageWebhooks',
  'UseApplicationCommands',
  'RequestToSpeak',
  'ManageThreads',
  'CreatePublicThreads',
  'CreatePrivateThreads',
  'UseExternalStickers',
  'SendMessagesInThreads',
  'UseEmbeddedActivities',
  'UseSoundboard',
  'CreateGuildExpressions',
  'UseExternalSounds',
  'SendVoiceMessages',
  'SetVoiceChannelStatus',
  'SendPolls',
  'UseExternalApps',
  'PinMessages',
  'BypassSlowmode'
]);

const buildChannelOverwrites = (guild, permissions = [], existingChannel = null) => {
  const allowed = (permissions || []).filter((p) => CHANNEL_PERMISSION_FLAGS.has(p));
  const denied = [...CHANNEL_PERMISSION_FLAGS].filter((p) => !allowed.includes(p));

  const everyoneId = guild.id;
  const overwrites = [];

  if (existingChannel && existingChannel.permissionOverwrites) {
    for (const ow of existingChannel.permissionOverwrites.cache.values()) {
      if (ow.id !== everyoneId) {
        overwrites.push(ow.toJSON());
      }
    }
  }

  overwrites.push({
    id: everyoneId,
    type: OverwriteType.Role,
    allow: allowed,
    deny: denied
  });

  return overwrites;
};

const normalizeHexColor = (colorValue) => {
  if (!colorValue && colorValue !== 0) return '#99AAB5';
  const hex = Number(colorValue).toString(16).padStart(6, '0');
  return `#${hex}`;
};

const toChannelType = (channel) => {
  if (channel.type === ChannelType.GuildVoice) return 'voice';
  if (channel.type === ChannelType.GuildCategory) return 'category';
  return 'text';
};

// Helper to send Discord log embed to target channel (optional feature)
const sendDiscordLog = async (guild, targetLogChannelId, { title, description, color = 0x8b5cf6, fields = [] }) => {
  const channelId = targetLogChannelId || guildSettings.get(guild.id)?.logChannelId;
  if (!channelId) return; // Opsional: jika tidak diatur, tidak ada log

  try {
    const channel =
      guild.channels.cache.get(channelId) ||
      (await guild.channels.fetch(channelId).catch(() => null));

    if (!channel || !channel.isTextBased()) return;

    const embed = {
      title: title || 'Discord Auto Setup Builder Log',
      description: description || '',
      color: typeof color === 'number' ? color : 0x8b5cf6,
      fields: Array.isArray(fields) ? fields.filter((f) => f && f.name && f.value) : [],
      timestamp: new Date().toISOString(),
      footer: {
        text: `Discord Auto Setup Builder • Server: ${guild.name}`
      }
    };

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.warn(`[Discord Log Warning] Gagal mengirim log ke channel ${channelId}:`, err.message);
  }
};

const buildGuildSnapshot = async (guild) => {
  const getEveryonePermissions = (channelOrCategory) => {
    if (!channelOrCategory.permissionOverwrites) return [];
    const everyoneOverwrite = channelOrCategory.permissionOverwrites.cache.get(guild.id);
    return everyoneOverwrite ? everyoneOverwrite.allow.toArray() : [];
  };

  const roles = [...guild.roles.cache.values()]
    .sort((a, b) => b.position - a.position)
    .map((role) => ({
      id: role.id,
      name: role.name,
      color: normalizeHexColor(role.color),
      hoist: role.hoist,
      managed: Boolean(role.managed),
      isEveryone: role.id === guild.id,
      position: role.position,
      permissions: role.permissions.toArray()
    }));

  const categories = [...guild.channels.cache.values()]
    .filter((channel) => channel.type === ChannelType.GuildCategory)
    .sort((a, b) => a.position - b.position)
    .map((category) => ({
      id: category.id,
      name: category.name,
      permissions: getEveryonePermissions(category),
      channels: [...guild.channels.cache.values()]
        .filter((channel) => channel.parentId === category.id && channel.type !== ChannelType.GuildCategory)
        .sort((a, b) => a.position - b.position)
        .map((channel) => ({
          id: channel.id,
          name: channel.name,
          type: toChannelType(channel),
          topic: channel.topic || '',
          parentId: category.id,
          permissions: getEveryonePermissions(channel)
        }))
    }));

  const uncategorizedChannels = [...guild.channels.cache.values()]
    .filter((channel) => !channel.parentId && channel.type !== ChannelType.GuildCategory)
    .sort((a, b) => a.position - b.position)
    .map((channel) => ({
      id: channel.id,
      name: channel.name,
      type: toChannelType(channel),
      topic: channel.topic || '',
      parentId: null,
      permissions: getEveryonePermissions(channel)
    }));

  if (uncategorizedChannels.length > 0) {
    categories.unshift({
      id: 'uncategorized',
      name: 'Uncategorized',
      channels: uncategorizedChannels
    });
  }

  // All text channels for dropdowns (Log Channel, Purge Target, etc.)
  const textChannels = [...guild.channels.cache.values()]
    .filter((channel) => channel.isTextBased && channel.isTextBased() && channel.type !== ChannelType.GuildCategory)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((channel) => {
      const parentCat = channel.parentId ? guild.channels.cache.get(channel.parentId) : null;
      return {
        id: channel.id,
        name: channel.name,
        categoryName: parentCat ? parentCat.name : 'Uncategorized',
        parentId: channel.parentId || null
      };
    });

  const previewChannels = [...guild.channels.cache.values()]
    .filter((channel) => channel.isTextBased && channel.isTextBased())
    .slice(0, 10);

  const messages = {};

  for (const channel of previewChannels) {
    try {
      const channelMessages = await channel.messages.fetch({ limit: 3 });

      messages[channel.id] = channelMessages
        .map((message) => ({
          id: message.id,
          author: message.author?.username || 'Unknown',
          content: message.content || '(Tidak ada text / hanya attachment)',
          timestamp: new Date(message.createdTimestamp).toISOString()
        }))
        .reverse();
    } catch {
      messages[channel.id] = [];
    }
  }

  const settings = guildSettings.get(guild.id) || { logChannelId: '' };

  return {
    id: guild.id,
    name: guild.name,
    memberCount: guild.memberCount,
    icon: guild.iconURL() || null,
    roles,
    categories,
    textChannels,
    messages,
    settings
  };
};

client.once('ready', () => {
  console.log(`🤖 Bot Manager Online sebagai: ${client.user.tag}`);
});

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Bot Manager siap menerima request.'
  });
});

// Guild snapshot
app.get('/api/guild/:guildId', async (req, res) => {
  const { guildId } = req.params;

  if (!guildId) {
    return res.status(400).json({
      success: false,
      message: 'Guild ID wajib diisi.'
    });
  }

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);

    if (!guild) {
      return res.status(404).json({
        success: false,
        message: 'Bot Manager tidak ditemukan di Guild ID tersebut. Pastikan bot sudah diundang ke server.'
      });
    }

    const snapshot = await buildGuildSnapshot(guild);

    return res.json({
      success: true,
      guild: snapshot
    });
  } catch (error) {
    console.error('Error fetching guild data:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data guild.',
      error: error.message
    });
  }
});

// Save guild settings (e.g. logChannelId)
app.post('/api/guild/:guildId/settings', async (req, res) => {
  const { guildId } = req.params;
  const { logChannelId } = req.body;

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({ success: false, message: 'Guild tidak ditemukan.' });
    }

    const prevSetting = guildSettings.get(guildId) || {};
    const newLogChannelId = (logChannelId || '').trim();
    guildSettings.set(guildId, { ...prevSetting, logChannelId: newLogChannelId });

    if (newLogChannelId) {
      await sendDiscordLog(guild, newLogChannelId, {
        title: '🔔 Channel Log Diaktifkan',
        description: `Channel ini telah dipilih untuk menerima seluruh log aktivitas Discord Auto Setup Builder (penghapusan, pengeditan role/channel, setup, dan bulk delete).`,
        color: 0x22c55e,
        fields: [
          { name: 'Server', value: guild.name, inline: true },
          { name: 'Channel ID', value: newLogChannelId, inline: true }
        ]
      });
    }

    return res.json({
      success: true,
      message: newLogChannelId
        ? 'Channel log Discord berhasil disimpan dan diuji!'
        : 'Channel log Discord dinonaktifkan (tidak akan ada notifikasi).',
      settings: guildSettings.get(guildId)
    });
  } catch (error) {
    console.error('Error saving guild settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan pengaturan guild.',
      error: error.message
    });
  }
});

// Test discord log
app.post('/api/guild/:guildId/test-log', async (req, res) => {
  const { guildId } = req.params;
  const { logChannelId } = req.body;

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({ success: false, message: 'Guild tidak ditemukan.' });
    }

    const targetChannel = logChannelId || guildSettings.get(guildId)?.logChannelId;
    if (!targetChannel) {
      return res.status(400).json({
        success: false,
        message: 'Masukkan ID Channel Log terlebih dahulu.'
      });
    }

    const channel =
      guild.channels.cache.get(targetChannel) ||
      (await guild.channels.fetch(targetChannel).catch(() => null));

    if (!channel || !channel.isTextBased()) {
      return res.status(404).json({
        success: false,
        message: 'Channel log tidak ditemukan atau bukan text channel yang dapat dikirimi pesan.'
      });
    }

    await sendDiscordLog(guild, targetChannel, {
      title: '🧪 Test Notifikasi Log Discord',
      description: 'Pesan ini adalah test untuk memastikan Bot Manager memiliki izin mengirim pesan embed di channel ini.',
      color: 0x8b5cf6,
      fields: [
        { name: 'Status', value: '✅ Terhubung & Aktif', inline: true },
        { name: 'Target Channel', value: `#${channel.name}`, inline: true }
      ]
    });

    return res.json({
      success: true,
      message: `Pesan test log berhasil dikirim ke channel #${channel.name}!`
    });
  } catch (error) {
    console.error('Error sending test log:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengirim test log.',
      error: error.message
    });
  }
});

// Single role delete
app.delete('/api/guild/:guildId/roles/:roleId', async (req, res) => {
  const { guildId, roleId } = req.params;
  const logChannelId = req.headers['x-log-channel-id'] || req.query.logChannelId;

  if (!guildId || !roleId) {
    return res.status(400).json({
      success: false,
      message: 'Guild ID dan Role ID wajib diisi.'
    });
  }

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({
        success: false,
        message: 'Guild tidak ditemukan.'
      });
    }

    const role = guild.roles.cache.get(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role tidak ditemukan di guild ini.'
      });
    }

    const roleName = role.name;
    const roleColor = normalizeHexColor(role.color);

    // Check hierarchy
    const botMember = await guild.members.fetchMe().catch(() => null);
    if (botMember && role.position >= botMember.roles.highest.position) {
      return res.status(403).json({
        success: false,
        message: `Tidak dapat menghapus role "${role.name}" karena posisinya sama atau lebih tinggi dari role bot.`
      });
    }

    await role.delete(`Deleted via Discord Auto Setup Builder`);

    // Log to Discord (opsional)
    await sendDiscordLog(guild, logChannelId, {
      title: '🗑️ Role Dihapus',
      description: `Role **${roleName}** telah dihapus dari server.`,
      color: 0xef4444,
      fields: [
        { name: 'Nama Role', value: roleName, inline: true },
        { name: 'Warna Sebelumnya', value: roleColor, inline: true }
      ]
    });

    return res.json({
      success: true,
      message: `Role ${roleName} berhasil dihapus.`
    });
  } catch (error) {
    console.error('Error deleting guild role:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus role.',
      error: error.message
    });
  }
});

// Edit role & permissions
app.patch('/api/guild/:guildId/roles/:roleId', async (req, res) => {
  const { guildId, roleId } = req.params;
  const { name, color, hoist, permissions } = req.body;
  const logChannelId = req.headers['x-log-channel-id'] || req.body.logChannelId;

  if (!guildId || !roleId) {
    return res.status(400).json({
      success: false,
      message: 'Guild ID dan Role ID wajib diisi.'
    });
  }

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({
        success: false,
        message: 'Guild tidak ditemukan.'
      });
    }

    const role = guild.roles.cache.get(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role tidak ditemukan di guild ini.'
      });
    }

    const botMember = await guild.members.fetchMe().catch(() => null);
    if (botMember && role.position >= botMember.roles.highest.position && role.id !== guild.id) {
      return res.status(403).json({
        success: false,
        message: `Tidak dapat mengedit role "${role.name}" karena posisinya sama atau lebih tinggi dari role bot. Naikkan posisi role bot di Discord.`
      });
    }

    const oldName = role.name;
    const oldColor = normalizeHexColor(role.color);
    const oldHoist = Boolean(role.hoist);
    const oldPermissions = role.permissions.toArray();

    const updatePayload = {};
    const logFields = [];

    if (name && name.trim() && name.trim() !== oldName) {
      updatePayload.name = name.trim();
      logFields.push({ name: 'Nama Role', value: `${oldName} ➔ ${updatePayload.name}`, inline: true });
    }

    if (color && color !== oldColor) {
      updatePayload.color = color;
      logFields.push({ name: 'Warna', value: `${oldColor} ➔ ${color}`, inline: true });
    }

    if (hoist !== undefined && Boolean(hoist) !== oldHoist) {
      updatePayload.hoist = Boolean(hoist);
      logFields.push({ name: 'Tampilkan Terpisah (Hoist)', value: hoist ? 'Ya' : 'Tidak', inline: true });
    }

    if (Array.isArray(permissions)) {
      const validPermissions = permissions.filter((p) => p in PermissionsBitField.Flags);
      updatePayload.permissions = validPermissions;
      const added = validPermissions.filter((p) => !oldPermissions.includes(p));
      const removed = oldPermissions.filter((p) => !validPermissions.includes(p));

      if (added.length > 0 || removed.length > 0) {
        const changesText = [];
        if (added.length > 0) changesText.push(`+ Ditambahkan (${added.length}): ${added.slice(0, 10).join(', ')}${added.length > 10 ? '...' : ''}`);
        if (removed.length > 0) changesText.push(`- Dihapus (${removed.length}): ${removed.slice(0, 10).join(', ')}${removed.length > 10 ? '...' : ''}`);
        logFields.push({ name: 'Perubahan Permissions', value: changesText.join('\n'), inline: false });
      }
    }

    // Role @everyone tidak boleh diedit nama, warna, atau hoist-nya oleh Discord API
    if (role.id === guild.id) {
      delete updatePayload.name;
      delete updatePayload.color;
      delete updatePayload.hoist;
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.json({
        success: true,
        message: 'Tidak ada perubahan pada role.'
      });
    }

    await role.edit({
      ...updatePayload,
      reason: 'Role updated via Discord Auto Setup Builder'
    });

    // Send Discord Log (opsional)
    await sendDiscordLog(guild, logChannelId, {
      title: '🛡️ Role Diperbarui',
      description: `Role **${role.name}** berhasil diedit.`,
      color: 0x3b82f6,
      fields: logFields
    });

    return res.json({
      success: true,
      message: `Role "${role.name}" berhasil diperbarui!`
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui role.',
      error: error.message
    });
  }
});

// Single channel delete
app.delete('/api/guild/:guildId/channels/:channelId', async (req, res) => {
  const { guildId, channelId } = req.params;
  const logChannelId = req.headers['x-log-channel-id'] || req.query.logChannelId;

  if (!guildId || !channelId) {
    return res.status(400).json({
      success: false,
      message: 'Guild ID dan Channel ID wajib diisi.'
    });
  }

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({
        success: false,
        message: 'Guild tidak ditemukan.'
      });
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel tidak ditemukan di guild ini.'
      });
    }

    const channelName = channel.name;
    const channelType = channel.type === ChannelType.GuildVoice ? 'Voice' : 'Text';

    await channel.delete(`Deleted via Discord Auto Setup Builder`);

    // Log to Discord (opsional)
    await sendDiscordLog(guild, logChannelId, {
      title: '🗑️ Channel Dihapus',
      description: `Channel **${channelType === 'Voice' ? '🔊' : '#'}${channelName}** telah dihapus.`,
      color: 0xef4444,
      fields: [
        { name: 'Tipe Channel', value: channelType, inline: true },
        { name: 'Nama Channel', value: channelName, inline: true }
      ]
    });

    return res.json({
      success: true,
      message: `Channel ${channelName} berhasil dihapus.`
    });
  } catch (error) {
    console.error('Error deleting guild channel:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus channel.',
      error: error.message
    });
  }
});

// Edit channel (name, topic, parent category)
app.patch('/api/guild/:guildId/channels/:channelId', async (req, res) => {
  const { guildId, channelId } = req.params;
  const { name, topic, parentId, permissions } = req.body;
  const logChannelId = req.headers['x-log-channel-id'] || req.body.logChannelId;

  if (!guildId || !channelId) {
    return res.status(400).json({
      success: false,
      message: 'Guild ID dan Channel ID wajib diisi.'
    });
  }

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({
        success: false,
        message: 'Guild tidak ditemukan.'
      });
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel tidak ditemukan di guild ini.'
      });
    }

    const oldName = channel.name;
    const updatePayload = {};
    const logFields = [];

    if (name && name.trim() && name.trim() !== oldName) {
      const sanitizedName = channel.type === ChannelType.GuildVoice
        ? name.trim()
        : name.trim().toLowerCase().replace(/\s+/g, '-');
      updatePayload.name = sanitizedName;
      logFields.push({ name: 'Nama Channel', value: `#${oldName} ➔ #${sanitizedName}`, inline: true });
    }

    if (topic !== undefined && channel.isTextBased()) {
      updatePayload.topic = topic;
      logFields.push({ name: 'Deskripsi / Topic', value: topic || '(dikosongkan)', inline: false });
    }

    if (parentId !== undefined) {
      const targetParent = parentId === 'uncategorized' || !parentId ? null : parentId;
      if (targetParent !== channel.parentId) {
        updatePayload.parent = targetParent;
        const oldParentName = channel.parent ? channel.parent.name : 'Uncategorized';
        const newParentName = targetParent ? guild.channels.cache.get(targetParent)?.name || targetParent : 'Uncategorized';
        logFields.push({ name: 'Kategori Induk', value: `${oldParentName} ➔ ${newParentName}`, inline: true });
      }
    }

    if (Array.isArray(permissions)) {
      updatePayload.permissionOverwrites = buildChannelOverwrites(guild, permissions, channel);
      logFields.push({ name: 'Hak Izin Channel', value: `${permissions.length} izin diaktifkan`, inline: true });
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.json({
        success: true,
        message: 'Tidak ada perubahan pada channel.'
      });
    }

    await channel.edit({
      ...updatePayload,
      reason: 'Channel updated via Discord Auto Setup Builder'
    });

    // Send Discord Log (opsional)
    await sendDiscordLog(guild, logChannelId, {
      title: '✏️ Channel Diperbarui',
      description: `Channel **#${channel.name}** telah diperbarui.`,
      color: 0x3b82f6,
      fields: logFields
    });

    return res.json({
      success: true,
      message: `Channel #${channel.name} berhasil diperbarui!`
    });
  } catch (error) {
    console.error('Error updating channel:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui channel.',
      error: error.message
    });
  }
});

// Category delete WITH CASCADE DELETE OF INNER CHANNELS (Requirement 1)
app.delete('/api/guild/:guildId/categories/:categoryId', async (req, res) => {
  const { guildId, categoryId } = req.params;
  const logChannelId = req.headers['x-log-channel-id'] || req.query.logChannelId;

  if (!guildId || !categoryId) {
    return res.status(400).json({
      success: false,
      message: 'Guild ID dan Category ID wajib diisi.'
    });
  }

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({
        success: false,
        message: 'Guild tidak ditemukan.'
      });
    }

    const category = guild.channels.cache.get(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category tidak ditemukan di guild ini.'
      });
    }

    if (category.type !== ChannelType.GuildCategory) {
      return res.status(400).json({
        success: false,
        message: 'Channel tersebut bukan category.'
      });
    }

    const categoryName = category.name;

    // 1. Ambil seluruh channel di dalam category ini untuk dihapus juga (Cascade Delete)
    const childChannels = [...guild.channels.cache.values()].filter(
      (channel) => channel.parentId === categoryId
    );

    const deletedChannelNames = [];
    for (const child of childChannels) {
      try {
        const name = child.name;
        await child.delete('Deleted with parent category via Discord Auto Setup Builder');
        deletedChannelNames.push(name);
      } catch (childErr) {
        console.warn(`Gagal menghapus child channel ${child.name}:`, childErr.message);
      }
    }

    // 2. Hapus category itu sendiri
    await category.delete(`Deleted via Discord Auto Setup Builder`);

    // 3. Kirim Discord log (opsional)
    await sendDiscordLog(guild, logChannelId, {
      title: '🗑️ Category & Channel Terkait Dihapus',
      description: `Category **${categoryName}** telah dihapus beserta **${deletedChannelNames.length} channel** di dalamnya.`,
      color: 0xef4444,
      fields: [
        { name: 'Category Dihapus', value: categoryName, inline: true },
        { name: 'Jumlah Channel Ikut Dihapus', value: `${deletedChannelNames.length} channel`, inline: true },
        ...(deletedChannelNames.length > 0
          ? [
              {
                name: 'Daftar Channel yang Terhapus',
                value: deletedChannelNames.map((n) => `• #${n}`).slice(0, 20).join('\n') +
                  (deletedChannelNames.length > 20 ? `\n...dan ${deletedChannelNames.length - 20} lainnya` : '')
              }
            ]
          : [])
      ]
    });

    return res.json({
      success: true,
      message: `Category "${categoryName}" beserta ${deletedChannelNames.length} channel di dalamnya berhasil dihapus.`
    });
  } catch (error) {
    console.error('Error deleting guild category:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus category.',
      error: error.message
    });
  }
});

// Create Channel inside Category
app.post('/api/guild/:guildId/categories/:categoryId/channels', async (req, res) => {
  const { guildId, categoryId } = req.params;
  const { name, type = 'text', topic = '', permissions = [] } = req.body;
  const logChannelId = req.headers['x-log-channel-id'] || req.body.logChannelId;

  if (!guildId || !categoryId || !name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Guild ID, Category ID, dan nama channel wajib diisi.'
    });
  }

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({ success: false, message: 'Guild tidak ditemukan.' });
    }

    const category = guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) {
      return res.status(404).json({ success: false, message: 'Category tidak ditemukan di guild ini.' });
    }

    const sanitizedName = type === 'voice'
      ? name.trim()
      : name.trim().toLowerCase().replace(/\s+/g, '-');

    let overwrites;
    if (Array.isArray(permissions) && permissions.length > 0) {
      overwrites = buildChannelOverwrites(guild, permissions);
    }

    const newChannel = await guild.channels.create({
      name: sanitizedName,
      type: type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText,
      parent: category.id,
      topic: type === 'voice' ? undefined : topic,
      permissionOverwrites: overwrites,
      reason: 'Created via Discord Auto Setup Builder'
    });

    await sendDiscordLog(guild, logChannelId, {
      title: '➕ Channel Baru Dibuat di Kategori',
      description: `Channel **#${newChannel.name}** berhasil dibuat di dalam kategori **${category.name}**.`,
      color: 0x22c55e,
      fields: [
        { name: 'Kategori', value: category.name, inline: true },
        { name: 'Tipe Channel', value: type === 'voice' ? 'Voice' : 'Text', inline: true }
      ]
    });

    return res.json({
      success: true,
      message: `Channel #${newChannel.name} berhasil dibuat!`,
      channel: {
        id: newChannel.id,
        name: newChannel.name,
        type: type === 'voice' ? 'voice' : 'text',
        parentId: category.id
      }
    });
  } catch (err) {
    console.error('Error creating channel in category:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat channel: ' + err.message
    });
  }
});

// Edit category & permissions
app.patch('/api/guild/:guildId/categories/:categoryId', async (req, res) => {
  const { guildId, categoryId } = req.params;
  const { name, permissions } = req.body;
  const logChannelId = req.headers['x-log-channel-id'] || req.body.logChannelId;

  if (!guildId || !categoryId) {
    return res.status(400).json({
      success: false,
      message: 'Guild ID dan Category ID wajib diisi.'
    });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Nama category baru wajib diisi.'
    });
  }

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({
        success: false,
        message: 'Guild tidak ditemukan.'
      });
    }

    const category = guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category tidak ditemukan di guild ini.'
      });
    }

    const oldName = category.name;
    const newName = name.trim();

    const editPayload = {};
    if (newName && newName !== oldName) {
      editPayload.name = newName;
    }

    if (Array.isArray(permissions)) {
      editPayload.permissionOverwrites = buildChannelOverwrites(guild, permissions, category);
    }

    if (Object.keys(editPayload).length === 0) {
      return res.json({
        success: true,
        message: 'Tidak ada perubahan pada category.'
      });
    }

    await category.edit({
      ...editPayload,
      reason: 'Category updated via Discord Auto Setup Builder'
    });

    // Send Discord Log (opsional)
    await sendDiscordLog(guild, logChannelId, {
      title: '✏️ Category Diperbarui',
      description: `Nama category telah diubah.`,
      color: 0x3b82f6,
      fields: [
        { name: 'Sebelum', value: oldName, inline: true },
        { name: 'Sesudah', value: newName, inline: true }
      ]
    });

    return res.json({
      success: true,
      message: `Category "${oldName}" berhasil diubah menjadi "${newName}".`
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengubah category.',
      error: error.message
    });
  }
});

// Bulk delete channels (Requirement 6)
app.post('/api/guild/:guildId/bulk-delete/channels', async (req, res) => {
  const { guildId } = req.params;
  const { channelIds } = req.body;
  const logChannelId = req.headers['x-log-channel-id'] || req.body.logChannelId;

  if (!guildId || !Array.isArray(channelIds) || channelIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Guild ID dan daftar channelIds wajib diisi.'
    });
  }

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({ success: false, message: 'Guild tidak ditemukan.' });
    }

    const deleted = [];
    const errors = [];

    for (const channelId of channelIds) {
      const channel = guild.channels.cache.get(channelId);
      if (channel) {
        try {
          const name = channel.name;
          await channel.delete('Bulk deleted via Discord Auto Setup Builder');
          deleted.push(name);
        } catch (err) {
          errors.push(`${channel.name}: ${err.message}`);
        }
      }
    }

    // Send Discord Log (opsional)
    await sendDiscordLog(guild, logChannelId, {
      title: '🧹 Bulk Delete Channels Selesai',
      description: `Sebanyak **${deleted.length} channel** berhasil dihapus secara masal.`,
      color: 0x8b5cf6,
      fields: [
        { name: 'Total Dihapus', value: `${deleted.length} channel`, inline: true },
        ...(deleted.length > 0
          ? [
              {
                name: 'Channel Terhapus',
                value: deleted.map((n) => `• #${n}`).slice(0, 20).join('\n') +
                  (deleted.length > 20 ? `\n...dan ${deleted.length - 20} lainnya` : '')
              }
            ]
          : [])
      ]
    });

    return res.json({
      success: true,
      message: `Berhasil menghapus ${deleted.length} channel secara masal.`,
      deletedCount: deleted.length,
      errors
    });
  } catch (error) {
    console.error('Error in bulk-delete channels:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal melakukan bulk delete channels.',
      error: error.message
    });
  }
});

// Bulk delete roles (Requirement 6)
app.post('/api/guild/:guildId/bulk-delete/roles', async (req, res) => {
  const { guildId } = req.params;
  const { roleIds } = req.body;
  const logChannelId = req.headers['x-log-channel-id'] || req.body.logChannelId;

  if (!guildId || !Array.isArray(roleIds) || roleIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Guild ID dan daftar roleIds wajib diisi.'
    });
  }

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({ success: false, message: 'Guild tidak ditemukan.' });
    }

    const botMember = await guild.members.fetchMe().catch(() => null);
    const botHighest = botMember?.roles?.highest?.position || 0;

    const deleted = [];
    const errors = [];

    for (const roleId of roleIds) {
      if (roleId === guild.id) continue; // Skip @everyone
      const role = guild.roles.cache.get(roleId);
      if (role) {
        if (role.managed) {
          errors.push(`${role.name}: Role dikelola oleh bot/integrasi Discord (managed).`);
          continue;
        }
        if (role.position >= botHighest) {
          errors.push(`${role.name}: Posisi role sama atau di atas role bot.`);
          continue;
        }

        try {
          const name = role.name;
          await role.delete('Bulk deleted via Discord Auto Setup Builder');
          deleted.push(name);
        } catch (err) {
          errors.push(`${role.name}: ${err.message}`);
        }
      }
    }

    // Send Discord Log (opsional)
    await sendDiscordLog(guild, logChannelId, {
      title: '🧹 Bulk Delete Roles Selesai',
      description: `Sebanyak **${deleted.length} role** berhasil dihapus secara masal.`,
      color: 0x8b5cf6,
      fields: [
        { name: 'Total Dihapus', value: `${deleted.length} role`, inline: true },
        ...(deleted.length > 0
          ? [
              {
                name: 'Role Terhapus',
                value: deleted.map((n) => `• ${n}`).slice(0, 20).join('\n') +
                  (deleted.length > 20 ? `\n...dan ${deleted.length - 20} lainnya` : '')
              }
            ]
          : [])
      ]
    });

    return res.json({
      success: true,
      message: `Berhasil menghapus ${deleted.length} role secara masal.`,
      deletedCount: deleted.length,
      errors
    });
  } catch (error) {
    console.error('Error in bulk-delete roles:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal melakukan bulk delete roles.',
      error: error.message
    });
  }
});

// Bulk delete categories with cascade (Requirement 6)
app.post('/api/guild/:guildId/bulk-delete/categories', async (req, res) => {
  const { guildId } = req.params;
  const { categoryIds } = req.body;
  const logChannelId = req.headers['x-log-channel-id'] || req.body.logChannelId;

  if (!guildId || !Array.isArray(categoryIds) || categoryIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Guild ID dan daftar categoryIds wajib diisi.'
    });
  }

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({ success: false, message: 'Guild tidak ditemukan.' });
    }

    const deletedCategories = [];
    let totalChannelsDeleted = 0;
    const errors = [];

    for (const categoryId of categoryIds) {
      const category = guild.channels.cache.get(categoryId);
      if (category && category.type === ChannelType.GuildCategory) {
        try {
          const categoryName = category.name;
          const childChannels = [...guild.channels.cache.values()].filter(
            (ch) => ch.parentId === categoryId
          );

          for (const child of childChannels) {
            try {
              await child.delete('Bulk deleted with category via Discord Auto Setup Builder');
              totalChannelsDeleted++;
            } catch (cErr) {
              errors.push(`${child.name}: ${cErr.message}`);
            }
          }

          await category.delete('Bulk deleted via Discord Auto Setup Builder');
          deletedCategories.push(categoryName);
        } catch (err) {
          errors.push(`${category.name}: ${err.message}`);
        }
      }
    }

    // Send Discord Log (opsional)
    await sendDiscordLog(guild, logChannelId, {
      title: '🧹 Bulk Delete Categories Selesai',
      description: `Sebanyak **${deletedCategories.length} category** dan **${totalChannelsDeleted} channel** di dalamnya berhasil dihapus.`,
      color: 0x8b5cf6,
      fields: [
        { name: 'Category Dihapus', value: `${deletedCategories.length}`, inline: true },
        { name: 'Channel Dihapus', value: `${totalChannelsDeleted}`, inline: true },
        ...(deletedCategories.length > 0
          ? [
              {
                name: 'Daftar Category Terhapus',
                value: deletedCategories.map((n) => `• ${n}`).slice(0, 15).join('\n')
              }
            ]
          : [])
      ]
    });

    return res.json({
      success: true,
      message: `Berhasil menghapus ${deletedCategories.length} category dan ${totalChannelsDeleted} channel di dalamnya.`,
      categoryCount: deletedCategories.length,
      channelCount: totalChannelsDeleted,
      errors
    });
  } catch (error) {
    console.error('Error in bulk-delete categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal melakukan bulk delete categories.',
      error: error.message
    });
  }
});

// Channel message purge / bulk delete messages (Requirement 6)
app.post('/api/guild/:guildId/channels/:channelId/purge', async (req, res) => {
  const { guildId, channelId } = req.params;
  const { amount = 10 } = req.body;
  const logChannelId = req.headers['x-log-channel-id'] || req.body.logChannelId;

  if (!guildId || !channelId) {
    return res.status(400).json({
      success: false,
      message: 'Guild ID dan Channel ID wajib diisi.'
    });
  }

  const cleanAmount = Math.max(1, Math.min(100, Number(amount) || 10));

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({ success: false, message: 'Guild tidak ditemukan.' });
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) {
      return res.status(404).json({
        success: false,
        message: 'Channel tidak ditemukan atau bukan channel teks.'
      });
    }

    let deletedCount = 0;
    if (cleanAmount === 1) {
      const messages = await channel.messages.fetch({ limit: 1 });
      const first = messages.first();
      if (first) {
        await first.delete();
        deletedCount = 1;
      }
    } else {
      const deletedMessages = await channel.bulkDelete(cleanAmount, true);
      deletedCount = deletedMessages.size;
    }

    // Send Discord Log (opsional)
    await sendDiscordLog(guild, logChannelId, {
      title: '🧹 Bulk Delete Pesan (Purge)',
      description: `Sebanyak **${deletedCount} pesan** telah dibersihkan di channel **#${channel.name}**.`,
      color: 0x8b5cf6,
      fields: [
        { name: 'Channel', value: `#${channel.name}`, inline: true },
        { name: 'Jumlah Pesan Dibersihkan', value: `${deletedCount} pesan`, inline: true }
      ]
    });

    return res.json({
      success: true,
      message: `Berhasil membersihkan ${deletedCount} pesan di channel #${channel.name}.`,
      deletedCount
    });
  } catch (error) {
    console.error('Error purging messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membersihkan pesan. Catatan: Discord tidak mengizinkan bulk delete pesan yang lebih tua dari 14 hari.',
      error: error.message
    });
  }
});

// Auto setup
app.post('/api/setup', async (req, res) => {
  const { guildId, builderEnabled = true, roles, categories, logChannelId } = req.body;
  const activeLogChannel = req.headers['x-log-channel-id'] || logChannelId;

  if (!guildId) {
    return res.status(400).json({
      success: false,
      message: 'Guild ID wajib diisi.'
    });
  }

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);

    if (!guild) {
      return res.status(404).json({
        success: false,
        message: 'Bot Manager tidak ditemukan di Guild ID tersebut. Pastikan bot sudah diundang ke server.'
      });
    }

    // Jika builder dinonaktifkan, tidak membuat role/category/channel apapun
    if (!builderEnabled) {
      return res.json({
        success: true,
        message: `Mode builder dinonaktifkan. Tidak ada role atau channel yang dibuat pada server ${guild.name}.`
      });
    }

    const createdRolesCount = Array.isArray(roles) ? roles.length : 0;
    let createdChannelsCount = 0;

    if (Array.isArray(roles)) {
      for (const roleData of roles) {
        const rolePerms = Array.isArray(roleData.permissions)
          ? roleData.permissions.filter((p) => p in PermissionsBitField.Flags)
          : [];

        await guild.roles.create({
          name: roleData.name,
          color: roleData.color || '#99AAB5',
          hoist: Boolean(roleData.hoist),
          permissions: rolePerms,
          reason: 'Auto Setup via Discord Auto Setup Builder'
        });
      }
    }

    if (Array.isArray(categories)) {
      for (const catData of categories) {
        let catOverwrites;
        if (Array.isArray(catData.permissions) && catData.permissions.length > 0) {
          catOverwrites = buildChannelOverwrites(guild, catData.permissions);
        }
        const categoryChannel = await guild.channels.create({
          name: catData.name,
          type: ChannelType.GuildCategory,
          permissionOverwrites: catOverwrites
        });

        if (Array.isArray(catData.channels)) {
          for (const chData of catData.channels) {
            let chOverwrites;
            if (Array.isArray(chData.permissions) && chData.permissions.length > 0) {
              chOverwrites = buildChannelOverwrites(guild, chData.permissions);
            }
            await guild.channels.create({
              name: chData.name,
              type: chData.type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText,
              parent: categoryChannel.id,
              permissionOverwrites: chOverwrites
            });
            createdChannelsCount++;
          }
        }
      }
    }

    // Send Discord Log (opsional)
    await sendDiscordLog(guild, activeLogChannel, {
      title: '🚀 Server Auto Setup Telah Dijalankan',
      description: `Setup otomatis server berhasil dieksekusi melalui Discord Auto Setup Builder.`,
      color: 0x22c55e,
      fields: [
        { name: 'Role Dibuat', value: `${createdRolesCount}`, inline: true },
        { name: 'Channel Dibuat', value: `${createdChannelsCount}`, inline: true },
      ]
    });

    return res.json({
      success: true,
      message: `Berhasil melakukan auto setup pada server ${guild.name}!`
    });
  } catch (error) {
    console.error('Error executing server setup:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengeksekusi setup server.',
      error: error.message
    });
  }
});

if (process.env.DISCORD_BOT_TOKEN) {
  client.login(process.env.DISCORD_BOT_TOKEN);
} else {
  console.warn('⚠️ DISCORD_BOT_TOKEN belum diatur. Bot Manager belum dapat terhubung ke Discord.');
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API Server berjalan di port ${PORT}`);
});
