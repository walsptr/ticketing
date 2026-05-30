# Analisis Aplikasi Ticketing

## 1. Gambaran Umum

Aplikasi `ticketing-ms` merupakan aplikasi web berbasis `Next.js` dengan `App Router` yang menggabungkan antarmuka pengguna dan API dalam satu project. Berdasarkan implementasi yang ada, sistem saat ini paling matang pada area:

- autentikasi dan manajemen sesi multi-perangkat,
- pengelolaan profil pengguna,
- administrasi pengguna oleh admin,
- pengelolaan role dan tim,
- fondasi domain ticketing pada level database.

Teknologi utama yang digunakan:

- `Next.js 14` dan `React 18`,
- `TypeScript`,
- `Tailwind CSS`,
- `Drizzle ORM` dengan `PostgreSQL`,
- `jose` untuk JWT,
- `Cloudinary` untuk upload avatar,
- `Winston` untuk logging.

## 2. Arsitektur Singkat

Struktur aplikasi dibagi menjadi beberapa area utama:

- `app/`
  - halaman UI,
  - route API,
  - layout global,
  - middleware berbasis request.
- `lib/`
  - model database,
  - schema database,
  - DTO,
  - mapper,
  - utility,
  - middleware API.
- `config/`
  - konfigurasi database,
  - logger,
  - cloudinary.
- `scripts/`
  - reset database,
  - seeding,
  - generator schema dan seeder.

Pola arsitektur yang tampak:

- `route.ts` menangani endpoint HTTP,
- `service.ts` memuat business logic,
- middleware API digunakan untuk logging, error handling, dan authorization,
- data persistence dikelola melalui Drizzle ORM.

## 3. Aktor Sistem

Berikut aktor utama yang berhasil diidentifikasi:

### Admin

Memiliki hak akses administratif, antara lain:

- melihat daftar user,
- mengubah role user,
- mengubah status aktif atau nonaktif user,
- mengelola assignment tim user,
- mengakses endpoint administratif.

### Consultant

Merupakan user operasional yang dapat:

- login ke sistem,
- melihat dan memperbarui profil sendiri,
- mengganti password,
- memiliki relasi ke satu atau lebih tim.

### Project Coordinator

Role ini sudah tersedia pada seeder database, namun alur operasional spesifiknya belum ditemukan pada API aktif. Karena itu, peran ini masih dipandang sebagai role domain yang sudah disiapkan tetapi belum sepenuhnya diimplementasikan pada proses bisnis di layer API.

## 4. Modul Utama

### 4.1 Autentikasi

Fitur yang tersedia:

- login,
- refresh token,
- logout,
- daftar perangkat aktif,
- guard akses endpoint.

Karakteristik proses autentikasi:

- login menggunakan email dan password,
- sistem menyimpan `deviceId` untuk membedakan sesi per perangkat,
- sistem mencegah login ganda pada device yang sama jika sesi masih aktif,
- access token dan refresh token digunakan secara bersamaan,
- refresh token disimpan dalam bentuk hash di database.

### 4.2 Profil Pengguna

User dapat:

- melihat data profil sendiri,
- memperbarui nama dan email,
- memperbarui avatar melalui upload ke Cloudinary,
- mengganti password.

### 4.3 Manajemen Pengguna

Admin dapat:

- melihat seluruh user,
- mengubah role user,
- mengubah tim user,
- mengubah status user menjadi aktif atau nonaktif.

### 4.4 Fondasi Ticketing

Walaupun endpoint tiket belum ditemukan, struktur data ticketing sudah tersedia. Ini menunjukkan aplikasi diarahkan ke sistem manajemen proyek dan tiket dengan unsur:

- project,
- ticket phase,
- ticket,
- sub-task,
- label tiket,
- assignment user ke tiket,
- reply atau komentar tiket.

## 5. Entitas Utama

### User

Menyimpan data inti pengguna:

- nama,
- email,
- password,
- avatar,
- role,
- status aktif.

### Role

Menyimpan kategori hak akses:

- admin,
- consultant,
- project coordinator.

### Team

Mewadahi pengelompokan consultant. Relasi user ke team memakai tabel penghubung `users_to_teams`.

### AuthUser

Menyimpan data sesi login:

- user,
- device,
- refresh token,
- user agent,
- IP address,
- waktu kedaluwarsa,
- status revocation.

### Project

Representasi proyek yang nantinya menjadi induk dari tiket.

### TicketPhase

Tahapan status tiket dalam satu proyek, misalnya backlog, progress, review, atau done.

### Ticket

Representasi item kerja utama. Tiket memiliki:

- proyek,
- fase,
- pembuat,
- kode referensi,
- urutan tampilan,
- tanggal mulai,
- tanggal jatuh tempo,
- flag task atau non-task,
- parent ticket untuk mendukung sub-task.

### TicketLabel

Label kategorisasi tiket.

### AssignedToTicket

Relasi penugasan user ke tiket.

### TicketReply

Komentar atau balasan dalam tiket, termasuk durasi kerja bila diperlukan.

## 6. Aturan Bisnis yang Teridentifikasi

Aturan bisnis inti yang terlihat dari kode:

1. User wajib login dengan email dan password yang valid.
2. Satu device tidak boleh menyimpan dua sesi aktif untuk user yang sama pada saat bersamaan.
3. Akses endpoint tertentu dibatasi oleh role melalui middleware authorization.
4. User yang sedang tidak aktif tidak boleh melakukan aksi administratif.
5. Hanya user dengan role `consultant` yang boleh di-assign ke tim.
6. Jika role user diubah menjadi selain `consultant`, seluruh relasi tim user tersebut dihapus otomatis.
7. Email pada update profil harus unik.
8. Sesi login dapat direvoke pada saat logout atau refresh token.

## 7. Kelebihan Desain Saat Ini

- Business logic sudah dipisahkan dari handler endpoint.
- Middleware API cukup rapi untuk logging, error handling, dan authorization.
- Struktur domain ticketing sudah dipersiapkan sejak level database.
- Sistem autentikasi memperhatikan aspek multi-device dan revocation session.

## 8. Keterbatasan yang Terlihat

- Endpoint operasional ticketing belum ditemukan sehingga proses inti ticket lifecycle belum dapat diverifikasi penuh dari API.
- Role `project coordinator` sudah ada, tetapi perilaku bisnis spesifiknya belum tampak pada implementasi aktif.
- Terdapat indikasi konflik merge pada `package.json`, sehingga repository masih memerlukan pembersihan sebelum digunakan lebih lanjut.

## 9. Kesimpulan

Project ini sudah membentuk fondasi yang baik untuk aplikasi ticketing internal berbasis role. Implementasi yang paling siap digunakan saat ini adalah autentikasi dan administrasi user. Sementara itu, domain ticketing sudah sangat jelas di layer database, sehingga tahap pengembangan berikutnya paling mungkin berfokus pada pembuatan API dan UI untuk proses ticket management end-to-end.
