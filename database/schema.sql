-- =========================================================
-- PORTAL KNPI CIBINONG — Database Schema (Supabase / PostgreSQL)
-- Jalankan seluruh file ini di: Supabase Dashboard > SQL Editor
-- =========================================================

-- ---------- 1. TABEL BERITA ----------
create table if not exists berita (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  slug text unique not null,
  ringkasan text,
  konten text not null,
  gambar_path text,          -- path di Supabase Storage bucket 'media'
  kategori text default 'Umum',
  status text default 'published', -- 'draft' | 'published'
  penulis text default 'Admin PK KNPI Cibinong',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- 2. TABEL KEGIATAN ----------
create table if not exists kegiatan (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  slug text unique not null,
  deskripsi text,
  konten text,
  gambar_path text,
  lokasi text,
  tanggal_kegiatan date,
  status text default 'published',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- 3. TABEL GALERI ----------
create table if not exists galeri (
  id uuid primary key default gen_random_uuid(),
  judul text,
  gambar_path text not null,
  kategori text default 'Dokumentasi',
  created_at timestamptz default now()
);

-- ---------- 4. TABEL PROFIL ORGANISASI (Tentang Kami) ----------
-- Single-row table untuk Visi, Misi, Sejarah singkat
create table if not exists profil_organisasi (
  id int primary key default 1,
  sejarah text,
  visi text,
  misi text,             -- disimpan sebagai JSON array string, ditampilkan per poin
  alamat text default 'Jl. Teguh Beriman No.2, Pakansari, Kec. Cibinong, Kabupaten Bogor, Jawa Barat 16915',
  maps_embed_url text,
  telepon text,
  email text,
  instagram text,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

insert into profil_organisasi (id, visi, misi)
values (1, 'Menjadi wadah pemersatu dan pengembangan potensi pemuda Kecamatan Cibinong yang mandiri, berdaya saing, dan berkontribusi nyata bagi masyarakat.',
  '["Menghimpun dan mempersatukan potensi pemuda di wilayah Kecamatan Cibinong","Mengembangkan kualitas kepemimpinan, kewirausahaan, dan kepeloporan pemuda","Menjadi mitra strategis pemerintah daerah dalam program kepemudaan","Membangun jejaring dan kolaborasi antar organisasi kepemudaan"]')
on conflict (id) do nothing;

-- ---------- 5. TABEL STRUKTUR ORGANISASI ----------
create table if not exists struktur_organisasi (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  jabatan text not null,
  urutan int default 0,      -- urutan tampil (0 = ketua, dst)
  foto_path text,
  created_at timestamptz default now()
);

-- ---------- 6. TABEL PESAN KONTAK ----------
create table if not exists pesan_kontak (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  email text not null,
  subjek text,
  pesan text not null,
  dibaca boolean default false,
  created_at timestamptz default now()
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS)
-- Publik hanya boleh membaca konten published + kirim pesan kontak.
-- Hanya user yang login (admin) yang boleh insert/update/delete.
-- =========================================================

alter table berita enable row level security;
alter table kegiatan enable row level security;
alter table galeri enable row level security;
alter table profil_organisasi enable row level security;
alter table struktur_organisasi enable row level security;
alter table pesan_kontak enable row level security;

-- BERITA
create policy "Publik lihat berita published" on berita
  for select using (status = 'published');
create policy "Admin kelola semua berita" on berita
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- KEGIATAN
create policy "Publik lihat kegiatan published" on kegiatan
  for select using (status = 'published');
create policy "Admin kelola semua kegiatan" on kegiatan
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- GALERI
create policy "Publik lihat galeri" on galeri
  for select using (true);
create policy "Admin kelola galeri" on galeri
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PROFIL ORGANISASI
create policy "Publik lihat profil" on profil_organisasi
  for select using (true);
create policy "Admin update profil" on profil_organisasi
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- STRUKTUR ORGANISASI
create policy "Publik lihat struktur" on struktur_organisasi
  for select using (true);
create policy "Admin kelola struktur" on struktur_organisasi
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PESAN KONTAK
create policy "Publik boleh kirim pesan" on pesan_kontak
  for insert with check (true);
create policy "Admin lihat pesan" on pesan_kontak
  for select using (auth.role() = 'authenticated');
create policy "Admin update status baca" on pesan_kontak
  for update using (auth.role() = 'authenticated');

-- =========================================================
-- STORAGE BUCKET
-- Buka: Supabase Dashboard > Storage > Create bucket "media" (Public bucket = ON)
-- Lalu jalankan policy di bawah ini agar publik bisa lihat gambar,
-- tapi hanya admin (login) yang bisa upload/hapus.
-- =========================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Publik lihat file media"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Admin upload file media"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "Admin hapus file media"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.role() = 'authenticated');
