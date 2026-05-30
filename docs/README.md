# Dokumentasi Analisis Aplikasi Ticketing

Folder ini berisi hasil analisis project `ticketing-ms` berdasarkan struktur kode, service API, middleware, dan model database yang tersedia pada repository.

## Daftar Dokumen

1. `analisis-aplikasi.md`
   - Ringkasan arsitektur, modul utama, aktor, dan aturan bisnis inti.
2. `diagram-flow.md`
   - Diagram flow proses bisnis utama dalam format Mermaid.
3. `uml.md`
   - Diagram UML berupa use case, class diagram, dan sequence diagram.
4. `sop-bisnis.md`
   - SOP bisnis yang menjelaskan prosedur operasional utama aplikasi.

## Catatan Analisis

- Aplikasi yang sudah terimplementasi secara aktif berfokus pada autentikasi, pengelolaan profil, dan administrasi pengguna.
- Domain ticketing sudah tersedia cukup lengkap pada level model dan skema database, namun endpoint API operasional tiket belum ditemukan pada direktori `app/api`.
- Role yang terdeteksi dari data seeder adalah `admin`, `consultant`, dan `project coordinator`.
