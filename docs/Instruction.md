# Aplikasi Pengaduan AKPOL — Instruksi Pembangunan

## Gambaran Umum

Aplikasi web pengaduan infrastruktur/fasilitas Akademi Kepolisian (Akpol) berbasis Next.js + Supabase. Pelapor (taruna/staf) bisa submit laporan, pantau status secara real-time, upload foto bukti, dan beri rating kepuasan. Admin/operator bisa kelola dan update status tiket dari panel khusus.

---

## Tech Stack

| Layer        | Teknologi                                         |
| ------------ | ------------------------------------------------- |
| Frontend     | Next.js 14 (App Router) + Tailwind CSS            |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Hosting      | Vercel (free tier)                                |
| Notifikasi   | Browser Push Notification (built-in, gratis)      |

---

## Struktur Status Tiket

```
MASUK → DIVERIFIKASI → DIPROSES → DITANGANI → SELESAI
                                             ↘
                                          DITOLAK (dari status manapun)
```

| Status       | Kode           | Yang mengubah   | Keterangan                          |
| ------------ | -------------- | --------------- | ----------------------------------- |
| Masuk        | `masuk`        | Sistem otomatis | Laporan baru masuk                  |
| Diverifikasi | `diverifikasi` | Admin           | Data lengkap & valid                |
| Diproses     | `diproses`     | Petugas Baglog  | Diteruskan ke Sarpras               |
| Ditangani    | `ditangani`    | Teknisi         | Tim di lokasi, wajib upload foto    |
| Selesai      | `selesai`      | Teknisi + Admin | Perbaikan selesai, foto after wajib |
| Ditolak      | `ditolak`      | Admin           | Tidak valid / diluar wewenang       |

---

## Struktur Database (Supabase / PostgreSQL)

### Tabel `profiles`

```sql
create table profiles (
  id          uuid primary key references auth.users(id),
  nama        text not null,
  nrp         text unique,                      -- nomor registrasi pokok
  role        text default 'pelapor'            -- 'pelapor' | 'admin' | 'teknisi'
              check (role in ('pelapor','admin','teknisi')),
  unit        text,                             -- cth. "Asrama C", "Baglog"
  created_at  timestamptz default now()
);
```

### Tabel `tiket`

```sql
create table tiket (
  id            uuid primary key default gen_random_uuid(),
  nomor         text unique not null,           -- cth. AKPOL-20260630-001
  pelapor_id    uuid references profiles(id),
  judul         text not null,
  deskripsi     text,
  lokasi        text not null,
  kategori      text not null
                check (kategori in (
                  'sanitasi_air','kelistrikan',
                  'bangunan_struktur','ac_ventilasi','lainnya'
                )),
  status        text default 'masuk'
                check (status in (
                  'masuk','diverifikasi','diproses',
                  'ditangani','selesai','ditolak'
                )),
  estimasi_hari int,                            -- estimasi pengerjaan (hari kerja)
  alasan_tolak  text,                           -- diisi jika ditolak
  handler_id    uuid references profiles(id),   -- admin/teknisi yang handle
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
```

### Tabel `status_log`

```sql
-- Riwayat perubahan status (untuk timeline di UI)
create table status_log (
  id          uuid primary key default gen_random_uuid(),
  tiket_id    uuid references tiket(id) on delete cascade,
  status_lama text,
  status_baru text not null,
  catatan     text,
  oleh_id     uuid references profiles(id),
  created_at  timestamptz default now()
);
```

### Tabel `foto_tiket`

```sql
create table foto_tiket (
  id          uuid primary key default gen_random_uuid(),
  tiket_id    uuid references tiket(id) on delete cascade,
  jenis       text not null check (jenis in ('bukti','progres','sebelum','sesudah')),
  storage_path text not null,                   -- path di Supabase Storage
  diunggah_oleh uuid references profiles(id),
  created_at  timestamptz default now()
);
```

### Tabel `rating`

```sql
create table rating (
  id          uuid primary key default gen_random_uuid(),
  tiket_id    uuid references tiket(id) unique, -- 1 rating per tiket
  pelapor_id  uuid references profiles(id),
  bintang     int not null check (bintang between 1 and 5),
  komentar    text,
  created_at  timestamptz default now()
);
```

---

## Struktur Folder Project

```
akpol-pengaduan/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (pelapor)/
│   │   ├── dashboard/page.tsx        # daftar tiket milik pelapor
│   │   ├── lapor/page.tsx            # form buat laporan baru
│   │   └── tiket/[id]/page.tsx       # detail tiket + timeline
│   ├── (admin)/
│   │   ├── admin/dashboard/page.tsx  # statistik + daftar semua tiket
│   │   └── admin/tiket/[id]/page.tsx # detail tiket + ubah status
│   └── layout.tsx
├── components/
│   ├── ui/
│   │   ├── BadgeStatus.tsx           # badge warna per status
│   │   ├── Timeline.tsx              # komponen timeline riwayat
│   │   ├── FotoUpload.tsx            # upload foto drag & drop
│   │   └── RatingBintang.tsx         # input rating 1-5 bintang
│   ├── tiket/
│   │   ├── TiketCard.tsx
│   │   ├── FormLaporan.tsx
│   │   └── PanelUbahStatus.tsx       # khusus admin
│   └── layout/
│       ├── Navbar.tsx
│       └── Sidebar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # browser client
│   │   └── server.ts                 # server component client
│   ├── utils/
│   │   ├── generateNomor.ts          # generate AKPOL-YYYYMMDD-NNN
│   │   └── statusHelper.ts           # label, warna, urutan status
│   └── types.ts                      # TypeScript types
├── middleware.ts                      # proteksi route by role
└── .env.local
```

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-side only
```

---

## Alur Penggunaan

### Pelapor

1. Daftar / login dengan NRP + password
2. Buat laporan baru → isi judul, lokasi, kategori, deskripsi, upload foto bukti
3. Sistem generate nomor tiket otomatis (`AKPOL-YYYYMMDD-NNN`)
4. Pantau status tiket di dashboard → lihat timeline riwayat
5. Setelah status **Selesai** → beri rating kepuasan 1–5 bintang

### Admin / Operator

1. Login dengan akun role `admin`
2. Dashboard: lihat semua tiket masuk, filter by status/kategori/tanggal
3. Buka tiket → verifikasi data → ubah status + isi catatan
4. Teruskan ke Baglog (status: Diproses) → Teknisi update status Ditangani + upload foto progres
5. Tutup tiket (status: Selesai) setelah foto sesudah terupload
6. Tolak tiket dengan alasan jika tidak valid

---

## Fitur per Role

### Pelapor

- [x] Submit laporan baru
- [x] Upload foto bukti (maks. 3 foto, 5MB/foto)
- [x] Pantau status real-time
- [x] Lihat timeline riwayat status
- [x] Lihat foto progres dari teknisi
- [x] Beri rating setelah selesai

### Admin

- [x] Dashboard statistik (masuk, diproses, selesai, ditolak)
- [x] Daftar semua tiket + filter + search
- [x] Ubah status tiket + isi catatan
- [x] Tolak tiket dengan alasan
- [x] Lihat rata-rata rating kepuasan

### Teknisi

- [x] Lihat tiket yang di-assign
- [x] Upload foto progres (saat Ditangani)
- [x] Upload foto sesudah (saat Selesai)
- [x] Update status ke Ditangani / Selesai

---

## Aturan Business Logic

```typescript
// lib/utils/statusHelper.ts

// Urutan status yang valid
export const STATUS_ORDER = [
  "masuk",
  "diverifikasi",
  "diproses",
  "ditangani",
  "selesai",
];

// Siapa boleh ubah ke status apa
export const STATUS_PERMISSION: Record<string, string[]> = {
  masuk: [], // otomatis sistem
  diverifikasi: ["admin"],
  diproses: ["admin", "teknisi"],
  ditangani: ["teknisi"],
  selesai: ["teknisi", "admin"],
  ditolak: ["admin"], // bisa dari status manapun
};

// Foto wajib di-upload sebelum update ke status ini
export const STATUS_WAJIB_FOTO = ["ditangani", "selesai"];

// Generate nomor tiket
export function generateNomor(urutan: number): string {
  const tanggal = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `AKPOL-${tanggal}-${String(urutan).padStart(3, "0")}`;
}
```

---

## Supabase Row Level Security (RLS)

```sql
-- Pelapor hanya bisa lihat tiket miliknya sendiri
create policy "pelapor lihat tiket sendiri"
  on tiket for select
  using (pelapor_id = auth.uid());

-- Pelapor bisa insert tiket baru
create policy "pelapor buat tiket"
  on tiket for insert
  with check (pelapor_id = auth.uid());

-- Admin bisa lihat semua tiket
create policy "admin lihat semua tiket"
  on tiket for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin','teknisi')
    )
  );

-- Admin bisa update status tiket
create policy "admin update tiket"
  on tiket for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin','teknisi')
    )
  );
```

---

## Komponen Kunci: Timeline

```tsx
// components/ui/Timeline.tsx
import { StatusLog } from "@/lib/types";

const STATUS_CONFIG = {
  masuk: { label: "Masuk", color: "gray" },
  diverifikasi: { label: "Diverifikasi", color: "blue" },
  diproses: { label: "Diproses", color: "amber" },
  ditangani: { label: "Ditangani", color: "green" },
  selesai: { label: "Selesai", color: "teal" },
  ditolak: { label: "Ditolak", color: "red" },
};

export function Timeline({ logs }: { logs: StatusLog[] }) {
  return (
    <ol className="relative border-l border-gray-200">
      {logs.map((log) => {
        const cfg = STATUS_CONFIG[log.status_baru];
        return (
          <li key={log.id} className="mb-6 ml-4">
            <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-current" />
            <time className="text-xs text-gray-400">
              {new Date(log.created_at).toLocaleString("id-ID")}
            </time>
            <h4 className="font-medium text-sm">{cfg.label}</h4>
            {log.catatan && (
              <p className="text-xs text-gray-500 mt-1">{log.catatan}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
```

---

## Langkah Instalasi

```bash
# 1. Clone / init project
npx create-next-app@latest akpol-pengaduan --typescript --tailwind --app
cd akpol-pengaduan

# 2. Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install lucide-react                  # icons
npm install react-dropzone                # upload foto drag & drop
npm install date-fns                      # format tanggal

# 3. Isi .env.local dengan kredensial Supabase

# 4. Jalankan SQL schema di Supabase SQL Editor
# (copy semua CREATE TABLE dari bagian Database di atas)

# 5. Aktifkan RLS di setiap tabel, terapkan policy

# 6. Buat Storage bucket bernama "foto-tiket" (public: false)

# 7. Jalankan dev server
npm run dev
```

---

## Urutan Pengerjaan yang Disarankan

1. **Setup Supabase** — buat project, jalankan schema SQL, aktifkan RLS
2. **Auth** — halaman login & register, middleware proteksi route
3. **Form laporan** — input + validasi + generate nomor tiket
4. **Dashboard pelapor** — daftar tiket + badge status
5. **Detail tiket + timeline** — real-time via Supabase Realtime
6. **Upload foto** — integrasi Supabase Storage
7. **Panel admin** — daftar semua tiket + ubah status
8. **Rating** — form bintang setelah status Selesai
9. **Deploy** — push ke GitHub → connect Vercel → set env vars

---

## Catatan Tambahan

- Nomor tiket di-generate server-side saat insert untuk menghindari duplikasi
- Real-time update status menggunakan Supabase Realtime channel subscription
- Foto disimpan di Supabase Storage dengan path `tiket/{tiket_id}/{jenis}/{filename}`
- Signed URL digunakan untuk akses foto (bukan public URL) demi keamanan
- Tambahkan `updated_at` trigger di PostgreSQL agar kolom terupdate otomatis
