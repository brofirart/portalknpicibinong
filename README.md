# Portal KNPI Cibinong

Website resmi PK KNPI Cibinong — HTML/CSS/JS (statis) + Supabase (database, auth, storage) + deploy via Netlify & GitHub.

## 📁 Struktur Project

```
portal-knpi-cibinong/
├── index.html              (Beranda)
├── tentang.html             (Profil, Visi Misi, Struktur, Maps)
├── berita.html               (List berita)
├── berita-detail.html        (Detail berita)
├── kegiatan.html              (List kegiatan)
├── kegiatan-detail.html       (Detail kegiatan)
├── galeri.html                 (Galeri dokumentasi + lightbox)
├── kontak.html                 (Form kontak + maps)
├── admin/
│   ├── login.html              (Login admin)
│   └── dashboard.html          (CRUD semua konten)
├── assets/
│   ├── css/style.css
│   ├── js/ (supabase-client.js, main.js, admin.js)
│   └── img/ (logo-portal.png, logo-knpi.png)
└── database/
    └── schema.sql              (Jalankan ini di Supabase)
```

## 🚀 Langkah Setup (urutkan sesuai nomor)

### 1. Buat Project Supabase (gratis)
1. Buka [supabase.com](https://supabase.com) → Sign up / Login → **New Project**.
2. Beri nama, pilih region terdekat (Singapore), buat password database (simpan baik-baik).
3. Tunggu ± 2 menit sampai project selesai dibuat.

### 2. Jalankan Database Schema
1. Di dashboard Supabase, buka menu **SQL Editor** → **New query**.
2. Buka file `database/schema.sql`, copy semua isinya, paste ke SQL Editor.
3. Klik **Run**. Ini akan otomatis membuat:
   - Tabel `berita`, `kegiatan`, `galeri`, `profil_organisasi`, `struktur_organisasi`, `pesan_kontak`
   - Aturan keamanan (RLS) — publik hanya bisa baca, admin (login) bisa kelola semua data
   - Storage bucket `media` untuk upload gambar

### 3. Buat Akun Admin
1. Di dashboard Supabase → menu **Authentication** → **Users** → **Add user**.
2. Isi email & password admin (misal: `admin@knpicibinong.org`).
3. Centang **Auto Confirm User** supaya bisa langsung login tanpa verifikasi email.
4. Akun ini yang dipakai untuk login di halaman `admin/login.html`.

> Ingin tambah admin lain? Ulangi langkah yang sama untuk setiap pengurus yang perlu akses.

### 4. Hubungkan Website ke Supabase
1. Di dashboard Supabase → **Settings** → **API**.
2. Copy **Project URL** dan **anon public key**.
3. Buka file `assets/js/supabase-client.js`, ganti dua baris ini:
   ```js
   const SUPABASE_URL = "https://GANTI-DENGAN-PROJECT-ID.supabase.co";
   const SUPABASE_ANON_KEY = "GANTI-DENGAN-ANON-PUBLIC-KEY";
   ```
   dengan nilai asli dari Supabase project Anda.

### 5. Upload ke GitHub
1. Buat repository baru di GitHub (misal: `portal-knpi-cibinong`).
2. Upload semua file/folder project ini ke repository tersebut.

### 6. Deploy ke Netlify
1. Buka [netlify.com](https://netlify.com) → Login (bisa pakai akun GitHub).
2. **Add new site** → **Import an existing project** → pilih **GitHub** → pilih repository ini.
3. Build settings: kosongkan **Build command**, isi **Publish directory** dengan `.` (titik, karena ini website statis tanpa proses build).
4. Klik **Deploy**. Netlify otomatis akan re-deploy setiap kali Anda push perubahan ke GitHub.

### 7. Isi Konten Awal
1. Buka `https://nama-situs-anda.netlify.app/admin/login.html`, login dengan akun admin.
2. Isi tab **Profil & Visi Misi** (sejarah, visi, misi, telepon, email).
3. Tambahkan data di tab **Struktur Organisasi** (urutan 0 untuk Ketua, angka lebih besar untuk jabatan di bawahnya).
4. Mulai tambahkan **Berita**, **Kegiatan**, dan **Galeri**.

## ✅ Catatan Keamanan
- Publik hanya bisa **melihat** konten berstatus "Terbitkan" — tidak bisa mengubah/menghapus apa pun.
- Hanya pengguna yang login (akun admin di Supabase Auth) yang bisa menambah, mengedit, atau menghapus konten.
- Form kontak di halaman publik hanya bisa **mengirim** pesan baru, tidak bisa membaca pesan orang lain.

## 🎨 Desain
Warna dan tipografi diambil langsung dari lambang KNPI:
- Biru `#0047AB`, Biru Muda `#4478DE`, Marun `#4D141B`, Kuning Emas `#FFD500`
- Font: Space Grotesk (judul), Inter (isi), IBM Plex Mono (label/tanggal)
- Elemen khas: potongan diagonal ala bentuk perisai lambang KNPI, dipakai sebagai pembatas antar-section.

## 🔧 Pengembangan Lanjutan (opsional)
- Tambah pagination di halaman Berita/Kegiatan jika jumlah data sudah banyak.
- Tambah upload foto ke tabel `struktur_organisasi` (kolom `foto_path` sudah tersedia di schema, tinggal ditambahkan input file di form admin).
- Tambah kategori/filter di halaman Galeri.
