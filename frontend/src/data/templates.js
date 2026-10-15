export const presetCatalog = [
  {
    id: 'gaming',
    label: 'Gaming Community',
    welcomeMessage: 'Selamat datang di server gaming kami! Baca rules, join voice room, dan bersenang-senang bersama komunitas.',
    roles: [
      { name: 'Owner', color: '#FF4D4F', hoist: true },
      { name: 'Admin', color: '#FFB703', hoist: true },
      { name: 'Moderator', color: '#00C2FF', hoist: true },
      { name: 'Member', color: '#99AAB5', hoist: false }
    ],
    categories: [
      {
        name: '🎮 COMMUNITY',
        channels: [
          { name: 'rules', type: 'text' },
          { name: 'announcements', type: 'text' },
          { name: 'general-chat', type: 'text' },
          { name: 'Lobby', type: 'voice' }
        ]
      },
      {
        name: '🕹️ GAME ROOMS',
        channels: [
          { name: 'valorant', type: 'voice' },
          { name: 'cs2', type: 'voice' },
          { name: 'pubg', type: 'voice' }
        ]
      }
    ]
  },
  {
    id: 'store',
    label: 'Store / E-Commerce',
    welcomeMessage: 'Selamat datang di toko resmi kami! Cek katalog produk, bantuan customer service, dan promo terbaru di channel kami.',
    roles: [
      { name: 'Owner', color: '#9B5DE5', hoist: true },
      { name: 'Admin', color: '#F15BB5', hoist: true },
      { name: 'Support', color: '#00F5D4', hoist: true },
      { name: 'Customer', color: '#FDE68A', hoist: false }
    ],
    categories: [
      {
        name: '📦 STORE',
        channels: [
          { name: 'rules', type: 'text' },
          { name: 'announcements', type: 'text' },
          { name: 'product-showcase', type: 'text' }
        ]
      },
      {
        name: '💬 SUPPORT',
        channels: [
          { name: 'helpdesk', type: 'text' },
          { name: 'cs-chat', type: 'text' },
          { name: 'voice-support', type: 'voice' }
        ]
      }
    ]
  },
  {
    id: 'school',
    label: 'School / Education Group',
    welcomeMessage: 'Selamat datang di komunitas belajar kami! Silakan cek informasi kelas, jadwal, dan materi diskusi di channel yang tersedia.',
    roles: [
      { name: 'Headmaster', color: '#FF6B6B', hoist: true },
      { name: 'Teacher', color: '#4CC9F0', hoist: true },
      { name: 'Student', color: '#80ED99', hoist: false },
      { name: 'Mentor', color: '#F7B267', hoist: true }
    ],
    categories: [
      {
        name: '📚 ACADEMY',
        channels: [
          { name: 'rules', type: 'text' },
          { name: 'announcements', type: 'text' },
          { name: 'study-materials', type: 'text' }
        ]
      },
      {
        name: '🎓 CLASSROOM',
        channels: [
          { name: 'general-discussion', type: 'text' },
          { name: 'classroom-voice', type: 'voice' },
          { name: 'study-room', type: 'voice' }
        ]
      }
    ]
  }
];
