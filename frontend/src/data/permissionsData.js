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
      { id: 'ManageGuildExpressions', label: 'Kelola Emoji & Stiker', desc: 'Upload dan kelola emoji server' }
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
      { id: 'SendMessagesInThreads', label: 'Kirim di Thread', desc: 'Mengirim pesan di dalam utas thread' },
      { id: 'CreatePublicThreads', label: 'Buat Thread Publik', desc: 'Membuat thread publik untuk diskusi' },
      { id: 'CreatePrivateThreads', label: 'Buat Thread Privat', desc: 'Membuat thread rahasia/privat' },
      { id: 'EmbedLinks', label: 'Sematkan Link (Embed)', desc: 'Menampilkan preview web dan link' },
      { id: 'AttachFiles', label: 'Unggah File & Foto', desc: 'Mengunggah file, gambar, dan media' },
      { id: 'AddReactions', label: 'Tambah Reaksi', desc: 'Memberikan reaksi emoji pada pesan' },
      { id: 'UseExternalEmojis', label: 'Gunakan Emoji Luar', desc: 'Memakai emoji dari server lain' },
      { id: 'MentionEveryone', label: 'Mention @everyone', desc: 'Melakukan tag ke semua member' },
      { id: 'ManageMessages', label: 'Kelola Pesan (Hapus/Pin)', desc: 'Menghapus atau pin pesan orang lain' },
      { id: 'ReadMessageHistory', label: 'Baca Riwayat Pesan', desc: 'Membaca riwayat pesan sebelumnya' }
    ]
  },
  {
    category: 'Suara & Video (Voice)',
    permissions: [
      { id: 'Connect', label: 'Masuk Voice', desc: 'Bergabung ke voice room' },
      { id: 'Speak', label: 'Bicara Voice', desc: 'Berbicara melalui mikrofon' },
      { id: 'Stream', label: 'Share Screen / Video', desc: 'Berbagi layar atau webcam' },
      { id: 'MuteMembers', label: 'Mute Member', desc: 'Mematikan mikrofon member lain di voice' },
      { id: 'DeafenMembers', label: 'Deafen Member', desc: 'Mematikan audio/pendengaran member lain' },
      { id: 'MoveMembers', label: 'Pindah Member Voice', desc: 'Memindahkan member antar room suara' },
      { id: 'PrioritySpeaker', label: 'Priority Speaker', desc: 'Suara diprioritaskan saat berbicara' }
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
    'EmbedLinks',
    'AttachFiles',
    'ReadMessageHistory',
    'MentionEveryone',
    'Connect',
    'Speak',
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
    'ReadMessageHistory',
    'ManageMessages',
    'KickMembers',
    'ModerateMembers',
    'ManageNicknames',
    'Connect',
    'Speak',
    'MuteMembers',
    'DeafenMembers',
    'MoveMembers',
    'Stream'
  ],
  member: [
    'ViewChannel',
    'SendMessages',
    'SendMessagesInThreads',
    'EmbedLinks',
    'AttachFiles',
    'AddReactions',
    'UseExternalEmojis',
    'ReadMessageHistory',
    'ChangeNickname',
    'CreateInstantInvite',
    'Connect',
    'Speak',
    'Stream'
  ],
  readOnly: [
    'ViewChannel',
    'ReadMessageHistory'
  ],
  none: []
};

// Groups specific to channels and categories (valid channel overwrite permissions)
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
      { id: 'SendMessagesInThreads', label: 'Kirim di Thread', desc: 'Mengirim pesan di dalam utas thread' },
      { id: 'CreatePublicThreads', label: 'Buat Thread Publik', desc: 'Membuat thread publik untuk diskusi' },
      { id: 'CreatePrivateThreads', label: 'Buat Thread Privat', desc: 'Membuat thread rahasia/privat' },
      { id: 'EmbedLinks', label: 'Sematkan Link (Embed)', desc: 'Menampilkan preview web dan link' },
      { id: 'AttachFiles', label: 'Unggah File & Foto', desc: 'Mengunggah file, gambar, dan media' },
      { id: 'AddReactions', label: 'Tambah Reaksi', desc: 'Memberikan reaksi emoji pada pesan' },
      { id: 'UseExternalEmojis', label: 'Gunakan Emoji Luar', desc: 'Memakai emoji dari server lain' },
      { id: 'MentionEveryone', label: 'Mention @everyone', desc: 'Melakukan tag ke semua member' },
      { id: 'ManageMessages', label: 'Kelola Pesan (Hapus/Pin)', desc: 'Menghapus atau pin pesan orang lain' },
      { id: 'ReadMessageHistory', label: 'Baca Riwayat Pesan', desc: 'Membaca riwayat pesan sebelumnya' }
    ]
  },
  {
    category: 'Suara & Video (Voice)',
    permissions: [
      { id: 'Connect', label: 'Masuk Voice', desc: 'Bergabung ke voice room' },
      { id: 'Speak', label: 'Bicara Voice', desc: 'Berbicara melalui mikrofon' },
      { id: 'Stream', label: 'Share Screen / Video', desc: 'Berbagi layar atau webcam' },
      { id: 'MuteMembers', label: 'Mute Member', desc: 'Mematikan mikrofon member lain di voice' },
      { id: 'DeafenMembers', label: 'Deafen Member', desc: 'Mematikan audio/pendengaran member lain' },
      { id: 'MoveMembers', label: 'Pindah Member Voice', desc: 'Memindahkan member antar room suara' },
      { id: 'PrioritySpeaker', label: 'Priority Speaker', desc: 'Suara diprioritaskan saat berbicara' }
    ]
  }
];

export const CHANNEL_PERMISSION_PRESETS = {
  member: [
    'ViewChannel',
    'SendMessages',
    'SendMessagesInThreads',
    'EmbedLinks',
    'AttachFiles',
    'AddReactions',
    'UseExternalEmojis',
    'ReadMessageHistory',
    'Connect',
    'Speak',
    'Stream'
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
    'ReadMessageHistory',
    'ManageMessages',
    'ManageChannels',
    'Connect',
    'Speak',
    'Stream',
    'MuteMembers',
    'DeafenMembers',
    'MoveMembers'
  ],
  private: [],
  none: []
};

