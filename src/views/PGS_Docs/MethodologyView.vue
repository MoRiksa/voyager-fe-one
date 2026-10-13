<script setup lang="ts">
import {
  BookOpen,
  Scale,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Code2,
  FileSpreadsheet,
  Info,
  ChevronRight
} from '@lucide/vue'
</script>

<template>
  <div class="page-shell space-y-8">
    <!-- Editorial Hero Header -->
    <header class="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/70 to-blue-50/30 p-6 sm:p-8 md:p-10 shadow-xs">
      <div class="relative z-10 max-w-3xl space-y-3">
        <div class="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/70 px-3 py-1 font-mono text-xs font-bold text-[#1E4270]">
          <BookOpen class="size-3.5" />
          <span>Spesifikasi & Metodologi Riset</span>
        </div>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Cara Tinjauan Data Bekerja
        </h1>
        <p class="text-sm sm:text-base leading-relaxed text-slate-600 max-w-2xl">
          Voyager menampilkan data bank yang tersedia dalam urutan kapitalisasi pasar dari penyedia data. Metode tiga faktor hanya dijelaskan untuk memahami laporan lama.
        </p>
      </div>

      <div class="pointer-events-none absolute -right-12 -top-12 size-72 rounded-full bg-blue-100/30 blur-3xl" aria-hidden="true"></div>
    </header>

    <!-- Section 1: Tujuan Riset Baru -->
    <section class="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-4">
      <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <div class="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-[#1E4270] ring-1 ring-blue-200/70">
          <Building2 class="size-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">Tujuan yang Tersedia untuk Riset Baru</h2>
          <p class="text-xs text-slate-500">Cakupan perbankan emiten IDX berkapitalisasi pasar terbesar</p>
        </div>
      </div>

      <div class="space-y-3 text-sm leading-relaxed text-slate-700">
        <p class="font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
          Bank: Tinjau data ROE dan P/BV bank IDX berkapitalisasi pasar terbesar pada periode yang tersedia.
        </p>
        <p class="text-slate-600">
          Cakupan mengambil daftar bank dari penyedia data, mengurutkannya berdasarkan kapitalisasi pasar, lalu memeriksa delapan teratas. Metode tiga faktor tidak ditawarkan sebagai pilihan baru karena daftar perusahaannya tidak mewakili seluruh pasar.
        </p>
      </div>
    </section>

    <!-- 2-Column Bento Grid: Tiga Faktor Aktif & Tinjauan Data Bank -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <!-- Section 2: Tiga Faktor Aktif -->
      <section class="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div>
          <div class="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div class="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/70">
              <Scale class="size-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900">Tiga Faktor Aktif</h2>
              <p class="text-xs text-slate-500">Formula heuristik pemeringkatan legacy</p>
            </div>
          </div>

          <div class="mt-5 space-y-4">
            <pre class="overflow-x-auto rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs leading-relaxed shadow-inner">P = clamp(round(ROE × 4.2), 40, 100)
S = clamp(round((2.5 − min(2.5, D/E)) × 40), 30, 100)
V = clamp(round((35 − min(35, P/E)) × 3.5), 30, 100)
Q = round((0.25P + 0.20S + 0.20V) / 0.65)</pre>

            <p class="text-xs sm:text-sm leading-relaxed text-slate-700">
              Bobot efektif: profitabilitas 38,46%; solvabilitas 30,77%; valuasi 30,77%. P/BV positif merupakan syarat kelayakan, bukan komponen skor. Pertumbuhan dan konsistensi tidak memiliki skor.
            </p>
          </div>
        </div>

        <div class="mt-6 rounded-2xl bg-amber-50/90 border border-amber-200 p-4 text-xs leading-relaxed text-amber-950 flex items-start gap-2.5">
          <AlertTriangle class="size-4 shrink-0 text-amber-700 mt-0.5" />
          <span>Bobot belum dikalibrasi empiris dan tidak relatif sektor. FCF bukan faktor skor atau syarat positif: FCF negatif dapat menghasilkan Q=100. Skor ≥80 hanya memenuhi salah satu aturan shortlist.</span>
        </div>
      </section>

      <!-- Section 3: Tinjauan Data Bank (data-testid preserved for contract tests) -->
      <section data-testid="bank-methodology" class="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div>
          <div class="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div class="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-[#1E4270] ring-1 ring-blue-200/70">
              <CheckCircle2 class="size-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900">Tinjauan Data Bank</h2>
              <p class="text-xs text-slate-500">Spesifikasi kontrak pembuktian sektor perbankan</p>
            </div>
          </div>

          <div class="mt-5 space-y-4">
            <p class="text-xs sm:text-sm leading-relaxed text-slate-700">
              Tinjauan memeriksa subsektor bank, kapitalisasi pasar dan harga positif, serta ketersediaan laba, ekuitas yang tidak nol, dan P/BV pada periode tahunan yang sama. Nilai ROE dan P/BV, termasuk nilai rendah atau negatif, tidak menentukan apakah bank ditampilkan.
            </p>

            <div class="rounded-2xl bg-amber-50/90 border border-amber-200 p-4 text-xs leading-relaxed text-amber-950 flex items-start gap-2.5">
              <AlertTriangle class="size-4 shrink-0 text-amber-700 mt-0.5" />
              <span>ROE dihitung dari data penyedia, tetapi basis laba dan ekuitas dapat tidak cocok. P/BV historis belum diverifikasi terhadap tanggal harga dan jumlah saham.</span>
            </div>
          </div>
        </div>

        <details class="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
          <summary class="min-h-8 cursor-pointer text-xs font-bold text-[#1E4270] flex items-center justify-between select-none">
            <span>Detail teknis integritas kontrak</span>
            <Code2 class="size-4 text-slate-400" />
          </summary>
          <div class="mt-2 pt-2 border-t border-slate-200/80 font-mono text-[11px] text-slate-600 space-y-1">
            <p>Kontrak: bank-evidence-contract-v1 · Formula: bank-evidence-v1</p>
            <p class="text-[10px] text-slate-400">Strict immutability verified across revision traces.</p>
          </div>
        </details>
      </section>
    </div>

    <!-- Section 4: Validitas Input dan Periode -->
    <section class="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
      <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <div class="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
          <FileSpreadsheet class="size-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">Validitas Input dan Periode</h2>
          <p class="text-xs text-slate-500">Aturan ketat integritas data dan perbandingan tahun fiskal</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm leading-relaxed text-slate-700">
        <div class="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2">
          <h3 class="font-bold text-slate-900">Generic Kompatibilitas</h3>
          <p>
            Pendapatan, aset, ekuitas, kapitalisasi, harga, laba, P/E dan P/BV harus positif; debt ≥0; FCF serta provenance tersedia.
          </p>
          <div class="font-mono text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/60 mt-2">
            ROE = laba / ekuitas × 100<br>
            ROA = laba / aset × 100<br>
            D/E = debt / ekuitas
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2">
          <h3 class="font-bold text-slate-900">Bank Spesifik</h3>
          <p>
            Subsektor harus Banks; market cap dan harga positif; earnings dan P/BV harus berupa angka finite; total equity harus finite dan tidak nol. Angka tidak wajib positif.
          </p>
          <p class="text-xs text-slate-500 mt-2">
            FY finansial dan valuasi harus sama. Jika salah satu bank dalam top-eight kehilangan data wajib, laporan berstatus cannot_assess. Denominator memakai saldo akhir, bukan rata-rata. Pembulatan hanya pada tampilan.
          </p>
        </div>
      </div>

      <div class="rounded-2xl bg-slate-100/70 p-4 text-xs text-slate-600">
        Pengambilan baru tidak berarti laporan keuangan atau harga baru. Benchmark P/BV peer tidak digunakan.
      </div>
    </section>

    <!-- Section 5: Cara Membaca Hasil -->
    <section class="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-4">
      <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <div class="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70">
          <Info class="size-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">Cara Membaca Hasil</h2>
          <p class="text-xs text-slate-500">Pedoman objektif interpretasi luaran riset</p>
        </div>
      </div>

      <div class="space-y-3 text-xs sm:text-sm leading-relaxed text-slate-700">
        <p>
          Proses yang selesai tidak selalu berarti pertanyaan berhasil dijawab. Laporan membedakan data tersedia, tidak ada data kandidat, dan data wajib tidak lengkap.
        </p>
        <p>
          Bukti satu sumber belum diverifikasi independen. Ringkasan otomatis tidak tersedia. Periksa sumber asli, unit, perubahan laporan, periode keuangan, tanggal harga, dan waktu pengambilan. Laporan lama tidak otomatis menjadi benar karena metode sudah diperbarui.
        </p>
      </div>
    </section>
  </div>
</template>
