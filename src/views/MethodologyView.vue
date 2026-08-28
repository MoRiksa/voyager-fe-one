<script setup lang="ts">
import { useResearchStore } from '../stores/researchStore'
import { 
  Calculator, 
  ShieldCheck, 
  Award, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  FileText,
  HelpCircle,
  Database,
  SlidersHorizontal,
  BarChart3
} from '@lucide/vue'

const store = useResearchStore()
</script>

<template>
  <div class="page-shell space-y-7">
    <!-- View Header -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
         <span class="section-kicker">Metodologi</span>
        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
           Transparansi skor
        </span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
         Cara skor dihitung
      </h1>
      <p class="text-sm text-slate-600 mt-1 max-w-3xl">
         Pahami lima faktor penilaian, cara membaca hasil, dan batas penggunaan skor dalam proses riset.
      </p>
    </div>

    <!-- The 5 Pillars Diagram & Architecture Card -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
       <h2 class="text-lg font-bold text-slate-900">1. Cara riset disusun</h2>
      <p class="text-xs text-slate-600 leading-relaxed max-w-3xl">
         Setiap tujuan melewati lima tahap agar proses penyaringan dan hasil akhirnya dapat ditinjau kembali.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-xs">
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-[#2F64A8] font-bold mb-1">PILAR 1</div>
          <div class="font-bold text-slate-900 font-sans">Menyusun rencana</div>
          <div class="text-xs text-slate-500 font-sans mt-1">Mengubah tujuan menjadi ruang lingkup dan langkah riset</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-[#2F64A8] font-bold mb-1">PILAR 2</div>
          <div class="font-bold text-slate-900 font-sans">Menyaring perusahaan</div>
          <div class="text-xs text-slate-500 font-sans mt-1">Ilustrasi skala produksi: mempersempit daftar secara bertahap (914 -> 284 -> 68 -> 18 -> 5)</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-[#2F64A8] font-bold mb-1">PILAR 3</div>
          <div class="font-bold text-slate-900 font-sans">Menganalisis kandidat</div>
          <div class="text-xs text-slate-500 font-sans mt-1">Analisis DuPont, neraca, dan perbandingan perusahaan sejenis</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-[#2F64A8] font-bold mb-1">PILAR 4</div>
          <div class="font-bold text-slate-900 font-sans">Mencatat aktivitas</div>
          <div class="text-xs text-slate-500 font-sans mt-1">Menyimpan status dan riwayat operasi pada sesi</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-[#2F64A8] font-bold mb-1">PILAR 5</div>
          <div class="font-bold text-slate-900 font-sans">Menyusun laporan</div>
          <div class="text-xs text-slate-500 font-sans mt-1">Merangkum skor, bukti, risiko, dan keterbatasan</div>
        </div>
      </div>
    </div>

    <!-- Scoring Formula Details -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
       <h2 class="text-lg font-bold text-slate-900">2. Lima faktor penilaian</h2>
      <p class="text-xs text-slate-600 leading-relaxed">
         Skor kualitas merangkum profitabilitas, pertumbuhan, solvabilitas, valuasi, dan konsistensi pada skala 0 sampai 100.
      </p>

      <div class="p-4 rounded-xl bg-[#407EC9]/5 border border-[#407EC9]/20 font-mono text-xs text-slate-800 space-y-2">
        <div class="font-bold text-[#2F64A8] text-sm">
          Skor Kualitas = (0.25 × P) + (0.25 × G) + (0.20 × S) + (0.20 × V) + (0.10 × C)
        </div>
        <div class="text-[11px] text-slate-600 pt-2 border-t border-[#407EC9]/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-sans">
          <div>
            <strong class="text-slate-900 block">Profitabilitas (25%)</strong>
            ROE, ROA, dan margin dari nilai fixture; belum dinormalisasi terhadap sektor.
          </div>
          <div>
            <strong class="text-slate-900 block">Pertumbuhan (25%)</strong>
            CAGR pendapatan dan laba bersih tiga tahun.
          </div>
          <div>
            <strong class="text-slate-900 block">Solvabilitas (20%)</strong>
            Debt/Equity, current ratio, dan posisi kas.
          </div>
          <div>
            <strong class="text-slate-900 block">Valuasi (20%)</strong>
            P/E, P/BV, dan EV/EBITDA berdasarkan nilai fixture dan ambang absolut.
          </div>
          <div>
            <strong class="text-slate-900 block">Konsistensi (10%)</strong>
            Stabilitas laba dan dividen dalam beberapa periode.
          </div>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-4" aria-label="Interpretasi skor">
        <div v-for="band in [{ range: '90-100', label: 'Sangat kuat', text: 'Profil menonjol dalam ruang lingkup yang dievaluasi.' }, { range: '80-89', label: 'Kuat', text: 'Fundamental baik dengan tradeoff yang perlu diperiksa.' }, { range: '70-79', label: 'Campuran', text: 'Memerlukan analisis tambahan sebelum diprioritaskan.' }, { range: '<70', label: 'Tidak diprioritaskan', text: 'Tidak memenuhi kombinasi kriteria sesi saat ini.' }]" :key="band.range" class="rounded-xl border border-slate-200 p-4"><span class="font-mono text-sm font-bold text-[#2F64A8]">{{ band.range }}</span><h3 class="mt-2 text-sm font-bold text-slate-900">{{ band.label }}</h3><p class="mt-1 text-xs leading-5 text-slate-500">{{ band.text }}</p></div>
      </div>
      <p class="rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-950">Skor digunakan untuk memprioritaskan riset, bukan untuk memprediksi return. Bank dan perusahaan non-finansial juga memerlukan metrik sektoral yang berbeda.</p>
      <p class="rounded-xl bg-blue-50 p-4 text-xs leading-5 text-blue-950">Formula di atas adalah formula target metodologi. Pada mode demonstrasi, komponen dan skor akhir merupakan nilai fixture model yang ditampilkan apa adanya, bukan hasil perhitungan ulang atau skor pasar terstandarisasi.</p>
    </div>

    <!-- Scoring Limitations -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
      <h2 class="text-lg font-bold text-slate-900">3. Keterbatasan sistem scoring saat ini</h2>
      <p class="text-xs text-slate-600 leading-relaxed max-w-3xl">
        Sistem scoring demonstrasi memiliki beberapa keterbatasan yang perlu dipahami sebelum menggunakan hasil untuk keputusan riset.
      </p>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 class="text-xs font-bold text-amber-900">Tanpa normalisasi sektor</h3>
          <p class="mt-1 text-xs leading-5 text-amber-800">ROE 20% di sektor perbankan dan retail diperlakukan sama, padahal benchmark sektor berbeda. Skor seharusnya relatif terhadap median sektor.</p>
        </div>
        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 class="text-xs font-bold text-amber-900">Tanpa momentum harga</h3>
          <p class="mt-1 text-xs leading-5 text-amber-800">Skor hanya berdasarkan fundamental historis. Pergerakan harga 30, 90, dan 365 hari belum diperhitungkan.</p>
        </div>
        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 class="text-xs font-bold text-amber-900">Tanpa data forward-looking</h3>
          <p class="mt-1 text-xs leading-5 text-amber-800">Estimasi analis dan forward P/E belum tersedia. Skor hanya mencerminkan kinerja masa lalu.</p>
        </div>
        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 class="text-xs font-bold text-amber-900">Konsistensi tanpa validasi</h3>
          <p class="mt-1 text-xs leading-5 text-amber-800">Skor konsistensi 80-99 belum divalidasi dari data kuartalan historis yang sebenarnya.</p>
        </div>
        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 class="text-xs font-bold text-amber-900">Tanpa filter likuiditas</h3>
          <p class="mt-1 text-xs leading-5 text-amber-800">Belum ada filter berdasarkan keanggotaan indeks atau volume perdagangan rata-rata.</p>
        </div>
        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 class="text-xs font-bold text-amber-900">Valuasi absolut</h3>
          <p class="mt-1 text-xs leading-5 text-amber-800">P/E dibandingkan dengan threshold tetap, bukan median sektor yang lebih relevan.</p>
        </div>
      </div>

      <div class="rounded-xl bg-blue-50 border border-blue-200 p-4">
        <h3 class="text-xs font-bold text-blue-900">Rencana peningkatan</h3>
        <p class="mt-1 text-xs leading-5 text-blue-800">Data yang lebih lengkap dapat menambahkan perbandingan sektor, momentum harga, histori kuartalan, keanggotaan indeks, dan estimasi ke depan. Kualitas model harus diukur melalui metode validasi yang terdokumentasi, bukan skor akurasi subjektif.</p>
      </div>
    </div>

    <!-- DuPont Model Deconstruction -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
      <h2 class="text-lg font-bold text-slate-900">4. Dekomposisi ROE DuPont tiga tahap</h2>
      <p class="text-xs text-slate-600 leading-relaxed">
        Analisis ini membantu melihat apakah ROE tinggi terutama berasal dari margin, perputaran aset, atau leverage finansial.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h3 class="text-xs font-bold text-slate-900 uppercase font-mono">1. Net profit margin</h3>
          <p class="text-xs text-slate-500 mt-1">Laba bersih ÷ pendapatan. Menggambarkan profitabilitas dan efisiensi biaya.</p>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h3 class="text-xs font-bold text-slate-900 uppercase font-mono">2. Asset turnover</h3>
          <p class="text-xs text-slate-500 mt-1">Pendapatan ÷ total aset. Menggambarkan efisiensi penggunaan aset.</p>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h3 class="text-xs font-bold text-slate-900 uppercase font-mono">3. Leverage finansial</h3>
          <p class="text-xs text-slate-500 mt-1">Total aset ÷ ekuitas. Menggambarkan seberapa besar aset didukung oleh modal sendiri.</p>
        </div>
      </div>
    </div>

    <!-- Data Source Transparency -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
      <h2 class="text-lg font-bold text-slate-900">5. Sumber dan cakupan data</h2>
      <p class="text-xs text-slate-600 leading-relaxed max-w-3xl">
        Transparansi sumber data penting untuk memahami batasan dan keandalan hasil riset.
      </p>

      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <caption class="sr-only">Perbandingan sumber dan cakupan data mode demonstrasi dengan target produksi</caption>
          <thead>
            <tr class="border-b border-slate-200 text-left">
              <th scope="col" class="pb-3 pr-4 font-bold text-slate-700">Aspek</th>
              <th scope="col" class="pb-3 pr-4 font-bold text-slate-700">Mode Demonstrasi</th>
              <th scope="col" class="pb-3 font-bold text-slate-700">Target Produksi</th>
            </tr>
          </thead>
          <tbody class="text-slate-600">
            <tr class="border-b border-slate-100">
              <th scope="row" class="py-3 pr-4 text-left font-medium text-slate-900">Universe</th>
              <td class="py-3 pr-4">8 perusahaan (fixture)</td>
              <td class="py-3">900+ perusahaan IDX</td>
            </tr>
            <tr class="border-b border-slate-100">
              <th scope="row" class="py-3 pr-4 text-left font-medium text-slate-900">Kesegaran data</th>
              <td class="py-3 pr-4">Statis</td>
              <td class="py-3">Update harian/kuartalan</td>
            </tr>
            <tr class="border-b border-slate-100">
              <th scope="row" class="py-3 pr-4 text-left font-medium text-slate-900">Sumber</th>
              <td class="py-3 pr-4 font-mono text-[11px]">sectorsUniverse.ts</td>
              <td class="py-3">Sectors API v1</td>
            </tr>
            <tr>
              <th scope="row" class="py-3 pr-4 text-left font-medium text-slate-900">Validasi</th>
              <td class="py-3 pr-4">Manual</td>
              <td class="py-3">API-verified</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 class="text-xs font-bold text-slate-900">Perusahaan dalam fixture</h3>
          <p class="mt-2 font-mono text-xs text-slate-600">BBCA, BMRI, BBRI, ICBP, UNTR, AMRT, ASII, TLKM</p>
          <p class="mt-2 text-xs text-slate-500">Tiga sektor: Commercial Banks, Consumer Goods, dan Diversified.</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 class="text-xs font-bold text-slate-900">Format sitasi bukti</h3>
          <p class="mt-2 text-xs text-slate-600">Setiap metrik menyertakan sumber dan konteks. Mode demonstrasi menggunakan format:</p>
          <p class="mt-2 font-mono text-[11px] text-slate-500 bg-white rounded px-2 py-1 border border-slate-200">source: 'Prototype fixture: /companies/[TICKER]/financials'</p>
        </div>
      </div>

      <p class="rounded-xl bg-slate-100 p-4 text-xs leading-5 text-slate-700">
        <strong>Catatan:</strong> Semua hasil riset pada mode demonstrasi menggunakan data fixture untuk delapan perusahaan. Implementasi produksi akan menggunakan data real-time dari seluruh perusahaan tercatat di IDX melalui integrasi API.
      </p>
    </div>
  </div>
</template>
