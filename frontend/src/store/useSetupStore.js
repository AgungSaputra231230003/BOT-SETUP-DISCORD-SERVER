import { create } from 'zustand';
import { presetCatalog } from '../data/templates';

const makeId = (prefix = 'id') =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

const baseRoles = [
  { id: 'role-admin', name: 'Admin', color: '#FF4D4F', hoist: true, permissions: [] },
  { id: 'role-moderator', name: 'Moderator', color: '#00C2FF', hoist: true, permissions: [] },
  { id: 'role-member', name: 'Member', color: '#99AAB5', hoist: false, permissions: [] }
];

const baseCategories = [
  {
    id: 'category-info',
    name: '📢 INFORMASI',
    permissions: [],
    channels: [
      { id: 'channel-rules', name: 'rules', type: 'text', permissions: [] },
      { id: 'channel-announcements', name: 'announcements', type: 'text', permissions: [] }
    ]
  },
  {
    id: 'category-community',
    name: '💬 COMMUNITY',
    permissions: [],
    channels: [
      { id: 'channel-general', name: 'general-chat', type: 'text', permissions: [] },
      { id: 'channel-lobby', name: 'Lobby', type: 'voice', permissions: [] }
    ]
  }
];

const normalizePreset = (preset) => ({
  roles: preset.roles.map((role) => ({ ...role, id: makeId('role'), permissions: role.permissions || [] })),
  categories: preset.categories.map((category) => ({
    ...category,
    id: makeId('category'),
    permissions: category.permissions || [],
    channels: category.channels.map((channel) => ({
      ...channel,
      id: makeId('channel'),
      permissions: channel.permissions || []
    }))
  }))
});

export const useSetupStore = create((set, get) => ({
  guildId: '',
  guildInfo: {
    name: '',
    memberCount: 0,
    icon: null
  },
  guildMessages: {},
  guildSettings: {
    logChannelId: ''
  },
  logChannelId: '',
  availableTextChannels: [],
  guildRoles: [],
  guildCategories: [],
  isSyncingGuild: false,
  lastGuildError: '',
  builderEnabled: true,
  setBuilderEnabled: (value) => set({ builderEnabled: Boolean(value) }),
  roles: baseRoles,
  categories: baseCategories,

  setGuildId: (value) => set({ guildId: value }),
  setLogChannelId: (value) => set({ logChannelId: value }),

  syncGuildData: async (targetGuildId) => {
    const idToSync = targetGuildId || get().guildId;
    if (!idToSync || !idToSync.trim()) {
      return { success: false, message: 'Guild ID belum diisi.' };
    }

    set({ isSyncingGuild: true, lastGuildError: '' });

    try {
      const response = await fetch(`http://localhost:5000/api/guild/${encodeURIComponent(idToSync.trim())}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal mengambil data guild.');
      }

      const { guild } = result;
      const serverLogChannel = guild?.settings?.logChannelId || '';

      set((state) => ({
        guildInfo: {
          name: guild?.name || state.guildInfo.name,
          memberCount: guild?.memberCount || state.guildInfo.memberCount,
          icon: guild?.icon || null
        },
        guildMessages: guild?.messages || {},
        guildSettings: guild?.settings || { logChannelId: '' },
        logChannelId: serverLogChannel || state.logChannelId || '',
        availableTextChannels: guild?.textChannels || [],
        guildRoles: guild?.roles || [],
        guildCategories: guild?.categories || [],
        isSyncingGuild: false,
        lastGuildError: ''
      }));

      return result;
    } catch (error) {
      set({
        isSyncingGuild: false,
        lastGuildError: error.message || 'Terjadi kesalahan saat mengambil data guild.'
      });
      return { success: false, message: error.message || 'Terjadi kesalahan saat mengambil data guild.' };
    }
  },

  // Save log channel setting to server
  saveLogChannelSettings: async (targetGuildId, channelId) => {
    const gid = targetGuildId || get().guildId;
    if (!gid) return { success: false, message: 'Guild ID wajib diisi.' };

    try {
      const response = await fetch(`http://localhost:5000/api/guild/${encodeURIComponent(gid)}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logChannelId: channelId })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan channel log.');
      }
      set({ logChannelId: channelId, guildSettings: { logChannelId: channelId } });
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Test send log message
  testLogChannel: async (targetGuildId, channelId) => {
    const gid = targetGuildId || get().guildId;
    const cid = channelId || get().logChannelId;
    if (!gid) return { success: false, message: 'Guild ID wajib diisi.' };
    if (!cid) return { success: false, message: 'Channel log belum dipilih.' };

    try {
      const response = await fetch(`http://localhost:5000/api/guild/${encodeURIComponent(gid)}/test-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logChannelId: cid })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengirim test log.');
      }
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Delete category with cascade inner channels
  deleteGuildCategory: async (categoryId) => {
    const gid = get().guildId;
    const logId = get().logChannelId;
    if (!gid || !categoryId) return { success: false, message: 'Category ID wajib diisi.' };

    try {
      const response = await fetch(`http://localhost:5000/api/guild/${encodeURIComponent(gid)}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-log-channel-id': logId || ''
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghapus category.');
      }
      await get().syncGuildData(gid);
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Edit category (name and permissions)
  updateGuildCategory: async (categoryId, dataOrName) => {
    const gid = get().guildId;
    const logId = get().logChannelId;
    if (!gid || !categoryId) return { success: false, message: 'Category ID wajib diisi.' };

    const payload = typeof dataOrName === 'string' ? { name: dataOrName } : dataOrName;

    try {
      const response = await fetch(`http://localhost:5000/api/guild/${encodeURIComponent(gid)}/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-log-channel-id': logId || ''
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengedit category.');
      }
      await get().syncGuildData(gid);
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Add channel to existing category in guild
  createGuildChannelInCategory: async (categoryId, channelData) => {
    const gid = get().guildId;
    const logId = get().logChannelId;
    if (!gid || !categoryId) return { success: false, message: 'Category ID wajib diisi.' };

    try {
      const response = await fetch(`http://localhost:5000/api/guild/${encodeURIComponent(gid)}/categories/${categoryId}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-log-channel-id': logId || ''
        },
        body: JSON.stringify(channelData)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal membuat channel.');
      }
      await get().syncGuildData(gid);
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Delete channel
  deleteGuildChannel: async (channelId) => {
    const gid = get().guildId;
    const logId = get().logChannelId;
    if (!gid || !channelId) return { success: false, message: 'Channel ID wajib diisi.' };

    try {
      const response = await fetch(`http://localhost:5000/api/guild/${encodeURIComponent(gid)}/channels/${channelId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-log-channel-id': logId || ''
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghapus channel.');
      }
      await get().syncGuildData(gid);
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Edit channel (name, topic, parent category)
  updateGuildChannel: async (channelId, updateData) => {
    const gid = get().guildId;
    const logId = get().logChannelId;
    if (!gid || !channelId) return { success: false, message: 'Channel ID wajib diisi.' };

    try {
      const response = await fetch(`http://localhost:5000/api/guild/${encodeURIComponent(gid)}/channels/${channelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-log-channel-id': logId || ''
        },
        body: JSON.stringify(updateData)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal memperbarui channel.');
      }
      await get().syncGuildData(gid);
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Delete role
  deleteGuildRole: async (roleId) => {
    const gid = get().guildId;
    const logId = get().logChannelId;
    if (!gid || !roleId) return { success: false, message: 'Role ID wajib diisi.' };

    try {
      const response = await fetch(`http://localhost:5000/api/guild/${encodeURIComponent(gid)}/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-log-channel-id': logId || ''
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghapus role.');
      }
      await get().syncGuildData(gid);
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Edit role & permissions
  updateGuildRole: async (roleId, roleData) => {
    const gid = get().guildId;
    const logId = get().logChannelId;
    if (!gid || !roleId) return { success: false, message: 'Role ID wajib diisi.' };

    try {
      const response = await fetch(`http://localhost:5000/api/guild/${encodeURIComponent(gid)}/roles/${roleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-log-channel-id': logId || ''
        },
        body: JSON.stringify(roleData)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal memperbarui role.');
      }
      await get().syncGuildData(gid);
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Bulk delete channels
  bulkDeleteChannels: async (channelIds) => {
    const gid = get().guildId;
    const logId = get().logChannelId;
    if (!gid || !channelIds?.length) return { success: false, message: 'Pilih minimal 1 channel.' };

    try {
      const response = await fetch(`http://localhost:5000/api/guild/${encodeURIComponent(gid)}/bulk-delete/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-log-channel-id': logId || ''
        },
        body: JSON.stringify({ channelIds })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal bulk delete channels.');
      }
      await get().syncGuildData(gid);
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Bulk delete roles
  bulkDeleteRoles: async (roleIds) => {
    const gid = get().guildId;
    const logId = get().logChannelId;
    if (!gid || !roleIds?.length) return { success: false, message: 'Pilih minimal 1 role.' };

    try {
      const response = await fetch(`http://localhost:5000/api/guild/${encodeURIComponent(gid)}/bulk-delete/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-log-channel-id': logId || ''
        },
        body: JSON.stringify({ roleIds })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal bulk delete roles.');
      }
      await get().syncGuildData(gid);
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Bulk delete categories (cascade channels)
  bulkDeleteCategories: async (categoryIds) => {
    const gid = get().guildId;
    const logId = get().logChannelId;
    if (!gid || !categoryIds?.length) return { success: false, message: 'Pilih minimal 1 category.' };

    try {
      const response = await fetch(`http://localhost:5000/api/guild/${encodeURIComponent(gid)}/bulk-delete/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-log-channel-id': logId || ''
        },
        body: JSON.stringify({ categoryIds })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal bulk delete categories.');
      }
      await get().syncGuildData(gid);
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Purge messages
  purgeMessages: async (channelId, amount) => {
    const gid = get().guildId;
    const logId = get().logChannelId;
    if (!gid || !channelId) return { success: false, message: 'Pilih text channel terlebih dahulu.' };

    try {
      const response = await fetch(`http://localhost:5000/api/guild/${encodeURIComponent(gid)}/channels/${channelId}/purge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-log-channel-id': logId || ''
        },
        body: JSON.stringify({ amount })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal membersihkan pesan.');
      }
      await get().syncGuildData(gid);
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  addRole: () =>
    set((state) => ({
      roles: [
        ...state.roles,
        { id: makeId('role'), name: 'New Role', color: '#99AAB5', hoist: false, permissions: [] }
      ]
    })),

  updateRole: (roleId, field, value) =>
    set((state) => ({
      roles: state.roles.map((role) =>
        role.id === roleId ? { ...role, [field]: value } : role
      )
    })),

  removeRole: (roleId) =>
    set((state) => ({
      roles: state.roles.filter((role) => role.id !== roleId)
    })),

  addCategory: () =>
    set((state) => ({
      categories: [
        ...state.categories,
        {
          id: makeId('category'),
          name: 'New Category',
          permissions: [],
          channels: [{ id: makeId('channel'), name: 'welcome', type: 'text', permissions: [] }]
        }
      ]
    })),

  updateCategory: (categoryId, field, value) =>
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === categoryId ? { ...category, [field]: value } : category
      )
    })),

  removeCategory: (categoryId) =>
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== categoryId)
    })),

  addChannel: (categoryId, type = 'text') =>
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              channels: [
                ...category.channels,
                {
                  id: makeId('channel'),
                  name: type === 'voice' ? 'New Voice Room' : 'new-channel',
                  type,
                  permissions: []
                }
              ]
            }
          : category
      )
    })),

  updateChannel: (categoryId, channelId, field, value) =>
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              channels: category.channels.map((channel) =>
                channel.id === channelId ? { ...channel, [field]: value } : channel
              )
            }
          : category
      )
    })),

  removeChannel: (categoryId, channelId) =>
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              channels: category.channels.filter((channel) => channel.id !== channelId)
            }
          : category
      )
    })),

  clearAllBuilderRoles: () => set({ roles: [] }),

  clearAllBuilderCategories: () => set({ categories: [] }),

  loadPreset: (preset) => {
    const normalized = normalizePreset(preset || presetCatalog[0]);

    set({
      roles: normalized.roles,
      categories: normalized.categories
    });
  }
}));
