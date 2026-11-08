# 🎓 Sistem Ujian Digital UTS (Essay Online)

Platform ujian digital berbasis web untuk pelaksanaan Ujian Tengah Semester (UTS) essay mandiri yang aman, terstruktur, dan profesional.

---

## 🌟 Fitur Utama

### 1. Sisi Mahasiswa (Ujian Mandiri)
- **Tanpa Perlu Pre-Registrasi Data Mahasiswa:** Mahasiswa langsung mengisi Nama Lengkap & NIM di formulir masuk, lalu memilih Mata Kuliah dan Kelas yang tersedia.
- **Pengaman Integritas Ujian (Minim Bug & Ramah Perangkat):**
  - **Anti Copy-Paste & Cut:** Mencegah mahasiswa menempel teks dari ChatGPT atau sumber luar.
  - **Blokir Klik Kanan (Context Menu) & Shortcut DevTools:** `Ctrl+C`, `Ctrl+V`, `Ctrl+U`, `F12`, `Ctrl+Shift+I` diblokir.
  - **Anti-DevTools Debugger:** Proteksi otomatis via debugger loop dan console suppression.
  - **Clipboard Wiper:** Tombol `PrintScreen` otomatis mengosongkan clipboard.
  - **Bebas Split Screen / Tab Reference:** Mahasiswa diperkenankan membuka referensi/materi di tab lain atau split screen, tetapi **wajib mengetik sendiri** jawabannya di lembar ujian.
  - **Watermark Dinamis:** Latar belakang ujian diisi watermark transparan berisi Nama & NIM mahasiswa secara diagonal.
- **Timer Hitung Mundur & Auto-Submit:** Waktu ujian terpantau real-time. Jika waktu habis, seluruh jawaban otomatis dikumpulkan ke server.
- **Navigasi Soal Fleksibel:** Dilengkapi kotak navigasi nomor soal (Warna Hijau = sudah dijawab, Abu-abu = belum dijawab, Ring Hijau = soal aktif).
- **Indikator Minimum Kata:** Menampilkan jumlah kata yang sudah diketik vs batas minimal kata yang ditentukan oleh dosen.
- **Penyimpanan Otomatis (Auto-Save):** Jawaban otomatis tersimpan ke server secara berkala saat mengetik dan saat berpindah soal.

### 2. Sisi Dosen (Admin Panel)
- **Manajemen Mata Kuliah Dinamis:** Tambah, edit, dan hapus mata kuliah kapan saja.
- **Manajemen Kelas Paralel:** Setiap mata kuliah dapat dibagi ke beberapa kelas (Kelas A, Kelas B, Kelas TI-3A, dll).
- **Pengaturan Ujian & Soal Essay:**
  - Atur Judul Ujian, Durasi Ujian (Menit), dan Syarat Minimal Kata.
  - Tombol toggle status: **AKTIF** (bisa diakses mahasiswa) atau **NON-AKTIF** (tutup akses).
  - Tambah, edit, hapus, dan atur ulang nomor urut soal essay beserta bobot poin.
- **Pemeriksaan Jawaban & Unduh Lembar Jawaban (PDF):**
  - Pratinjau langsung seluruh jawaban essay mahasiswa di modal web.
  - **Unduh PDF Resmi:** Menghasilkan lembar jawaban digital lengkap dengan kop ujian, biodata mahasiswa, waktu pengerjaan, dan seluruh teks jawaban.
  - **Ekspor CSV (1-Klik ke Excel / Google Sheets):** Rekap nilai dan status pengerjaan seluruh mahasiswa bisa langsung diekspor ke Google Sheets / Excel.
- **Ubah Sandi Dosen:** Fitur ganti password admin kapan saja di menu Pengaturan.

---

## 🎨 Tampilan & Desain
- **Light Theme Bersih & Institusional:** Tanpa dark mode, tanpa estetika "AI", khusus dirancang untuk kebutuhan resmi universitas.
- **Warna Emerald Green Pekat:** Dominan hijau zamrud elegan (`#047857` / `#059669`) dipadukan dengan putih dan abu-abu slate bersih.

---

## 🚀 Panduan Menjalankan Sistem

### 1. Hubungkan ke Database Supabase
Buka project baru di [Supabase](https://supabase.com) (gratis), lalu salin Connection String PostgreSQL.

Buat file `.env` di dalam folder `exam-app`:
```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

NEXTAUTH_SECRET="buat-random-string-rahasia-minimal-32-karakter"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Migrasi Database & Buat Akun Dosen
Jalankan perintah berikut di terminal:
```bash
# Push schema tabel ke Supabase
npx prisma db push

# Buat akun admin default
node prisma/seed.js
```

Akun login default:
- **URL Admin:** `http://localhost:3000/admin/login`
- **Username:** `admin`
- **Password:** `admin123` *(Segera ubah di menu Pengaturan setelah login)*

### 3. Jalankan Server Development
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 🌐 Panduan Deploy ke Vercel & GitHub

1. Push folder proyek ke repository GitHub Anda:
   ```bash
   git add .
   git commit -m "feat: complete digital exam system for UTS"
   git push origin main
   ```
2. Buka [Vercel](https://vercel.com) dan pilih **Add New Project** -> **Import Git Repository**.
3. Pada bagian **Environment Variables** di Vercel, masukkan:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (Isi domain Vercel Anda, misal: `https://ujian-uts-digital.vercel.app`)
4. Klik **Deploy**. Website ujian langsung online dan siap digunakan oleh seluruh mahasiswa!
