export const serverTemplates = [
  {
    id: 'gaming',
    name: 'Gaming Community',
    label: 'Gaming Community',
    description: 'Server komunitas gaming aktif dengan channel obrolan, mabar, dan sistem role yang lengkap.',
    roles: [
      {
        name: 'Admin',
        color: '#e74c3c',
        permissions: ['ADMINISTRATOR'],
        hoist: true,
        mentionable: true
      },
      {
        name: 'Moderator',
        color: '#2ecc71',
        permissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS', 'MUTE_MEMBERS', 'VIEW_CHANNEL', 'SEND_MESSAGES'],
        hoist: true,
        mentionable: true
      },
      {
        name: 'Member',
        color: '#3498db',
        permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'CONNECT', 'SPEAK'],
        hoist: true,
        mentionable: false
      }
    ],
    categories: [
      {
        name: 'WELCOME & INFO',
        label: 'WELCOME & INFO',
        permissions: {
          '@everyone': { VIEW_CHANNEL: true, SEND_MESSAGES: false },
          'Member': { VIEW_CHANNEL: true, SEND_MESSAGES: false }
        },
        channels: [
          { name: 'rules', label: 'rules', type: 'text', topic: 'Peraturan server komunitas', permissions: {} },
          { name: 'announcements', label: 'announcements', type: 'text', topic: 'Pengumuman resmi server', permissions: {} }
        ]
      },
      {
        name: 'COMMUNITY',
        label: 'COMMUNITY',
        permissions: {
          '@everyone': { VIEW_CHANNEL: true, SEND_MESSAGES: true }
        },
        channels: [
          { name: 'general', label: 'general', type: 'text', topic: 'Obrolan umum komunitas', permissions: {} },
          { name: 'bot-commands', label: 'bot-commands', type: 'text', topic: 'Channel khusus command bot', permissions: {} },
          { name: 'media-sharing', label: 'media-sharing', type: 'text', topic: 'Tempat kirim gambar dan klip', permissions: {} }
        ]
      },
      {
        name: 'VOICE CHANNELS',
        label: 'VOICE CHANNELS',
        permissions: {
          '@everyone': { VIEW_CHANNEL: true, CONNECT: true, SPEAK: true }
        },
        channels: [
          { name: 'Lobby', label: 'Lobby', type: 'voice', permissions: {} },
          { name: 'Squad 1', label: 'Squad 1', type: 'voice', permissions: {} },
          { name: 'Squad 2', label: 'Squad 2', type: 'voice', permissions: {} }
        ]
      }
    ]
  },
  {
    id: 'store',
    name: 'Online Store / Shop',
    label: 'Online Store / Shop',
    description: 'Server khusus toko online atau jualan dengan sistem katalog produk, testimoni, dan tiket order.',
    roles: [
      {
        name: 'Owner',
        color: '#f1c40f',
        permissions: ['ADMINISTRATOR'],
        hoist: true,
        mentionable: true
      },
      {
        name: 'Seller / Staff',
        color: '#e67e22',
        permissions: ['MANAGE_MESSAGES', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_CHANNELS'],
        hoist: true,
        mentionable: true
      },
      {
        name: 'Customer',
        color: '#1abc9c',
        permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
        hoist: true,
        mentionable: false
      }
    ],
    categories: [
      {
        name: 'INFORMASI TOKO',
        label: 'INFORMASI TOKO',
        permissions: {
          '@everyone': { VIEW_CHANNEL: true, SEND_MESSAGES: false }
        },
        channels: [
          { name: 'welcome-store', label: 'welcome-store', type: 'text', topic: 'Selamat datang di toko kami', permissions: {} },
          { name: 'rules-and-faq', label: 'rules-and-faq', type: 'text', topic: 'Syarat, ketentuan, dan tanya jawab', permissions: {} },
          { name: 'announcements', label: 'announcements', type: 'text', topic: 'Info promo dan diskon', permissions: {} }
        ]
      },
      {
        name: 'KATALOG PRODUK',
        label: 'KATALOG PRODUK',
        permissions: {
          '@everyone': { VIEW_CHANNEL: true, SEND_MESSAGES: false },
          'Seller / Staff': { SEND_MESSAGES: true }
        },
        channels: [
          { name: 'price-list', label: 'price-list', type: 'text', topic: 'Daftar harga produk lengkap', permissions: {} },
          { name: 'testimonials', label: 'testimonials', type: 'text', topic: 'Bukti transaksi dan testimoni pembeli', permissions: {} }
        ]
      },
      {
        name: 'TRANSAKSI & ORDER',
        label: 'TRANSAKSI & ORDER',
        permissions: {
          '@everyone': { VIEW_CHANNEL: true, SEND_MESSAGES: true },
          'Customer': { VIEW_CHANNEL: true, SEND_MESSAGES: true }
        },
        channels: [
          { name: 'order-here', label: 'order-here', type: 'text', topic: 'Buat pesanan atau tiket transaksi di sini', permissions: {} },
          { name: 'customer-service', label: 'customer-service', type: 'text', topic: 'Bantuan kendala transaksi', permissions: {} }
        ]
      }
    ]
  },
  {
    id: 'school',
    name: 'School / Class',
    label: 'School / Class',
    description: 'Server untuk kelas, organisasi sekolah, atau kelompok belajar dengan manajemen materi dan ruang diskusi.',
    roles: [
      {
        name: 'Teacher / Mentor',
        color: '#9b59b6',
        permissions: ['MANAGE_MESSAGES', 'MUTE_MEMBERS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'MENTION_EVERYONE'],
        hoist: true,
        mentionable: true
      },
      {
        name: 'Student',
        color: '#34495e',
        permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'CONNECT', 'SPEAK'],
        hoist: true,
        mentionable: false
      }
    ],
    categories: [
      {
        name: 'PENGUMUMAN KELAS',
        label: 'PENGUMUMAN KELAS',
        permissions: {
          '@everyone': { VIEW_CHANNEL: true, SEND_MESSAGES: false },
          'Teacher / Mentor': { SEND_MESSAGES: true }
        },
        channels: [
          { name: 'jadwal-pelajaran', label: 'jadwal-pelajaran', type: 'text', topic: 'Informasi jadwal dan kegiatan', permissions: {} },
          { name: 'tugas-dan-proyek', label: 'tugas-dan-proyek', type: 'text', topic: 'Pengumpulan tugas sekolah', permissions: {} }
        ]
      },
      {
        name: 'RUANG DISKUSI',
        label: 'RUANG DISKUSI',
        permissions: {
          '@everyone': { VIEW_CHANNEL: true, SEND_MESSAGES: true },
          'Student': { VIEW_CHANNEL: true, SEND_MESSAGES: true }
        },
        channels: [
          { name: 'diskusi-umum', label: 'diskusi-umum', type: 'text', topic: 'Tempat diskusi seputar materi belajar', permissions: {} },
          { name: 'tanya-jawab', label: 'tanya-jawab', type: 'text', topic: 'Sesi tanya jawab soal atau materi', permissions: {} }
        ]
      },
      {
        name: 'KELAS ONLINE',
        label: 'KELAS ONLINE',
        permissions: {
          '@everyone': { VIEW_CHANNEL: true, CONNECT: true, SPEAK: false },
          'Teacher / Mentor': { SPEAK: true },
          'Student': { SPEAK: true }
        },
        channels: [
          { name: 'Ruang Kuliah / Kelas', label: 'Ruang Kuliah / Kelas', type: 'voice', permissions: {} },
          { name: 'Kelompok Belajar', label: 'Kelompok Belajar', type: 'voice', permissions: {} }
        ]
      }
    ]
  }
];

export const presetCatalog = serverTemplates;