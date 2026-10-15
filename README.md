🛠️ Discord Server Setup Web App & Bot

Aplikasi web interaktif dan backend Discord Bot berbasis Node.js & React (Vite) untuk merancang, mengonfigurasi, dan menerapkan (deploy) struktur server Discord secara otomatis, cepat, dan terorganisir.

🌟 Fitur Utama

🎨 Visual Server Builder: UI visual interaktif untuk menyusun Kategori, Saluran Teks/Suara (Text/Voice Channels), dan Peran (Roles).

📋 Preset & Template: Pilihan template server siap pakai yang dapat langsung dimuat dan dikustomisasi sesuai kebutuhan.

🔑 Sistem Izin (Permissions) Detil: Pengaturan hak akses peran dan saluran yang presisi (menggunakan Permissions Selector dan Permission Modal).

🏷️ Manajemen Kategori & Saluran:

Tambah, edit, dan hapus kategori serta saluran.

Opsi penghapusan massal (Bulk Delete Modal).

Pengaturan saluran log (Log Channel Card).

🎭 Manajemen Peran (Roles): Membuat, mengedit warna, nama, dan hak akses role.

⚡ Auto-Deploy via Discord Bot: Menghubungkan frontend web ke backend API untuk langsung menerapkan struktur ke server Discord Anda melalui Bot Discord.

📁 Struktur Proyek

## 📁 Struktur Proyek

```asciidoc
BOT-SETUP-DISCORD-SERVER/
├── backend/
│   ├── .env.example              # Template variabel environment
│   ├── package.json              # Dependensi server backend
│   └── server.js                 # Express server & Bot logic
│
├── frontend/
│   ├── public/                   # Aset publik statis
│   ├── src/
│   │   ├── components/           # Komponen UI Reusable
│   │   │   ├── BulkDeleteModal.jsx
│   │   │   ├── EditCategoryModal.jsx
│   │   │   ├── EditChannelModal.jsx
│   │   │   ├── EditRoleModal.jsx
│   │   │   ├── LogChannelCard.jsx
│   │   │   ├── PermissionModal.jsx
│   │   │   ├── PermissionsSelector.jsx
│   │   │   ├── Presets.jsx
│   │   │   └── ServerBuilder.jsx
│   │   ├── data/                 # Template & konfigurasi permissions
│   │   │   ├── permissionsData.js
│   │   │   └── templates.js
│   │   ├── store/                # State Management (Zustand)
│   │   │   └── useSetupStore.js
│   │   ├── App.jsx               # Komponen utama aplikasi
│   │   ├── index.css             # Konfigurasi Tailwind & Global CSS
│   │   └── main.jsx              # Entry point React
│   ├── index.html                # Template HTML dasar
│   ├── package.json              # Dependensi frontend
│   ├── postcss.config.js         # Konfigurasi PostCSS
│   ├── tailwind.config.js        # Konfigurasi Tailwind CSS
│   └── vite.config.js            # Konfigurasi Vite bundler
│
└── README.md
```


🚀 Cara Menjalankan Proyek
```

1. Prasyarat (Prerequisites)

Node.js (versi 16 atau lebih baru)

Bot Discord Token & Application Client ID dari Discord Developer Portal

2. Konfigurasi Backend

Buka direktori backend:

cd backend


Install dependensi:

npm install


Salin file .env.example menjadi .env:

cp .env.example .env


Isi kredensial bot Discord Anda di file .env:

PORT=5000
DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN
CLIENT_ID=YOUR_CLIENT_ID


Jalankan server backend:

npm start
# atau untuk mode pengembang:
npm run dev


3. Konfigurasi Frontend

Buka direktori frontend:

cd ../frontend


Install dependensi:

npm install


Jalankan aplikasi React:

npm run dev
```


Buka URL lokal yang muncul di terminal (biasanya http://localhost:5173).

🛠️ Teknologi yang Digunakan

Frontend: React, Vite, Tailwind CSS, Zustand (State Management), Lucide Icons / Heroicons.

Backend: Node.js, Express.js, Discord.js (v14).