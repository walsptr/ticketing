# SOP Bisnis Aplikasi Ticketing

Dokumen ini merangkum standar operasional prosedur bisnis berdasarkan implementasi sistem yang tersedia saat ini.

## 1. SOP Login Pengguna

### Tujuan

Memastikan hanya pengguna yang memiliki kredensial valid dapat masuk ke sistem.

### Aktor

- seluruh user yang terdaftar.

### Prasyarat

- user sudah memiliki akun aktif,
- user mengetahui email dan password,
- perangkat yang dipakai valid dan tidak memiliki sesi aktif ganda untuk user yang sama.

### Langkah Proses

1. User membuka halaman login.
2. User mengisi email dan password.
3. Sistem memverifikasi email.
4. Sistem memverifikasi password.
5. Sistem memeriksa `deviceId`.
6. Jika `deviceId` belum ada, sistem membuat device baru.
7. Jika `deviceId` sudah ada, sistem memeriksa apakah masih ada sesi aktif pada device tersebut.
8. Jika sesi lama masih aktif pada device yang sama, login ditolak.
9. Jika valid, sistem membuat access token dan refresh token.
10. Sistem menyimpan sesi login pada tabel `auth_users`.
11. Sistem mengirim user ke halaman setelah login.

### Output

- user berhasil masuk ke aplikasi,
- cookie sesi tersimpan,
- data sesi terekam di database.

## 2. SOP Logout Pengguna

### Tujuan

Mengakhiri sesi login user secara aman.

### Aktor

- seluruh user yang sedang login.

### Langkah Proses

1. User memilih logout dari aplikasi.
2. Sistem mencari sesi aktif berdasarkan user dan device.
3. Sistem menandai sesi tersebut sebagai `revoked`.
4. Sistem menghapus cookie autentikasi.
5. User keluar dari sistem.

### Output

- sesi user tidak lagi valid,
- user harus login kembali untuk mengakses sistem.

## 3. SOP Pengelolaan Profil

### Tujuan

Menjaga data identitas user tetap akurat dan mutakhir.

### Aktor

- seluruh user yang login.

### Langkah Proses

1. User membuka halaman profil.
2. Sistem menampilkan data profil, role, dan tim user.
3. User memperbarui nama, email, dan bila diperlukan avatar.
4. Jika avatar baru diunggah, sistem menghapus avatar lama dari penyimpanan cloud.
5. Sistem mengunggah avatar baru.
6. Sistem memverifikasi bahwa email baru belum dipakai user lain.
7. Jika valid, sistem menyimpan perubahan profil.

### Aturan Bisnis

- email harus unik,
- update profil hanya boleh dilakukan oleh user yang sedang terautentikasi.

### Output

- data profil tersimpan dengan versi terbaru.

## 4. SOP Perubahan Password

### Tujuan

Menjaga keamanan akun pengguna.

### Aktor

- seluruh user yang login.

### Langkah Proses

1. User membuka form perubahan password.
2. User memasukkan password lama dan password baru.
3. Sistem memverifikasi password lama.
4. Jika valid, sistem melakukan hashing password baru.
5. Sistem menyimpan password baru ke database.
6. Bila konfigurasi meminta logout semua device, sistem merevoke seluruh sesi aktif user.

### Output

- password user berhasil diperbarui,
- sesi lama dapat berakhir bila fitur logout semua perangkat digunakan.

## 5. SOP Admin Melihat Daftar User

### Tujuan

Memberikan visibilitas data user untuk kebutuhan administrasi.

### Aktor

- admin.

### Prasyarat

- admin sudah login dan masih aktif.

### Langkah Proses

1. Admin membuka menu manajemen user.
2. Sistem memverifikasi hak akses admin.
3. Sistem mengambil daftar user beserta role dan team.
4. Sistem menampilkan data user ke halaman administrasi.

### Output

- admin memperoleh daftar user lengkap untuk dikelola.

## 6. SOP Admin Mengubah Role User

### Tujuan

Mengatur hak akses user sesuai kebutuhan organisasi.

### Aktor

- admin.

### Langkah Proses

1. Admin memilih user target.
2. Admin memilih role baru.
3. Sistem memverifikasi admin yang melakukan aksi masih aktif.
4. Sistem memverifikasi user target tersedia.
5. Sistem memverifikasi role tujuan tersedia.
6. Jika role baru bukan `consultant`, sistem menghapus seluruh relasi tim user tersebut.
7. Sistem menyimpan role baru user.
8. Sistem menampilkan data user yang telah diperbarui.

### Aturan Bisnis

- hanya admin yang boleh mengubah role,
- user non-consultant tidak boleh tetap memiliki assignment tim.

### Output

- role user berhasil diperbarui secara konsisten.

## 7. SOP Admin Mengatur Team User

### Tujuan

Menempatkan user consultant ke dalam tim yang sesuai.

### Aktor

- admin.

### Langkah Proses

1. Admin memilih user target.
2. Admin memilih satu atau lebih team.
3. Sistem memverifikasi admin yang melakukan aksi masih aktif.
4. Sistem memverifikasi user target tersedia.
5. Sistem memverifikasi bahwa role user adalah `consultant`.
6. Sistem menghapus seluruh relasi team lama user.
7. Sistem menyimpan assignment team baru.
8. Sistem menampilkan data user terbaru.

### Aturan Bisnis

- hanya user dengan role `consultant` yang boleh dimasukkan ke team,
- perubahan team dilakukan dengan mekanisme replace seluruh assignment sebelumnya.

### Output

- user consultant memiliki assignment team terbaru yang valid.

## 8. SOP Admin Mengaktifkan atau Menonaktifkan User

### Tujuan

Mengendalikan status operasional user di dalam sistem.

### Aktor

- admin.

### Langkah Proses

1. Admin memilih user target.
2. Admin menjalankan aksi ubah status.
3. Sistem memverifikasi admin yang melakukan aksi masih aktif.
4. Sistem mengambil data user target.
5. Sistem membalik nilai `isActive`.
6. Sistem menyimpan status baru.
7. Sistem menampilkan hasil perubahan.

### Aturan Bisnis

- admin yang sedang nonaktif tidak boleh melakukan aksi administratif.

### Output

- status user berubah menjadi aktif atau nonaktif sesuai hasil toggle.

## 9. SOP Pengelolaan Sesi Perangkat

### Tujuan

Menjaga keamanan sesi login lintas perangkat.

### Aktor

- seluruh user,
- sistem autentikasi.

### Langkah Proses

1. Sistem menyimpan informasi device pada saat login.
2. Sistem menyimpan refresh token dalam bentuk hash.
3. Pada endpoint terproteksi, sistem memverifikasi access token.
4. Sistem mencocokkan token dengan sesi aktif di database.
5. Jika sesi tidak valid atau sudah kedaluwarsa, akses ditolak.
6. Saat logout atau refresh token, sesi lama dapat direvoke.

### Output

- konsistensi autentikasi antar perangkat tetap terjaga.

## 10. SOP Bisnis Konseptual Ticketing

Bagian ini disusun dari model database yang sudah tersedia, sehingga bersifat rancangan bisnis konseptual.

### Tujuan

Mengelola pekerjaan berbasis project dan ticket.

### Aktor

- admin,
- consultant,
- project coordinator.

### Langkah Proses

1. Project dibuat sebagai wadah pekerjaan.
2. Phase ticket disiapkan untuk menggambarkan status alur kerja.
3. Ticket dibuat dalam sebuah project.
4. Ticket dapat diberi label untuk klasifikasi.
5. Ticket dapat di-assign ke satu atau lebih user.
6. User dapat menambahkan reply atau catatan progres.
7. Ticket dipindahkan antar phase sampai selesai.
8. Ticket dapat memiliki sub-task melalui relasi parent-child.

### Output

- pekerjaan proyek dapat dipantau secara terstruktur.

## 11. Rekomendasi Pengembangan Lanjutan

Untuk menyempurnakan SOP bisnis, tahap pengembangan berikut dianjurkan:

1. menambahkan API CRUD project,
2. menambahkan API CRUD ticket,
3. menambahkan API perpindahan phase ticket,
4. menambahkan API assignment user ke ticket,
5. menambahkan audit trail aktivitas user,
6. menambahkan SOP operasional khusus untuk role `project coordinator`.
