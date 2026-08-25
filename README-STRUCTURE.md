# Atlas API v1 — Struktur & Cara Kerja (Cloudflare Pages)

```
atlas-api/
├── src/                          # Frontend React + Vite (landing page + dashboard)
│
├── functions/                    # Backend serverless (Cloudflare Pages Functions)
│   ├── api/
│   │   ├── chat/
│   │   │   └── [provider].ts     # POST /api/chat/:provider → proxy ke Gemini/Groq/OpenRouter/HF/NVIDIA
│   │   ├── tts/
│   │   │   └── index.ts          # POST /api/tts → Atlas TTS (masih TODO)
│   │   ├── models/
│   │   │   └── index.ts          # GET  /api/models → daftar model per provider
│   │   ├── keys/
│   │   │   └── index.ts          # POST /api/keys (generate key baru) · GET /api/keys (cek info key)
│   │   └── pricing/
│   │       └── index.ts          # GET  /api/pricing → daftar plan & harga (dipakai landing page)
│   │
│   └── _lib/
│       ├── plans.ts              # ⭐ SATU SUMBER kebenaran: limit mingguan & harga per plan
│       ├── providers.ts          # Registry & fetch call ke tiap AI provider
│       ├── auth.ts               # Validasi + generate API key lewat KV
│       └── rateLimit.ts          # Rate limit 2 lapis: kuota mingguan (plan) + burst per menit
│
├── wrangler.toml
└── README-STRUCTURE.md
```

## Pricing v1 (transparan, satu sumber di `functions/_lib/plans.ts`)

| Plan | Harga | Kuota/minggu | Burst/menit | Fitur tambahan |
|------|-------|---------------|-------------|-----------------|
| **Free** | Gratis | 500 request | 20 req/menit | Semua provider |
| **Pro**  | Rp49.000/bulan* | 5.000 request | 60 req/menit | + TTS prioritas, support prioritas |

\* Angka Rp49.000 masih placeholder — ganti di `plans.ts` sebelum go-live, tinggal satu tempat, otomatis kesinkron ke `/api/pricing` dan enforcement rate limit.

**Prinsip transparan**: gak ada biaya tersembunyi. Kalau kuota mingguan habis, request diblokir (HTTP 429) dengan pesan jelas — bukan ditagih otomatis kelebihan pakai.

## Alur request `/api/chat/:provider`
1. Client kirim `Authorization: Bearer <api-key>`
2. `auth.ts` → cek key valid di KV, ambil `plan` (free/pro)
3. `rateLimit.ts` → cek burst per menit, lalu cek kuota mingguan sesuai plan
4. Kalau lolos → `providers.ts` forward ke provider asli pakai API key kamu (dari Secrets)
5. Response dikembalikan + header `X-RateLimit-Remaining-Weekly`

## Alur generate API key (`/api/keys`)
```
POST /api/keys
Body: { "label": "Atlas Academy prod" }   // opsional

Response:
{
  "apiKey": "atlas_live_xxxxxxxx...",
  "plan": "free",
  "weeklyLimit": 500,
  "message": "Simpan API key ini baik-baik — tidak akan ditampilkan lagi."
}
```
> ⚠️ v1: endpoint ini belum dijaga login — siapa saja bisa generate key **free**. Upgrade ke Pro nanti lewat webhook payment gateway (belum diimplementasi, lihat TODO).

## Setup awal (dari Termux)
```bash
npm install -g wrangler
wrangler login
wrangler kv namespace create ATLAS_KV
# copy "id" hasilnya ke wrangler.toml

wrangler pages secret put GEMINI_API_KEY
wrangler pages secret put GROQ_API_KEY
wrangler pages secret put OPENROUTER_API_KEY
wrangler pages secret put HF_API_KEY
wrangler pages secret put NVIDIA_API_KEY

npm run build
wrangler pages deploy dist
```

## Belum ada di v1 (TODO selanjutnya)
- Sistem login/akun user (sekarang generate key masih open, belum terikat identitas)
- Webhook payment gateway (Midtrans/Xendit) untuk upgrade free → pro otomatis
- Implementasi TTS provider
- Dashboard usage (grafik pemakaian mingguan) di `src/`

## Frontend (v1 final)

Struktur `src/`:

```
src/
├── main.tsx                    # entry point
├── App.tsx                     # komposisi semua section
├── vite-env.d.ts
├── lib/
│   └── api.ts                  # fetch ke /api/pricing & /api/keys, dengan fallback
├── styles/
│   └── global.css              # design tokens (warna, tipografi, spacing)
└── components/
    ├── Nav.tsx                 # navbar sticky
    ├── Hero.tsx + RoutingDiagram.tsx   # hero + diagram SVG animasi (signature element)
    ├── HowItWorks.tsx           # 3 langkah cara pakai
    ├── Providers.tsx            # grid 5 provider yang didukung
    ├── Pricing.tsx               # card Free vs Pro, fetch live dari /api/pricing
    ├── ApiKeyGenerator.tsx       # form generate key (loading/error/success state)
    └── Footer.tsx
```

### Konsep desain
Tema "peta rute": Atlas jadi hub yang merutekan satu request ke 5 provider AI —
divisualisasikan literal lewat `RoutingDiagram.tsx` di hero (SVG dengan animasi
pulsa data mengalir dari hub ke tiap provider, menghormati `prefers-reduced-motion`).

- **Warna**: dasar navy-hitam (#0A0C10), aksen teal (#4FD1C5) untuk elemen interaktif/rute, amber (#F0B429) khusus menandai tier Pro.
- **Tipografi**: Space Grotesk (display/heading), Inter (body), JetBrains Mono (code/data).
- **Section Pricing** fetch live dari `/api/pricing` (fallback ke data statis di `lib/api.ts` kalau backend belum live) — angka harga selalu konsisten dengan `functions/_lib/plans.ts`.
- **ApiKeyGenerator** punya state loading/error/success lengkap, key ditampilkan sekali dengan tombol salin.

### Build & deploy (dari Termux)
```bash
cd atlas-api
npm install
npm run build          # hasil ke dist/
wrangler pages deploy dist
```

> Catatan: source ini ditulis manual mengikuti struktur Vite standar dan belum
> pernah dijalankan `npm install`/`npm run build` di environment pembuatan ini
> (tidak ada akses network). Jalankan `npm install` dulu di Termux kamu untuk
> memastikan tidak ada typo sebelum deploy — kalau ada error TypeScript kecil,
> kirim pesan errornya, saya bantu perbaiki.

## Update: Auth, 3D, Splash Screen, Tap Highlight Fix

### Login & Register (baru)
API key sekarang **wajib login dulu** — generate key tanpa akun sudah tidak bisa lagi.

Endpoint baru:
- `POST /api/auth/register` — Body `{ email, password }` → buat akun, return `sessionToken`
- `POST /api/auth/login` — Body `{ email, password }` → return `sessionToken`
- `GET /api/auth/me` — Header `Authorization: Bearer <sessionToken>` → info user yang login

Password di-hash pakai PBKDF2 (Web Crypto, native di Cloudflare Workers, tanpa dependency
tambahan). Session disimpan di KV, berlaku 30 hari. Ini basic auth untuk v1 — belum ada
verifikasi email atau reset password.

Frontend: `src/lib/auth.ts` (register/login/session di localStorage), `AuthModal.tsx`
(modal tab Masuk/Daftar), `Nav.tsx` (tombol "Masuk / Daftar" → berubah jadi email + "Keluar"
setelah login). `ApiKeyGenerator.tsx` sekarang minta login dulu sebelum generate key.

### Efek 3D
- `RoutingDiagram.tsx` — hub & garis rute diberi `rotateX`/`rotateZ` (CSS 3D transform) jadi
  terlihat seperti peta miring, sedikit membesar saat disentuh/hover.
- `Providers.tsx` — kartu provider dapat efek tilt 3D (`rotateX`/`rotateY`) saat hover.
- Semua transform 3D otomatis nonaktif kalau `prefers-reduced-motion` aktif di device.

### Splash Screen
`SplashScreen.tsx` — muncul ~1.4 detik saat app pertama dimuat, menampilkan cincin 3D
berputar di sekitar titik pusat (echo dari tema "hub" Atlas), lalu fade out otomatis.

### Fix tap highlight biru
Ditambahkan di `global.css`:
```css
* { -webkit-tap-highlight-color: transparent; }
```
Ini menghilangkan kotak/highlight biru bawaan Chrome Android saat elemen di-tap.
