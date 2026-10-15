# Discord Bot Hub & Auto Setup Server Builder

Aplikasi ini adalah implementasi awal dari PRD yang dibuat untuk membangun aplikasi web yang dapat:

- menampilkan katalog bot Discord populer,
- memilih bot favorit,
- membuat struktur server (roles, categories, channels),
- menyiapkan welcome message,
- mengirim payload JSON ke backend Node.js,
- menjalankan setup server melalui Bot Manager Discord.

## Struktur Project

- `backend/` berisi server Express + Discord.js manager.
- `frontend/` berisi UI React + Vite yang berfungsi sebagai antarmuka konfigurasi.

## Setup

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Konfigurasi bot token

Salin file `.env.example` menjadi `.env` di folder backend, lalu isi token Discord bot Anda.

```bash
cp backend/.env.example backend/.env
```

### 3. Jalankan backend

```bash
cd backend
npm run dev
```

### 4. Jalankan frontend

```bash
cd frontend
npm run dev
```

### 5. Akses aplikasi

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Catatan

- Frontend mengirim request ke `http://localhost:5000/api/setup`.
- Bot manager perlu sudah masuk ke Guild/Server target untuk bisa membuat roles, category, dan channel.
- Tanpa `DISCORD_BOT_TOKEN` valid, backend tetap berjalan dalam mode non-aktif dan tidak akan terhubung ke Discord.
