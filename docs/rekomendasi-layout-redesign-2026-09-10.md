# Rekomendasi Layout dan Redesign Voyager One

Tanggal: 2026-09-10

Status: rekomendasi; belum merupakan implementasi atau desain final yang disetujui.

Dokumen terkait: [Audit kesesuaian produk](audit-kesesuaian-produk-2026-09-10.md).

## 1. Keputusan yang direkomendasikan

**Perlu perubahan layout dan redesign sebagian, terutama pada alur utama dan halaman hasil.** Prioritasnya mengubah struktur informasi agar membantu pengguna memahami kandidat saham, alasan pemilihan, risiko, dan batas analisis.

Desain sekarang lebih menyerupai workspace untuk memeriksa hasil sistem. Pengguna nonteknis membutuhkan panduan untuk memahami saham yang relevan dengan tujuannya dan menentukan langkah riset berikutnya.

Identitas warna serta komponen dasar masih dapat dipertahankan. Redesign visual total belum diperlukan.

## 2. Pengguna dan tujuan pengalaman

Pengguna mencakup pengamat keuangan dan pemula yang tidak berpengalaman dalam IT maupun analisis saham.

Kebutuhan utama:

> Saya ingin membeli saham, tetapi yang mana?

Voyager One membantu menjawab melalui kandidat yang layak diteliti, alasan prioritas, tradeoff, risiko, dan informasi yang perlu dikonfirmasi. Keluaran tetap berupa dukungan riset, bukan instruksi transaksi atau jaminan hasil investasi.

## 3. Perubahan per halaman

| Halaman | Arah perubahan |
| --- | --- |
| Beranda | Fokus pada kebutuhan pengguna dan satu aksi memulai riset. Kurangi pengulangan sesi, kandidat, dan laporan. |
| Form riset | Gunakan pilihan tujuan berbahasa sederhana, lalu konfirmasi apa yang dapat diperiksa. Jangan meminta pemula merakit filter finansial. |
| Proses riset | Tampilkan kemajuan bermakna: perusahaan diperiksa, alasan gugur, dan kendala data. Detail eksekusi tetap opsional. |
| Hasil/laporan | Dahulukan jawaban terhadap tujuan, kemudian kandidat, alasan, risiko, dan keterbatasan. Skor menjadi pendukung. |
| Detail perusahaan | Letakkan ringkasan bisnis dan thesis sebelum rasio serta DuPont. Gabungkan bagian data tambahan yang kosong dalam satu disclosure. |
| Perbandingan | Bandingkan kecocokan tujuan dan tradeoff, bukan sekadar angka tertinggi. Periode serta warning tetap terlihat pada mobile. |

## 4. Hierarki halaman hasil

Urutan informasi yang disarankan:

1. Tujuan yang diteliti.
2. Apakah tujuan terjawab, beserta ringkasan dan batas jawabannya.
3. Kualitas data: periode keuangan, tanggal harga, dan informasi material yang belum tersedia.
4. Kandidat yang layak diteliti dan alasan relevansinya.
5. Risiko utama serta hal yang perlu dikonfirmasi.
6. Kesimpulan perbandingan dan tradeoff.
7. Langkah riset berikutnya.
8. Bukti dan metode lanjutan.

### Wireframe konseptual

Contoh berikut menggambarkan struktur, bukan hasil riset nyata atau konten fallback.

```text
HASIL RISET
Tujuan: mencari bank dengan keuangan sehat

Apakah tujuan terjawab?
Ringkasan jawaban dan batas analisis.

KUALITAS DATA
Periode keuangan · tanggal harga · informasi yang belum tersedia

KANDIDAT UNTUK DITELITI
Nama perusahaan dan bisnisnya
• Mengapa relevan
• Alasan diprioritaskan
• Risiko utama
• Hal yang perlu dikonfirmasi
[Baca analisis]  [Bandingkan]

KESIMPULAN PERBANDINGAN
Tradeoff antarkandidat, bukan sekadar urutan skor.

LANGKAH BERIKUTNYA
Data atau asumsi yang perlu diperiksa sebelum memutuskan.

[Bukti dan metode ▾]
```

Jika tujuan belum terjawab, bagian teratas harus menyatakannya. Kandidat yang tidak memenuhi tujuan tidak boleh tetap dipresentasikan sebagai rekomendasi yang berhasil.

## 5. Bagian yang dipertahankan

- Identitas biru/slate.
- Navigasi utama yang sudah sederhana.
- Komponen tombol, input, dan kartu yang konsisten.
- Empat bagian laporan, selama Ringkasan cukup menjawab kebutuhan utama.
- Route lanjutan untuk pengguna yang ingin mendalami bukti finansial dan metode analisis, bukan log operasional.

## 6. Prinsip desain dan konten

- Skor adalah pendukung analisis, bukan jawaban tunggal.
- Alasan pemilihan harus dapat ditelusuri ke kriteria yang benar-benar diperiksa.
- Risiko dan keterbatasan material ditempatkan dekat kesimpulan yang dipengaruhinya.
- Periode keuangan, tanggal harga, dan waktu pengambilan data harus dibedakan.
- Mobile boleh menyederhanakan kontrol, tetapi tidak menghilangkan informasi yang mengubah interpretasi hasil.
- Bukti finansial dan metode analisis dibuka bertahap setelah kebutuhan utama terjawab. Log serta detail infrastruktur tidak menjadi bagian pengalaman pengguna biasa.
- Bagian kosong tidak perlu memenuhi halaman; rangkum dengan penjelasan yang jelas.
- Fallback tidak boleh menggunakan dummy, angka, confidence, atau narasi positif buatan. Gunakan status unavailable, partial, atau error yang sesuai dengan penjelasan dan langkah pemulihan.
- Cache nyata boleh ditampilkan dengan asal, waktu snapshot, dan keterbatasan yang jelas.

## 7. Penyederhanaan pengalaman pengguna nonteknis

### 7.1 Pisahkan bukti analisis dari log operasional

Pengguna perlu mengetahui hasil, alasan, keterbatasan, dan tindakan berikutnya. Mereka tidak perlu memahami cara kerja infrastruktur.

| Informasi untuk pengguna | Informasi operasional internal |
| --- | --- |
| Tujuan dan kriteria riset | Prompt internal dan respons mentah |
| Kemajuan riset dalam bahasa sederhana | Log, trace, dan event stream |
| Alasan kandidat dipilih atau gugur | Queue, worker, dan retry internal |
| Sumber, periode, dan keterbatasan data | Artifact digest, revision, dan attempt ID |
| Pesan kendala dan tindakan pemulihan | Stack trace dan HTTP error mentah |

Log tidak cukup dilipat dalam menu “Detail teknis” bagi pengguna biasa. Keluarkan aksesnya dari navigasi produk. Jika diperlukan untuk pemeliharaan, tempatkan di area operasional terpisah dengan pembatasan akses yang sesuai; menyembunyikan tautan saja bukan kontrol akses.

Pemisahan ini tidak menghilangkan transparansi analisis. Sumber, periode, metode, dan ketidakpastian hasil tetap tersedia bagi pengguna.

### 7.2 Pusatkan navigasi pada pekerjaan pengguna

Tiga pekerjaan utama:
- **Mulai riset:** menyampaikan kebutuhan dan memulai pemeriksaan.
- **Riset saya:** membuka kembali proses dan hasil yang tersimpan.
- **Bantuan:** memahami kemampuan produk, istilah, dan langkah pemulihan.

Beranda menjadi pintu masuk ketiganya. Screener, perbandingan, dan detail perusahaan dibuka dari hasil riset terkait agar pengguna tidak perlu memahami struktur sistem terlebih dahulu.

Scheduler tidak menjadi fitur utama selama belum otomatis. Untuk kemampuan menyimpan konfigurasi dan menjalankannya kembali secara manual, gunakan istilah **“Simpan tujuan riset”**. Jangan menampilkan janji eksekusi berikutnya jika belum benar-benar dijadwalkan.

### 7.3 Tampilkan hanya pilihan yang memengaruhi hasil

Preferensi yang belum berfungsi dihilangkan dari form, bukan hanya dipindahkan ke bagian lanjutan. Contohnya, pilihan kedalaman riset atau pemeriksaan sektor tidak boleh ditawarkan seolah aktif bila belum mengubah eksekusi.

Untuk pemula:
- Sediakan contoh tujuan yang benar-benar didukung.
- Gunakan default yang masuk akal dan jelaskan aturan yang akan diterapkan.
- Jelaskan istilah di tempat pengguna menemukannya.
- Minta klarifikasi hanya bila jawabannya mengubah riset.
- Konfirmasikan batas kemampuan sebelum pengguna memulai.

### 7.4 Tampilkan kemajuan yang bermakna

Gunakan nama kegiatan yang dapat dipahami, bukan event eksekusi. Contoh copy berikut hanya ilustrasi dan harus diisi dari proses aktual:

> **Memeriksa kesehatan keuangan**  
> 24 perusahaan sudah diperiksa. Sebagian belum dapat dinilai karena laporan keuangannya tidak lengkap.

Jumlah, persentase, dan estimasi waktu harus berasal dari informasi aktual. Jika tidak tersedia, tampilkan tahap yang sedang dikerjakan tanpa angka buatan.

Contoh kendala:

> **Riset belum dapat diselesaikan**  
> Layanan data belum merespons.  
> **[Coba lagi]**

Tambahkan “Hasil yang sudah diperiksa tetap tersimpan” hanya jika penyimpanan benar-benar berhasil. Pesan menjelaskan dampak dan tindakan yang dapat dilakukan, bukan error teknis mentah.

### 7.5 Bedakan proses selesai dari tujuan terjawab

Jangan menyatukan semua keadaan dalam badge hijau “Selesai”. Bedakan:

| Keadaan | Makna bagi pengguna |
| --- | --- |
| Hasil tersedia dan sesuai tujuan | Kriteria yang didukung sudah diperiksa dan kandidat relevan tersedia |
| Tidak ada kandidat memenuhi kriteria | Pemeriksaan selesai, tetapi tidak ada yang lolos; tampilkan alasan |
| Tujuan belum terjawab | Proses selesai, tetapi hasil tidak menjawab tujuan atau kriteria penting belum didukung |
| Hasil belum lengkap | Sebagian pemeriksaan tidak dapat dilakukan karena data tidak tersedia |
| Riset gagal | Proses tidak dapat diselesaikan; jelaskan pilihan pemulihan |

Status eksekusi dan pemenuhan tujuan harus didukung artefak aktual, bukan disimpulkan dari adanya laporan saja.

### 7.6 Dahulukan alasan dan risiko sebelum skor

Kartu kandidat menjawab “Mengapa kandidat ini masuk shortlist?” berdasarkan kriteria yang diperiksa. Setelah itu tampilkan risiko utama, data yang belum tersedia, periode analisis, dan perbandingan yang relevan.

Skor beserta metode menjadi informasi tambahan. Hindari label “cocok untuk Anda” jika produk belum mengetahui keadaan dan kebutuhan finansial pengguna. Skor tinggi tidak boleh menggantikan pemeriksaan kecocokan tujuan.

### 7.7 Buat pemulihan mudah dan dapat dipercaya

- Draft tujuan tidak hilang saat pengguna kembali atau koneksi terputus.
- Laporan dapat dibuka melalui bookmark dan perangkat lain sesuai model akses produk.
- Pemilihan contoh tujuan tidak mengunci tombol mulai.
- Retry tidak menciptakan riset ganda untuk tindakan yang sama.
- Loading, koneksi gagal, dan laporan yang benar-benar tidak ditemukan memiliki pesan berbeda.
- Data lama diberi label jelas, bukan terlihat sebagai data terbaru.
- Bantuan menjelaskan apa yang dapat dilakukan pengguna.
- Klaim penyimpanan atau pemulihan hanya ditampilkan setelah keberhasilannya terkonfirmasi.

**Prinsip: kompleksitas sistem ditangani produk, bukan dibebankan kepada pengguna. Menyembunyikan log tidak berarti menyembunyikan ketidakpastian hasil.**

## 8. Urutan pengerjaan

1. **Benahi kebenaran hasil dan fallback.** Layout baru tidak boleh memperkuat kesimpulan yang keliru.
2. **Pisahkan pengalaman pengguna dan operasional.** Keluarkan log serta menu infrastruktur dari alur pengguna; pertahankan bukti analisis.
3. **Perbaiki form, status, dan pemulihan.** Hilangkan pilihan yang belum berfungsi, perbaiki template lock serta deep link, dan bedakan kegagalan dari hasil kosong.
4. **Susun wireframe alur utama:** mulai riset, konfirmasi tujuan, hasil, dan detail kandidat.
5. **Redesign layout dan copy** berdasarkan informasi yang benar-benar tersedia, dengan alasan serta risiko sebelum skor.
6. **Uji dengan pengguna nonteknis**, khususnya pemahaman alasan kandidat dipilih, risiko, dan keterbatasan data.

Perubahan visual dapat dirancang bersamaan dengan perbaikan data, tetapi penerbitannya harus menggunakan kontrak hasil yang sudah benar.

## 9. Kriteria keberhasilan

Setelah membaca ringkasan, pengguna nonteknis dapat menjelaskan:

- Apakah tujuan risetnya terjawab.
- Mengapa kandidat relevan dan diprioritaskan.
- Risiko utama yang dapat menggugurkan kesimpulan.
- Seberapa mutakhir data yang digunakan.
- Informasi yang belum diketahui atau belum diperiksa.
- Langkah riset berikutnya sebelum mengambil keputusan.

### Kriteria penerimaan alur pengguna

- Pengguna dapat menyelesaikan alur utama tanpa membuka log, trace, atau memahami istilah infrastruktur.
- Setiap pilihan form yang ditawarkan memengaruhi pemeriksaan atau keluaran secara nyata.
- Memilih contoh tujuan tetap memungkinkan pengguna memulai riset.
- Laporan valid dapat dibuka melalui tautan langsung tanpa bergantung pada kunjungan sebelumnya, sesuai model akses produk.
- Gangguan layanan menghasilkan pesan dan tindakan pemulihan yang jelas tanpa dummy atau narasi pengganti.
- Hasil kosong, hasil tidak sesuai tujuan, hasil parsial, dan kegagalan tidak ditampilkan sebagai keberhasilan yang sama.
- Retry tidak menggandakan riset untuk tindakan yang sama; draft tetap tersedia ketika terjadi kendala.
- Risiko, periode, sumber, dan keterbatasan material tetap terlihat pada desktop maupun mobile.
- Klaim hasil tersimpan sesuai dengan keberhasilan penyimpanan yang terkonfirmasi.

**Ukuran sukses bukan tampilan yang lebih canggih, melainkan pemahaman yang lebih baik: mengapa saham ini layak diteliti dan apa alasan untuk tidak langsung mempercayai kesimpulannya.**
