# Rencana Penambahan Flow Bisnis Handover Ticketing

## Ringkasan

Menambahkan dokumentasi flow bisnis pada folder `docs` untuk membandingkan proses handover atau ticketing yang masih manual dengan proses yang sudah menggunakan aplikasi `ticketing-ms`. Fokus perubahan ada pada dokumentasi, bukan implementasi fitur aplikasi.

## Analisis Kondisi Saat Ini

- Folder `docs` sudah berisi dokumentasi analisis aplikasi, flow diagram, UML, dan SOP bisnis.
- File `docs/diagram-flow.md` sudah memiliki beberapa diagram Mermaid dengan format terstruktur per topik, termasuk satu bagian `Flow Konseptual Ticketing`.
- File `docs/sop-bisnis.md` sudah memiliki bagian `SOP Bisnis Konseptual Ticketing`, tetapi belum menjelaskan perbandingan eksplisit antara proses manual dan proses setelah menggunakan aplikasi.
- Berdasarkan model domain yang tersedia, aplikasi diposisikan sebagai solusi untuk pencatatan tiket, assignment, reply progres, dan perpindahan phase, walaupun endpoint operasional ticketing belum tampak pada `app/api`.

## Perubahan yang Diusulkan

### 1. Perbarui `docs/diagram-flow.md`

Tambahkan satu seksi baru setelah bagian `Flow Konseptual Ticketing` atau ubah bagian tersebut menjadi lebih aplikatif dengan dua subbagian:

- `Flow Existing Handover Manual`
- `Flow Solusi Menggunakan Aplikasi Ticketing`

Isi yang akan dituangkan:

- Kondisi existing:
  - Engineer Shift 1 mengerjakan sebagian pekerjaan
  - Handover dilakukan secara verbal
  - Engineer Shift 2 menerima informasi tidak lengkap
  - Pekerjaan berpotensi diulang
- Kondisi usulan dengan aplikasi:
  - Engineer Shift 1 mencatat progres, kendala, status, dan next action pada tiket
  - Ticket disimpan pada project dan phase yang sesuai
  - Engineer Shift 2 membaca histori tiket, reply, assignment, dan status terakhir
  - Pekerjaan dilanjutkan dari progres sebelumnya tanpa mengulang dari awal

Pendekatan visual:

- Gunakan diagram Mermaid `flowchart TD` agar konsisten dengan isi file saat ini.
- Buat perbandingan yang mudah dibaca, dengan satu diagram untuk kondisi existing dan satu diagram untuk kondisi solusi aplikasi.
- Gunakan istilah bisnis yang sederhana dan akademik agar cocok untuk laporan tugas.

### 2. Perbarui `docs/sop-bisnis.md`

Tambahkan penjelasan singkat pada bagian `SOP Bisnis Konseptual Ticketing` atau tepat setelahnya berupa subbagian:

- `Perbandingan Kondisi Existing dan Solusi Aplikasi`

Isi naratif yang akan ditambahkan:

- masalah pada handover manual,
- dampak bisnis seperti kehilangan konteks dan pengulangan pekerjaan,
- bagaimana aplikasi mengurangi risiko tersebut melalui pencatatan terstruktur,
- hasil akhir yang diharapkan berupa continuity antar shift yang lebih baik.

Tujuan perubahan ini adalah agar diagram tidak berdiri sendiri, tetapi juga didukung oleh narasi SOP yang menjelaskan manfaat bisnisnya.

## File yang Terdampak

- `d:\Perkuliahan\SMT-4\Analisa Berorientasi Objek\Tugas\ticketing-ms\docs\diagram-flow.md`
  - Menambahkan flow existing manual dan flow solusi aplikasi.
- `d:\Perkuliahan\SMT-4\Analisa Berorientasi Objek\Tugas\ticketing-ms\docs\sop-bisnis.md`
  - Menambahkan narasi perbandingan existing vs solusi.

## Asumsi dan Keputusan

- Permintaan pengguna dimaknai sebagai penambahan dokumentasi bisnis pada folder `docs`, bukan pembuatan fitur baru.
- Format diagram tetap menggunakan Mermaid karena sudah menjadi pola dokumentasi yang dipakai project.
- Solusi aplikasi dijelaskan berdasarkan domain yang sudah ada di dokumentasi dan schema, yaitu ticket, phase, assignment, dan reply, tanpa mengklaim bahwa seluruh API ticketing sudah aktif.
- Bahasa dokumentasi tetap menggunakan Bahasa Indonesia formal agar konsisten dengan dokumen saat ini dan sesuai kebutuhan akademik.

## Langkah Implementasi

1. Buka `docs/diagram-flow.md`.
2. Tambahkan seksi baru tentang handover manual existing.
3. Tambahkan seksi baru tentang handover menggunakan aplikasi ticketing.
4. Pastikan istilah pada diagram selaras dengan domain yang sudah terdokumentasi seperti ticket, phase, reply, dan assignment.
5. Buka `docs/sop-bisnis.md`.
6. Tambahkan subbagian yang menjelaskan perbedaan kondisi manual dan kondisi dengan aplikasi.
7. Pastikan gaya bahasa konsisten dengan dokumen lain di folder `docs`.
8. Periksa ulang apakah perubahan hanya menyentuh dokumentasi yang relevan.

## Verifikasi

- Pastikan `docs/diagram-flow.md` memiliki dua flow baru:
  - kondisi existing manual,
  - kondisi solusi menggunakan aplikasi.
- Pastikan diagram Mermaid menggunakan sintaks yang konsisten dengan bagian lain pada file.
- Pastikan `docs/sop-bisnis.md` memuat narasi bisnis yang menjelaskan mengapa aplikasi mengurangi pengulangan pekerjaan saat handover shift.
- Pastikan tidak ada perubahan di luar file dokumentasi yang relevan.
