# Diagram Flow Proses Bisnis

Dokumen ini memvisualisasikan alur proses bisnis utama yang berhasil diidentifikasi dari implementasi aplikasi.

## 1. Flow Login dan Validasi Sesi

```mermaid
flowchart TD
    A[User membuka halaman login] --> B[Input email dan password]
    B --> C[API Login menerima request]
    C --> D{Email ditemukan?}
    D -- Tidak --> E[Login gagal]
    D -- Ya --> F{Password valid?}
    F -- Tidak --> E
    F -- Ya --> G{DeviceId sudah ada di cookie?}
    G -- Tidak --> H[Generate deviceId baru]
    G -- Ya --> I[Cek sesi aktif device yang sama]
    I --> J{Masih aktif dan user agent sama?}
    J -- Ya --> K[Tolak login karena sudah login di device ini]
    J -- Tidak --> L[Lanjut proses login]
    H --> L
    L --> M[Generate access token]
    M --> N[Generate refresh token]
    N --> O[Simpan sesi ke auth_users]
    O --> P[Set cookie accessToken, refreshToken, deviceId]
    P --> Q[User masuk ke aplikasi]
```

## 2. Flow Otorisasi Endpoint

```mermaid
flowchart TD
    A[Request ke endpoint terproteksi] --> B[Cek accessToken dari cookie]
    B --> C{Token ada?}
    C -- Tidak --> D[401 Unauthorized]
    C -- Ya --> E[Decode access token]
    E --> F[Cari user berdasarkan userId]
    F --> G{User valid?}
    G -- Tidak --> D
    G -- Ya --> H[Cari sesi auth_users berdasarkan userId dan deviceId]
    H --> I{Sesi aktif dan belum expired?}
    I -- Tidak --> J[Hapus cookie auth]
    J --> D
    I -- Ya --> K{Role sesuai kebutuhan endpoint?}
    K -- Tidak --> L[403 Forbidden]
    K -- Ya --> M[Request diproses oleh service]
```

## 3. Flow Admin Mengubah Role User

```mermaid
flowchart TD
    A[Admin memilih user] --> B[Admin memilih role baru]
    B --> C[API update role dipanggil]
    C --> D{Admin yang login aktif?}
    D -- Tidak --> E[Proses ditolak]
    D -- Ya --> F{User target ditemukan?}
    F -- Tidak --> E
    F -- Ya --> G{Role target ditemukan?}
    G -- Tidak --> E
    G -- Ya --> H{Role baru consultant?}
    H -- Tidak --> I[Hapus semua relasi user ke team]
    H -- Ya --> J[Pertahankan atau lanjut assignment team]
    I --> K[Update role user]
    J --> K
    K --> L[Kembalikan data user terbaru]
```

## 4. Flow Admin Mengelola Team User

```mermaid
flowchart TD
    A[Admin membuka kelola team user] --> B[Pilih user dan team]
    B --> C[API update team dipanggil]
    C --> D{Admin yang login aktif?}
    D -- Tidak --> E[Proses ditolak]
    D -- Ya --> F{User target ditemukan?}
    F -- Tidak --> E
    F -- Ya --> G{Role user consultant?}
    G -- Tidak --> H[Tolak assignment team]
    G -- Ya --> I[Hapus seluruh relasi team lama]
    I --> J[Simpan relasi team baru]
    J --> K[Kembalikan data user terbaru]
```

## 5. Flow Admin Mengubah Status User

```mermaid
flowchart TD
    A[Admin memilih aktif atau nonaktif user] --> B[API update status dipanggil]
    B --> C{Admin yang login aktif?}
    C -- Tidak --> D[Proses ditolak]
    C -- Ya --> E{User target ditemukan?}
    E -- Tidak --> D
    E -- Ya --> F[Toggle nilai isActive]
    F --> G[Simpan perubahan]
    G --> H[Kembalikan data user terbaru]
```

## 6. Flow Update Profil

```mermaid
flowchart TD
    A[User membuka profil] --> B[User ubah nama, email, avatar]
    B --> C[API update profil dipanggil]
    C --> D[Cek user dari header autentikasi]
    D --> E{Avatar baru diunggah?}
    E -- Ya --> F[Hapus avatar lama dari Cloudinary]
    F --> G[Upload avatar baru]
    E -- Tidak --> H[Lewati proses avatar]
    G --> I[Cek email unik]
    H --> I
    I --> J{Email sudah dipakai user lain?}
    J -- Ya --> K[Validasi gagal]
    J -- Tidak --> L[Update profil user]
    L --> M[Profil berhasil diperbarui]
```

## 7. Flow Konseptual Ticketing

Diagram ini bersifat konseptual karena model database ticketing sudah tersedia, tetapi API operasional tiket belum ditemukan.

```mermaid
flowchart TD
    A[Project dibuat] --> B[Phase tiket disiapkan]
    B --> C[Tiket dibuat]
    C --> D[Label ditambahkan]
    D --> E[User ditugaskan]
    E --> F[Diskusi atau reply ditambahkan]
    F --> G[Tiket berpindah phase]
    G --> H{Pekerjaan selesai?}
    H -- Tidak --> F
    H -- Ya --> I[Tiket selesai]
```

## 8. Flow Existing Handover Manual

Bagian ini menggambarkan kondisi bisnis sebelum menggunakan aplikasi ticketing, ketika proses handover antar shift masih mengandalkan komunikasi verbal.

```mermaid
flowchart TD
    A[Engineer Shift 1 mengerjakan sebagian pekerjaan] --> B[Hasil pekerjaan belum terdokumentasi terstruktur]
    B --> C[Handover dilakukan secara verbal]
    C --> D[Engineer Shift 2 menerima informasi secara lisan]
    D --> E{Informasi lengkap dan konsisten?}
    E -- Tidak --> F[Detail pekerjaan, kendala, dan progres tidak lengkap]
    F --> G[Engineer Shift 2 mengulang analisis atau pekerjaan]
    G --> H[Waktu penanganan bertambah]
    H --> I[Efisiensi kerja menurun]
    E -- Ya --> J[Pekerjaan dapat dilanjutkan]
```

## 9. Flow Solusi Menggunakan Aplikasi Ticketing

Bagian ini menggambarkan kondisi bisnis setelah proses handover dibantu aplikasi ticketing sehingga informasi kerja tercatat dan dapat ditelusuri antar shift.

```mermaid
flowchart TD
    A[Engineer Shift 1 mengerjakan tiket] --> B[Engineer Shift 1 mencatat progres, kendala, dan next action pada tiket]
    B --> C[Tiket disimpan pada project dan phase yang sesuai]
    C --> D[Reply atau histori aktivitas tersimpan pada sistem]
    D --> E[Engineer Shift 2 membuka tiket yang sama]
    E --> F[Engineer Shift 2 membaca status terakhir, catatan, dan histori handover]
    F --> G{Informasi kerja sudah lengkap?}
    G -- Ya --> H[Pekerjaan dilanjutkan dari progres terakhir]
    H --> I[Pengulangan pekerjaan berkurang]
    I --> J[Continuity antar shift meningkat]
    G -- Tidak --> K[Engineer Shift 2 menambahkan pembaruan lanjutan pada tiket]
    K --> H
```
