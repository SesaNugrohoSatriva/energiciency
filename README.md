# Energiciency

Dashboard prototype untuk Manufacturing Execution System (MES) dan Energy Management.

## Stack
- React + Vite + JavaScript
- Recharts untuk visualisasi
- Lucide React untuk ikon
- CSS responsif tanpa UI framework

## Menjalankan project
Pastikan Node.js versi LTS sudah terpasang.

```bash
npm install
npm run dev
```

Buka URL lokal yang ditampilkan Vite di terminal.

## Build production

```bash
npm run build
npm run preview
```

## Struktur

```text
Energiciency/
├── public/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   ├── StatCard.jsx
│   │   └── Panel.jsx
│   ├── data/
│   │   └── dashboard.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## Catatan integrasi
Data pada dashboard saat ini adalah data contoh dari `src/data/dashboard.js`, bukan data real-time. Jika diintegrasikan dengan Odoo 19, buat endpoint API yang terautentikasi di backend lalu atur `VITE_API_BASE_URL`. Jangan menaruh password, API secret, atau kredensial Odoo di variabel `VITE_*`, karena variabel tersebut diekspos ke browser.
