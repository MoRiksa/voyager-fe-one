# Audit Screen Reader Voyager One

Dokumen ini adalah prosedur audit manual untuk NVDA di Windows dan VoiceOver di macOS. Audit ini melengkapi pemeriksaan otomatis Chrome accessibility tree dan interaction test; prosedur ini diperlukan untuk memvalidasi pengumuman audio, urutan baca, dan kenyamanan navigasi aktual.

## Status Eksekusi

| Pemeriksaan | Status | Catatan |
| --- | --- | --- |
| Chrome accessibility tree | Lulus | 10 route, seluruh kontrol bernama, satu `main` per route, tanpa duplicate ID atau broken ARIA reference |
| Keyboard interaction otomatis | Lulus | Dialog, tabs, menu mobile, cancellation, retry, clarification, dan focus return |
| NVDA 2026.x + Chrome/Firefox | Belum dijalankan | Memerlukan Windows dengan output audio |
| VoiceOver + Safari | Belum dijalankan | Memerlukan macOS dengan output audio |

Jangan mengubah status NVDA atau VoiceOver menjadi lulus tanpa menjalankan prosedur pada perangkat yang sesuai.

## Lingkungan Uji

Gunakan deployment produksi terbaru atau `npm run preview` dari build yang telah lulus `npm run build`.

Catat:

| Item | Nilai |
| --- | --- |
| Commit |  |
| URL |  |
| OS dan versi |  |
| Screen reader dan versi |  |
| Browser dan versi |  |
| Bahasa screen reader | Bahasa Indonesia / English |
| Tester |  |
| Tanggal |  |

## Konfigurasi NVDA

1. Jalankan NVDA dan browser.
2. Gunakan mode Browse untuk membaca halaman dan mode Focus untuk form.
3. Aktifkan Speech Viewer melalui `NVDA+N`, lalu pilih `Tools > Speech Viewer` agar pengumuman dapat dicatat.
4. Uji minimal dengan Chrome. Ulangi jalur kritis dengan Firefox bila browser tersebut didukung.

Perintah utama:

| Aksi | NVDA |
| --- | --- |
| Daftar heading | `NVDA+F7`, pilih Headings |
| Heading berikutnya/sebelumnya | `H` / `Shift+H` |
| Landmark berikutnya/sebelumnya | `D` / `Shift+D` |
| Form field berikutnya | `F` |
| Button berikutnya | `B` |
| Table berikutnya | `T` |
| Masuk/keluar focus mode | `NVDA+Space` |
| Baca dari posisi sekarang | `NVDA+Down Arrow` |
| Hentikan pembacaan | `Control` |

## Konfigurasi VoiceOver

1. Aktifkan VoiceOver dengan `Command+F5`.
2. Gunakan Safari.
3. Buka VoiceOver Utility dan pastikan web navigation memakai DOM order.
4. Gunakan rotor untuk memeriksa heading, landmark, form controls, links, dan tables.

Perintah utama:

| Aksi | VoiceOver |
| --- | --- |
| Rotor | `VO+U` |
| Item berikutnya/sebelumnya | `VO+Right Arrow` / `VO+Left Arrow` |
| Interaksi dengan grup | `VO+Shift+Down Arrow` |
| Berhenti berinteraksi | `VO+Shift+Up Arrow` |
| Aktifkan kontrol | `VO+Space` |
| Baca halaman | `VO+A` |

`VO` adalah `Control+Option` pada konfigurasi standar.

## Kriteria Lulus Global

Setiap route harus memenuhi semua kriteria berikut:

- Judul halaman dan heading level 1 diumumkan setelah navigasi.
- Tepat satu landmark `main` tersedia.
- Navigasi utama dan navigasi mobile memiliki nama yang dapat dibedakan.
- Semua link, button, input, select, checkbox, radio, dan tab memiliki nama yang menjelaskan tujuan.
- Focus order mengikuti urutan visual dan tidak melompat ke konten tersembunyi.
- Status dinamis diumumkan sekali, tidak berulang tanpa perubahan.
- Error form diumumkan dan terhubung ke field yang bermasalah.
- Konten demo, sumber, periode data, dan keterbatasan dapat ditemukan tanpa membuka audit teknis.
- Tidak ada pembacaan string ikon, path SVG, ID internal, atau nama komponen Vue.
- Pengguna dapat menyelesaikan alur utama tanpa pointer.

## Skenario 1: Beranda dan Onboarding

Route: `/`

1. Navigasikan ke halaman dengan screen reader aktif.
2. Buka daftar heading.
3. Pastikan heading level 1 mengumumkan tujuan halaman.
4. Navigasikan ke textarea tujuan dan button `Susun riset`.
5. Baca kartu kandidat dan provenance ringkas.

Ekspektasi:

- Nama produk tidak menggantikan heading tugas utama.
- Textarea memiliki nama `Tujuan riset` atau padanan yang jelas.
- Contoh riset dapat diaktifkan sebagai button, bukan teks biasa.
- Kartu kandidat mengumumkan ticker, nama perusahaan, skor, metrik, sumber fixture, dan periode data dalam urutan yang masuk akal.

## Skenario 2: Riset Baru dan Validasi

Route: `/research/new`

1. Kosongkan atau isi objective kurang dari 20 karakter.
2. Aktifkan `Mulai riset`.
3. Dengarkan pengumuman error.
4. Isi objective valid.
5. Ubah sektor, indeks, jumlah kandidat, kedalaman, dan dua dimensi opsional.
6. Pastikan ringkasan brief dapat ditemukan setelah kontrol.

Ekspektasi:

- Error diumumkan sebagai alert dan field disebut invalid.
- Helper text dibaca sebelum error atau tersedia melalui deskripsi field.
- Radio IDX dan SGX mengumumkan selected/disabled dengan benar.
- Checkbox mengumumkan checked state dan ketersediaan datanya.
- Copy menjelaskan bahwa preferensi brief disimpan tetapi belum mengubah aturan fixture.

## Skenario 3: Sesi, Progress, dan Recovery

Route: `/research/:id`

1. Mulai sesi baru dan dengarkan perubahan status.
2. Aktifkan `Batalkan` saat sesi berjalan.
3. Pastikan status dibatalkan diumumkan.
4. Aktifkan `Jalankan ulang`.
5. Setelah selesai, aktifkan `Minta klarifikasi`.
6. Isi dan simpan jawaban klarifikasi.
7. Refresh halaman dan pastikan brief serta status tetap dapat dibaca.

Ekspektasi:

- Progress bar mengumumkan nilai dan perubahan bermakna tanpa membanjiri output suara.
- Button yang tidak tersedia tidak masuk focus order.
- Banner `NEEDS_INPUT`, `PARTIAL`, `CANCELLED`, dan `FAILED` memiliki nama dan instruksi pemulihan.
- Form klarifikasi mengumumkan pertanyaan sebagai label input.

## Skenario 4: Screener

Route: `/research/:id/screener`

1. Navigasikan antar tahap penyaringan.
2. Beralih antara perusahaan lolos dan tidak lolos.
3. Ubah sorting.
4. Masuk ke tabel dengan table navigation.

Ekspektasi:

- Setiap tahap diumumkan sebagai button dengan pressed state.
- Dampak tahap dan alasan eksklusi terbaca sebelum tabel detail.
- Caption tabel menjelaskan tahap, mode lolos/tidak lolos, dan sorting.
- Header kolom diumumkan saat berpindah cell.
- Missing data diumumkan sebagai `Data hilang`, bukan angka kosong.

## Skenario 5: Perbandingan Kandidat

Route: `/research/:id/peers`

1. Pilih dua sampai lima kandidat.
2. Ganti kelompok metrik.
3. Ubah sorting dan mode relatif.
4. Navigasikan median serta penanda terbaik/terburuk.

Ekspektasi:

- Checkbox mengumumkan ticker dan checked state.
- Minimum dua dan maksimum lima dapat dipahami sebelum batas tercapai.
- Warning lintas sektor diumumkan sebagai informasi penting.
- Median memiliki row header yang jelas.
- `Terbaik` dan `Terburuk` dibaca setelah nilai terkait, bukan sebagai label tanpa konteks.

## Skenario 6: Dossier Perusahaan

Route: `/research/:id/company/BBCA`

1. Gunakan rotor/daftar heading untuk meninjau struktur dossier.
2. Baca provenance, metrik utama, lima faktor, DuPont, bukti, dan data opsional.
3. Periksa state data tidak tersedia pada perusahaan yang tidak memiliki kelompok opsional.

Ekspektasi:

- Ticker adalah heading level 1.
- Heading level tidak melompat secara membingungkan.
- Source, period, `as of`, dan generated time dibedakan.
- Nilai tren fixture tidak dibaca sebagai persentase bila unitnya indeks.
- Empty state menjelaskan data apa yang tidak tersedia tanpa menyiratkan error.

## Skenario 7: Laporan dan Tabs

Route: `/research/:id/report`

1. Fokus tab `Ringkasan`.
2. Gunakan panah kiri/kanan, `Home`, dan `End`.
3. Pastikan panel aktif diumumkan dan panel lain tidak dibaca.
4. Buka ranking, kandidat, bukti, dan ketidakpastian.
5. Aktifkan menu format export.

Ekspektasi:

- Tab mengumumkan selected state dan posisi dalam tablist.
- Fokus berpindah sesuai roving tabindex.
- Hanya panel aktif tersedia pada accessibility tree.
- Ranking mobile dan desktop tidak dibaca bersamaan.
- Export button memiliki nama format yang jelas dan busy/disabled state bila sedang diproses.

## Skenario 8: Dialog

Jalankan pada Candidate Detail dan Methodology.

1. Simpan posisi focus pada trigger.
2. Buka dialog.
3. Pastikan nama dialog diumumkan.
4. Navigasikan sampai akhir dan kembali ke awal.
5. Coba membaca background melalui rotor/quick navigation.
6. Tutup dengan Escape.

Ekspektasi:

- Focus masuk ke dialog.
- Background tidak tersedia selama dialog terbuka.
- Focus tidak keluar dari dialog melalui Tab atau Shift+Tab.
- Escape menutup dialog dan focus kembali ke trigger.

## Skenario 9: Menu Mobile

Viewport: `390×844` dan `740×360`.

1. Aktifkan `Lainnya`.
2. Pastikan dialog menu diumumkan.
3. Navigasikan seluruh link pada portrait dan landscape.
4. Tutup dengan Escape.

Ekspektasi:

- Background inert selama menu terbuka.
- Menu dapat discroll pada landscape.
- Focus kembali ke button `Lainnya`.
- Route aktif diumumkan melalui current state.

## Skenario 10: Methodology dan Glossary

Routes: `/methodology`, `/glossary`

1. Periksa urutan heading melalui rotor/heading list.
2. Navigasikan tabel metodologi.
3. Cari istilah pada glossary hingga ada hasil dan hingga tidak ada hasil.

Ekspektasi:

- Heading mengikuti level 1, level 2, lalu level 3.
- Caption tabel dan header baris/kolom diumumkan.
- Search field memiliki nama eksplisit.
- Jumlah hasil glossary diumumkan setelah query berubah.
- Empty result diumumkan tanpa memindahkan focus secara paksa.

## Pencatatan Defect

Gunakan format berikut untuk setiap kegagalan:

```text
ID: SR-001
Severity: Critical | High | Medium | Low
Environment: NVDA 2026.x, Chrome x, Windows x
Route: /research/:id/report
Precondition: Report completed, focus on Ringkasan tab
Steps:
1. Press Right Arrow
2. Listen to announcement
Expected: "Ruang lingkup, tab, selected, 2 of 7"
Actual: "Ruang lingkup" without selected state
Impact: User cannot determine active report section
Speech Viewer output: ...
Screenshot/recording: ...
```

Severity:

- `Critical`: alur utama tidak dapat diselesaikan dengan screen reader.
- `High`: informasi finansial, error, status, atau recovery tidak dapat dipahami.
- `Medium`: navigasi memungkinkan tetapi membingungkan atau terlalu verbose.
- `Low`: wording atau urutan pengumuman dapat dipoles tanpa menghambat tugas.

## Definition of Done

Audit native selesai bila:

- Semua skenario lulus pada NVDA + Chrome.
- Jalur kritis Beranda → Riset Baru → Sesi → Screener → Peers → Company → Report lulus pada VoiceOver + Safari.
- Tidak ada defect Critical atau High terbuka.
- Defect Medium memiliki keputusan perbaikan atau penerimaan yang terdokumentasi.
- Commit, browser, OS, screen reader, dan bukti pengumuman dicatat.
