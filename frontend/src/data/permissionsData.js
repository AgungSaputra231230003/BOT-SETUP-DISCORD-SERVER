export const PERMISSION_GROUPS = [
  {
    category: 'Administrasi & Server',
    permissions: [
      { id: 'Administrator', label: 'Administrator', desc: 'Bypass semua izin (Izin tertinggi)', dangerous: true },
      { id: 'ManageGuild', label: 'Kelola Server', desc: 'Mengubah nama, ikon, dan wilayah server' },
      { id: 'ManageRoles', label: 'Kelola Role', desc: 'Membuat dan mengedit role di bawah role ini' },
      { id: 'ManageChannels', label: 'Kelola Channel', desc: 'Membuat, mengubah nama, atau menghapus channel' },
      { id: 'ViewAuditLog', label: 'Lihat Audit Log', desc: 'Melihat catatan log aktivitas moderator/admin' },
      { id: 'ManageWebhooks', label: 'Kelola Webhook', desc: 'Menambah atau mengedit webhook' },
      { id: 'ManageGuildExpressions', label: 'Kelola Emoji & Stiker', desc: 'Upload dan kelola emoji server' },
      { id: 'CreateExpressions', label: 'Create Expressions', desc: 'Allows members to add custom emoji, stickers, and sounds in this server.' },
      { id: 'ManageExpressions', label: 'Manage Expressions', desc: 'Allows members to edit or remove custom emoji, stickers, and sounds in this server.' },
      { id: 'ManageEvents', label: 'Manage Events', desc: 'Allows members to edit and cancel events.' },
      { id: 'CreateEvents', label: 'Create Events', desc: 'Allows members to create events.' }
    ]
  },
  {
    category: 'Keanggotaan & Moderasi',
    permissions: [
      { id: 'KickMembers', label: 'Kick Member', desc: 'Mengeluarkan anggota dari server' },
      { id: 'BanMembers', label: 'Ban Member', desc: 'Memblokir anggota dari server' },
      { id: 'ModerateMembers', label: 'Timeout Member', desc: 'Membungkam sementara anggota yang melanggar aturan' },
      { id: 'ManageNicknames', label: 'Kelola Nickname', desc: 'Mengubah nama panggilan anggota lain' },
      { id: 'ChangeNickname', label: 'Ganti Nickname Sendiri', desc: 'Mengubah nama panggilan akun sendiri' },
      { id: 'CreateInstantInvite', label: 'Buat Undangan', desc: 'Membuat link invite untuk orang lain' }
    ]
  },
  {
    category: 'Pesan & Obrolan (Text)',
    permissions: [
      { id: 'ViewChannel', label: 'Lihat Channel', desc: 'Melihat channel teks dan suara' },
      { id: 'SendMessages', label: 'Kirim Pesan', desc: 'Mengirim chat di channel teks' },
      { id: 'SendTTSMessages', label: 'Send Text-to-Speech Messages', desc: 'Allows members to send text-to-speech messages by starting a message with /tts.' },
      { id: 'SendVoiceMessages', label: 'Send Voice Messages', desc: 'Allows members to send voice messages.' },
      { id: 'CreatePolls', label: 'Create Polls', desc: 'Allows members to create polls.' },
      { id: 'ManageMessages', label: 'Kelola Pesan (Hapus/Pin)', desc: 'Menghapus atau pin pesan orang lain' },
      { id: 'PinMessages', label: 'Pin Messages', desc: 'Allows members to pin or unpin any message.' },
      { id: 'BypassSlowmode', label: 'Bypass Slowmode', desc: 'Allows members to send messages without being affected by slowmode.' },
      { id: 'ManageThreads', label: 'Manage Threads and Posts', desc: 'Allows members to rename, delete, close, and turn on slow mode for threads and posts.' },
      { id: 'SendMessagesInThreads', label: 'Kirim di Thread', desc: 'Mengirim pesan di dalam utas thread' },
      { id: 'CreatePublicThreads', label: 'Buat Thread Publik', desc: 'Membuat thread publik untuk diskusi' },
      { id: 'CreatePrivateThreads', label: 'Buat Thread Privat', desc: 'Membuat thread rahasia/privat' },
      { id: 'EmbedLinks', label: 'Sematkan Link (Embed)', desc: 'Menampilkan preview web dan link' },
      { id: 'AttachFiles', label: 'Unggah File & Foto', desc: 'Mengunggah file, gambar, dan media' },
      { id: 'AddReactions', label: 'Tambah Reaksi', desc: 'Memberikan reaksi emoji pada pesan' },
      { id: 'UseExternalEmojis', label: 'Gunakan Emoji Luar', desc: 'Memakai emoji dari server lain' },
      { id: 'UseExternalStickers', label: 'Use External Stickers', desc: 'Allows members to use stickers from other servers, if they\'re a Discord Nitro member.' },
      { id: 'MentionEveryone', label: 'Mention @everyone', desc: 'Melakukan tag ke semua member' },
      { id: 'ReadMessageHistory', label: 'Baca Riwayat Pesan', desc: 'Membaca riwayat pesan sebelumnya' }
    ]
  },
  {
    category: 'Suara & Video (Voice)',
    permissions: [
      { id: 'Connect', label: 'Masuk Voice', desc: 'Bergabung ke voice room' },
      { id: 'Speak', label: 'Bicara Voice', desc: 'Berbicara melalui mikrofon' },
      { id: 'Stream', label: 'Share Screen / Video', desc: 'Berbagi layar atau webcam' },
      { id: 'UseVoiceActivity', label: 'Use Voice Activity', desc: 'Allows members to speak in voice channels by simply talking.' },
      { id: 'UseSoundboard', label: 'Use Soundboard', desc: 'Allows members to send sounds from server soundboard.' },
      { id: 'UseExternalSounds', label: 'Use External Sounds', desc: 'Allows members to use sounds from other servers.' },
      { id: 'SetVoiceChannelStatus', label: 'Set Voice Channel Status', desc: 'Allows members to create and edit voice channel status.' },
      { id: 'MuteMembers', label: 'Mute Member', desc: 'Mematikan mikrofon member lain di voice' },
      { id: 'DeafenMembers', label: 'Deafen Member', desc: 'Mematikan audio/pendengaran member lain' },
      { id: 'MoveMembers', label: 'Pindah Member Voice', desc: 'Memindahkan member antar room suara' },
      { id: 'PrioritySpeaker', label: 'Priority Speaker', desc: 'Suara diprioritaskan saat berbicara' }
    ]
  },
  {
    category: 'Aplikasi & Aktivitas (Apps)',
    permissions: [
      { id: 'UseApplicationCommands', label: 'Use Application Commands', desc: 'Allows members to use commands from applications, including slash commands.' },
      { id: 'UseActivities', label: 'Use Activities', desc: 'Allows members to use Activities.' },
      { id: 'UseExternalApps', label: 'Use External Apps', desc: 'Allows apps that members have added to post messages.' }
    ]
  }
];

export const PERMISSION_PRESETS = {
  admin: [
    'Administrator',
    'ManageGuild',
    'ManageRoles',
    'ManageChannels',
    'KickMembers',
    'BanMembers',
    'ViewAuditLog',
    'ViewChannel',
    'SendMessages',
    'SendMessagesInThreads',
    'ManageMessages',
    'PinMessages',
    'BypassSlowmode',
    'ManageThreads',
    'SendTTSMessages',
    'SendVoiceMessages',
    'CreatePolls',
    'CreateExpressions',
    'ManageExpressions',
    'ManageEvents',
    'CreateEvents',
    'EmbedLinks',
    'AttachFiles',
    'ReadMessageHistory',
    'MentionEveryone',
    'Connect',
    'Speak',
    'UseVoiceActivity',
    'UseSoundboard',
    'UseExternalSounds',
    'SetVoiceChannelStatus',
    'UseApplicationCommands',
    'UseActivities',
    'UseExternalApps',
    'MuteMembers',
    'DeafenMembers',
    'MoveMembers'
  ],
  moderator: [
    'ViewChannel',
    'SendMessages',
    'SendMessagesInThreads',
    'EmbedLinks',
    'AttachFiles',
    'AddReactions',
    'UseExternalEmojis',
    'UseExternalStickers',
    'ReadMessageHistory',
    'ManageMessages',
    'PinMessages',
    'BypassSlowmode',
    'ManageThreads',
    'KickMembers',
    'ModerateMembers',
    'ManageNicknames',
    'Connect',
    'Speak',
    'UseVoiceActivity',
    'UseSoundboard',
    'MuteMembers',
    'DeafenMembers',
    'MoveMembers',
    'Stream',
    'UseApplicationCommands'
  ],
  member: [
    'ViewChannel',
    'SendMessages',
    'SendMessagesInThreads',
    'SendVoiceMessages',
    'CreatePolls',
    'EmbedLinks',
    'AttachFiles',
    'AddReactions',
    'UseExternalEmojis',
    'UseExternalStickers',
    'ReadMessageHistory',
    'ChangeNickname',
    'CreateInstantInvite',
    'Connect',
    'Speak',
    'UseVoiceActivity',
    'UseSoundboard',
    'Stream',
    'UseApplicationCommands',
    'UseActivities'
  ],
  readOnly: [
    'ViewChannel',
    'ReadMessageHistory'
  ],
  none: []
};

// Groups specific to channels and categories
export const CHANNEL_PERMISSION_GROUPS = [
  {
    category: 'Akses & Visibilitas',
    permissions: [
      { id: 'ViewChannel', label: 'Lihat Channel', desc: 'Melihat channel teks, kategori, dan suara' },
      { id: 'ManageChannels', label: 'Kelola Channel', desc: 'Mengubah nama, topik, atau menghapus channel' },
      { id: 'ManageRoles', label: 'Kelola Izin (Permissions)', desc: 'Mengatur hak izin channel ini' },
      { id: 'CreateInstantInvite', label: 'Buat Undangan', desc: 'Membuat link invite untuk channel ini' },
      { id: 'ManageWebhooks', label: 'Kelola Webhook', desc: 'Menambah atau mengedit webhook channel ini' }
    ]
  },
  {
    category: 'Pesan & Obrolan (Text)',
    permissions: [
      { id: 'SendMessages', label: 'Kirim Pesan', desc: 'Mengirim chat di channel teks' },
      { id: 'SendTTSMessages', label: 'Send Text-to-Speech Messages', desc: 'Allows members to send text-to-speech messages by starting a message with /tts.' },
      { id: 'SendVoiceMessages', label: 'Send Voice Messages', desc: 'Allows members to send voice messages.' },
      { id: 'CreatePolls', label: 'Create Polls', desc: 'Allows members to create polls.' },
      { id: 'ManageMessages', label: 'Kelola Pesan (Hapus/Pin)', desc: 'Menghapus atau pin pesan orang lain' },
      { id: 'PinMessages', label: 'Pin Messages', desc: 'Allows members to pin or unpin any message.' },
      { id: 'BypassSlowmode', label: 'Bypass Slowmode', desc: 'Allows members to send messages without being affected by slowmode.' },
      { id: 'ManageThreads', label: 'Manage Threads and Posts', desc: 'Allows members to rename, delete, close, and turn on slow mode for threads and posts.' },
      { id: 'SendMessagesInThreads', label: 'Kirim di Thread', desc: 'Mengirim pesan di dalam utas thread' },
      { id: 'CreatePublicThreads', label: 'Buat Thread Publik', desc: 'Membuat thread publik untuk diskusi' },
      { id: 'CreatePrivateThreads', label: 'Buat Thread Privat', desc: 'Membuat thread rahasia/privat' },
      { id: 'EmbedLinks', label: 'Sematkan Link (Embed)', desc: 'Menampilkan preview web dan link' },
      { id: 'AttachFiles', label: 'Unggah File & Foto', desc: 'Mengunggah file, gambar, dan media' },
      { id: 'AddReactions', label: 'Tambah Reaksi', desc: 'Memberikan reaksi emoji pada pesan' },
      { id: 'UseExternalEmojis', label: 'Gunakan Emoji Luar', desc: 'Memakai emoji dari server lain' },
      { id: 'UseExternalStickers', label: 'Use External Stickers', desc: 'Allows members to use stickers from other servers.' },
      { id: 'MentionEveryone', label: 'Mention @everyone', desc: 'Melakukan tag ke semua member' },
      { id: 'ReadMessageHistory', label: 'Baca Riwayat Pesan', desc: 'Membaca riwayat pesan sebelumnya' }
    ]
  },
  {
    category: 'Suara & Video (Voice)',
    permissions: [
      { id: 'Connect', label: 'Masuk Voice', desc: 'Bergabung ke voice room' },
      { id: 'Speak', label: 'Bicara Voice', desc: 'Berbicara melalui mikrofon' },
      { id: 'Stream', label: 'Share Screen / Video', desc: 'Berbagi layar atau webcam' },
      { id: 'UseVoiceActivity', label: 'Use Voice Activity', desc: 'Allows members to speak in voice channels by simply talking.' },
      { id: 'UseSoundboard', label: 'Use Soundboard', desc: 'Allows members to send sounds from server soundboard.' },
      { id: 'UseExternalSounds', label: 'Use External Sounds', desc: 'Allows members to use sounds from other servers.' },
      { id: 'SetVoiceChannelStatus', label: 'Set Voice Channel Status', desc: 'Allows members to create and edit voice channel status.' },
      { id: 'MuteMembers', label: 'Mute Member', desc: 'Mematikan mikrofon member lain di voice' },
      { id: 'DeafenMembers', label: 'Deafen Member', desc: 'Mematikan audio/pendengaran member lain' },
      { id: 'MoveMembers', label: 'Pindah Member Voice', desc: 'Memindahkan member antar room suara' },
      { id: 'PrioritySpeaker', label: 'Priority Speaker', desc: 'Suara diprioritaskan saat berbicara' }
    ]
  },
  {
    category: 'Aplikasi & Aktivitas (Apps)',
    permissions: [
      { id: 'UseApplicationCommands', label: 'Use Application Commands', desc: 'Allows members to use commands from applications.' },
      { id: 'UseActivities', label: 'Use Activities', desc: 'Allows members to use Activities.' },
      { id: 'UseExternalApps', label: 'Use External Apps', desc: 'Allows apps that members have added to post messages.' }
    ]
  }
];

export const CHANNEL_PERMISSION_PRESETS = {
  member: [
    'ViewChannel',
    'SendMessages',
    'SendMessagesInThreads',
    'SendVoiceMessages',
    'CreatePolls',
    'EmbedLinks',
    'AttachFiles',
    'AddReactions',
    'UseExternalEmojis',
    'UseExternalStickers',
    'ReadMessageHistory',
    'Connect',
    'Speak',
    'UseVoiceActivity',
    'UseSoundboard',
    'Stream',
    'UseApplicationCommands',
    'UseActivities'
  ],
  readOnly: [
    'ViewChannel',
    'ReadMessageHistory'
  ],
  moderator: [
    'ViewChannel',
    'SendMessages',
    'SendMessagesInThreads',
    'EmbedLinks',
    'AttachFiles',
    'AddReactions',
    'UseExternalEmojis',
    'UseExternalStickers',
    'ReadMessageHistory',
    'ManageMessages',
    'PinMessages',
    'BypassSlowmode',
    'ManageThreads',
    'ManageChannels',
    'Connect',
    'Speak',
    'UseVoiceActivity',
    'UseSoundboard',
    'Stream',
    'MuteMembers',
    'DeafenMembers',
    'MoveMembers',
    'UseApplicationCommands'
  ],
  private: [],
  none: []
};