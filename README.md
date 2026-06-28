# ManhwaKu — Manhwa Reader

Website baca manhwa terjemahan pribadi. Built with Next.js 15 + Supabase + Vercel.

## Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS (dark mode MangaDex-style)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (cover + halaman chapter)
- **Auth**: Supabase Auth
- **Deploy**: Vercel

## Setup

### 1. Clone & install

```bash
git clone https://github.com/hiuraaaaa/manhwa-reader
cd manhwa-reader
npm install
```

### 2. Supabase setup

1. Buat project baru di [supabase.com](https://supabase.com)
2. Jalankan SQL di `supabase/schema.sql` via **SQL Editor** di Supabase Dashboard
3. Buat storage buckets di **Storage** dashboard:
   - Bucket `covers` → Public: ✅
   - Bucket `chapters` → Public: ✅
4. Set storage policies (uncomment bagian storage di `schema.sql` dan jalankan)

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Isi dengan nilai dari Supabase Dashboard → Settings → API:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4. Buat admin account

Di Supabase Dashboard → **Authentication** → **Users** → **Add User**. Masukkan email + password yang lo mau.

### 5. Run dev

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

## Deploy ke Vercel

1. Push repo ke GitHub
2. Import di [vercel.com](https://vercel.com)
3. Tambah environment variables di Vercel Dashboard (Settings → Environment Variables)
4. Deploy otomatis!

## Struktur Project

```
app/
  (public)/          # Public pages (reader)
    page.tsx          # Home
    manhwa/[slug]/    # Detail manhwa
      chapter/[num]/ # Chapter reader
  admin/             # Admin panel (protected)
    login/
    manhwa/
      [id]/
        edit/
        chapters/
          new/
components/
  ui/                # Reusable components
  reader/            # Reader-specific
  admin/             # Admin-specific
lib/
  supabase/          # Client, server, middleware
  types.ts
  utils.ts
supabase/
  schema.sql         # SQL schema lengkap
```

## Fitur

**Public:**
- Browse + search + filter genre/status manhwa
- Detail manhwa (cover, sinopsis, list chapter)
- Chapter reader (scroll vertikal)
- Bookmark progress baca (localStorage)
- Prev/Next chapter navigation

**Admin:**
- Login dengan Supabase Auth
- Dashboard statistik
- CRUD manhwa (judul, cover, sinopsis, genre, status, author, artist)
- Upload chapter dengan drag & drop multi-gambar
- Reorder halaman sebelum upload
- Progress bar upload
- Hapus manhwa/chapter
