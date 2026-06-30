# Panduan Lengkap Setup Supabase - Aplikasi Pengaduan AKPOL

Dokumen ini memandu Anda langkah demi langkah dalam menyiapkan backend Supabase untuk aplikasi pengaduan AKPOL.

## Langkah 1: Buat Project Supabase Baru
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan login/register.
2. Klik **"New Project"**, lalu pilih organisasi (atau buat baru).
3. Isi detail project:
   - **Name**: `Akpol Complaint App` (atau sesuai keinginan)
   - **Database Password**: Buat password yang kuat dan *simpan baik-baik*.
   - **Region**: Pilih region terdekat (misal: `Singapore`).
4. Klik **"Create new project"** dan tunggu beberapa menit hingga database siap.

## Langkah 2: Menjalankan SQL Schema (Tabel & Trigger)
Setelah project siap, masuk ke menu **SQL Editor** di sidebar kiri. Buat *New query* dan jalankan script SQL berikut secara keseluruhan untuk membuat tabel dan fungsi trigger untuk `updated_at`.

```sql
-- 1. Buat fungsi trigger untuk update kolom updated_at secara otomatis
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 2. Buat tabel profiles
create table profiles (
  id          uuid primary key references auth.users(id),
  nama        text not null,
  nrp         text unique,
  role        text default 'pelapor' check (role in ('pelapor','admin','teknisi')),
  unit        text,
  created_at  timestamptz default now()
);

-- 3. Buat tabel tiket
create table tiket (
  id            uuid primary key default gen_random_uuid(),
  nomor         text unique not null,
  pelapor_id    uuid references profiles(id),
  judul         text not null,
  deskripsi     text,
  lokasi        text not null,
  kategori      text not null check (kategori in ('sanitasi_air','kelistrikan','bangunan_struktur','ac_ventilasi','lainnya')),
  status        text default 'masuk' check (status in ('masuk','diverifikasi','diproses','ditangani','selesai','ditolak')),
  estimasi_hari int,
  alasan_tolak  text,
  handler_id    uuid references profiles(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Pasang trigger pada tabel tiket
create trigger update_tiket_updated_at
before update on tiket
for each row
execute function update_updated_at_column();

-- 4. Buat tabel status_log
create table status_log (
  id          uuid primary key default gen_random_uuid(),
  tiket_id    uuid references tiket(id) on delete cascade,
  status_lama text,
  status_baru text not null,
  catatan     text,
  oleh_id     uuid references profiles(id),
  created_at  timestamptz default now()
);

-- 5. Buat tabel foto_tiket
create table foto_tiket (
  id          uuid primary key default gen_random_uuid(),
  tiket_id    uuid references tiket(id) on delete cascade,
  jenis       text not null check (jenis in ('bukti','progres','sebelum','sesudah')),
  storage_path text not null,
  diunggah_oleh uuid references profiles(id),
  created_at  timestamptz default now()
);

-- 6. Buat tabel rating
create table rating (
  id          uuid primary key default gen_random_uuid(),
  tiket_id    uuid references tiket(id) unique,
  pelapor_id  uuid references profiles(id),
  bintang     int not null check (bintang between 1 and 5),
  komentar    text,
  created_at  timestamptz default now()
);
```

## Langkah 3: Mengaktifkan Row Level Security (RLS)
Supabase sangat mengandalkan RLS untuk keamanan data. Buka *New query* lagi di **SQL Editor** dan jalankan script berikut untuk menerapkan kebijakan akses (Policies) pada tabel `tiket`. Anda juga perlu mengaktifkan RLS untuk tabel-tabel tersebut.

```sql
-- Aktifkan RLS untuk semua tabel
alter table profiles enable row level security;
alter table tiket enable row level security;
alter table status_log enable row level security;
alter table foto_tiket enable row level security;
alter table rating enable row level security;

-- =====================================
-- RLS POLICIES UNTUK TABEL TIKET
-- =====================================

-- 1. Pelapor hanya bisa melihat tiket miliknya sendiri
create policy "pelapor lihat tiket sendiri"
  on tiket for select
  using (pelapor_id = auth.uid());

-- 2. Pelapor bisa membuat tiket baru
create policy "pelapor buat tiket"
  on tiket for insert
  with check (pelapor_id = auth.uid());

-- 3. Admin dan Teknisi bisa melihat semua tiket
create policy "admin dan teknisi lihat semua tiket"
  on tiket for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin','teknisi')
    )
  );

-- 4. Admin dan Teknisi bisa melakukan update pada tiket
create policy "admin dan teknisi update tiket"
  on tiket for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin','teknisi')
    )
  );
```
*(Catatan: RLS policies untuk `profiles`, `status_log`, `foto_tiket`, dan `rating` dapat disesuaikan nantinya jika dibutuhkan, namun ini adalah aturan dasar untuk alur tiket)*.

## Langkah 4: Automasi Pembuatan Profile setelah Registrasi
Agar setiap user yang baru mendaftar (via Supabase Auth) otomatis dibuatkan datanya di tabel `profiles`, jalankan script trigger ini di **SQL Editor**:

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nama, nrp)
  values (new.id, new.raw_user_meta_data->>'nama', new.raw_user_meta_data->>'nrp');
  return new;
end;
$$ language plpgsql security definer;

-- Pasang trigger ketika user mendaftar di Auth Supabase
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Langkah 5: Mengatur Supabase Storage (Untuk Foto)
1. Buka menu **Storage** di sidebar kiri.
2. Klik tombol **"New Bucket"**.
3. Isi nama bucket dengan: `foto-tiket`.
4. **JANGAN** centang *"Public bucket"* (biarkan mati) karena akses gambar butuh keamanan ekstra menggunakan sistem *Signed URL*.
5. Klik **Save**.
6. *(Penting)*: Untuk mempermudah pembuatan Policy akses foto, Anda tidak perlu menggunakan template UI. Cukup buka menu **SQL Editor** (seperti langkah sebelumnya) dan jalankan script SQL berikut agar user yang login bisa mengunggah dan melihat foto:

```sql
-- Policy agar user yang login bisa upload (INSERT) ke bucket foto-tiket
create policy "User login bisa upload foto"
  on storage.objects for insert
  with check ( bucket_id = 'foto-tiket' and auth.role() = 'authenticated' );

-- Policy agar user yang login bisa melihat (SELECT) dari bucket foto-tiket
create policy "User login bisa lihat foto"
  on storage.objects for select
  using ( bucket_id = 'foto-tiket' and auth.role() = 'authenticated' );
```

## Langkah 6: Mengambil Kredensial API untuk Project Next.js
1. Buka menu **Project Settings** (ikon gerigi di bagian bawah sidebar kiri).
2. Pilih menu **API** di bawah kategori Configuration.
3. Salin kunci-kunci berikut dan masukkan ke file `.env.local` di project Next.js Anda:

```env
# Contoh isi .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[ID-PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```
- **Project URL** disalin ke `NEXT_PUBLIC_SUPABASE_URL`
- **Project API Keys (anon / public)** disalin ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Project API Keys (service_role)** disalin ke `SUPABASE_SERVICE_ROLE_KEY` *(Catatan: Khusus service role, gunakan dengan hati-hati hanya di Backend/Server-Side Action karena dapat mem-bypass semua RLS).*

---
✅ **Selesai!** Jika semua langkah di atas sudah dilakukan, Database PostgreSQL, Auth, dan Storage dari Supabase Anda sudah siap digunakan. Anda bisa beralih ke kodingan Next.js.
