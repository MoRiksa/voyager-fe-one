<script setup lang="ts">
import { ref, computed } from 'vue'
import { BookOpen, Search, TrendingUp, PieChart, Shield, DollarSign, BarChart3, Calculator } from '@lucide/vue'

const searchQuery = ref('')

const glossaryTerms = [
  // Profitabilitas
  {
    term: 'ROE',
    fullName: 'Return on Equity',
    category: 'Profitabilitas',
    icon: TrendingUp,
    definition: 'Seberapa efisien perusahaan menghasilkan laba dari modal yang ditanamkan pemilik.',
    formula: 'Laba Bersih ÷ Ekuitas Pemegang Saham × 100%',
    interpretation: 'ROE 15% berarti setiap Rp100 modal menghasilkan Rp15 laba. Semakin tinggi umumnya semakin baik, tapi perlu dilihat apakah berasal dari efisiensi atau utang.',
    example: 'BBCA dengan ROE 21% berarti dari setiap Rp100 modal pemegang saham, bank menghasilkan Rp21 laba bersih per tahun.',
    caution: 'ROE tinggi bisa berasal dari leverage (utang) yang tinggi. Selalu periksa Debt/Equity bersamaan.'
  },
  {
    term: 'ROA',
    fullName: 'Return on Assets',
    category: 'Profitabilitas',
    icon: TrendingUp,
    definition: 'Seberapa efisien perusahaan menggunakan seluruh asetnya untuk menghasilkan laba.',
    formula: 'Laba Bersih ÷ Total Aset × 100%',
    interpretation: 'ROA 5% berarti setiap Rp100 aset menghasilkan Rp5 laba. Cocok untuk membandingkan efisiensi antar perusahaan.',
    example: 'Perusahaan dengan aset Rp10 triliun dan laba Rp500 miliar memiliki ROA 5%.',
    caution: 'ROA sektor perbankan biasanya lebih rendah (1-2%) karena asetnya besar. Bandingkan dalam sektor yang sama.'
  },
  {
    term: 'Net Profit Margin',
    fullName: 'Margin Laba Bersih',
    category: 'Profitabilitas',
    icon: TrendingUp,
    definition: 'Persentase pendapatan yang menjadi laba bersih setelah semua biaya.',
    formula: 'Laba Bersih ÷ Pendapatan × 100%',
    interpretation: 'Margin 10% berarti dari setiap Rp100 penjualan, Rp10 menjadi laba bersih.',
    example: 'Toko dengan penjualan Rp1 miliar dan laba Rp100 juta memiliki margin 10%.',
    caution: 'Margin bervariasi antar industri. Retail biasanya 2-5%, software bisa 20-30%.'
  },
  // Valuasi
  {
    term: 'P/E Ratio',
    fullName: 'Price to Earnings Ratio',
    category: 'Valuasi',
    icon: DollarSign,
    definition: 'Berapa rupiah yang investor bayar untuk setiap Rp1 laba tahunan perusahaan.',
    formula: 'Harga Saham ÷ Laba per Saham',
    interpretation: 'P/E 15x berarti investor membayar Rp15 untuk setiap Rp1 laba. P/E lebih rendah bisa berarti lebih murah, tapi juga bisa mencerminkan prospek yang kurang baik.',
    example: 'Saham Rp10.000 dengan laba per saham Rp500 memiliki P/E 20x.',
    caution: 'P/E negatif atau sangat tinggi (>50x) perlu investigasi lebih lanjut. Bandingkan dengan rata-rata sektor.'
  },
  {
    term: 'P/BV Ratio',
    fullName: 'Price to Book Value',
    category: 'Valuasi',
    icon: DollarSign,
    definition: 'Perbandingan harga saham terhadap nilai buku (aset dikurangi utang) per saham.',
    formula: 'Harga Saham ÷ Nilai Buku per Saham',
    interpretation: 'P/BV 2x berarti pasar menghargai perusahaan 2 kali lipat dari nilai bukunya. P/BV < 1 bisa berarti undervalued atau ada masalah.',
    example: 'Saham Rp5.000 dengan nilai buku Rp2.500 memiliki P/BV 2x.',
    caution: 'P/BV sangat bervariasi. Bank biasanya 1-3x, teknologi bisa 5-10x karena aset intangible.'
  },
  {
    term: 'EV/EBITDA',
    fullName: 'Enterprise Value to EBITDA',
    category: 'Valuasi',
    icon: DollarSign,
    definition: 'Nilai total perusahaan (termasuk utang) dibanding laba operasional sebelum depresiasi.',
    formula: '(Kapitalisasi Pasar + Utang - Kas) ÷ EBITDA',
    interpretation: 'EV/EBITDA 8x berarti butuh 8 tahun laba operasional untuk "membeli" seluruh perusahaan. Lebih rendah umumnya lebih murah.',
    example: 'Perusahaan dengan EV Rp80 triliun dan EBITDA Rp10 triliun memiliki EV/EBITDA 8x.',
    caution: 'Lebih cocok untuk membandingkan perusahaan dengan struktur modal berbeda karena memperhitungkan utang.'
  },
  // Solvabilitas
  {
    term: 'Debt/Equity',
    fullName: 'Debt to Equity Ratio',
    category: 'Solvabilitas',
    icon: Shield,
    definition: 'Perbandingan total utang terhadap modal sendiri. Mengukur seberapa besar perusahaan bergantung pada utang.',
    formula: 'Total Utang ÷ Total Ekuitas',
    interpretation: 'D/E 0.5x berarti utang setengah dari modal. Semakin rendah umumnya semakin aman, tapi terlalu rendah bisa berarti kurang memanfaatkan leverage.',
    example: 'Perusahaan dengan utang Rp500 miliar dan ekuitas Rp1 triliun memiliki D/E 0.5x.',
    caution: 'Sektor perbankan dan properti biasanya memiliki D/E tinggi (>1x) sebagai bagian dari model bisnis.'
  },
  {
    term: 'Current Ratio',
    fullName: 'Rasio Lancar',
    category: 'Solvabilitas',
    icon: Shield,
    definition: 'Kemampuan perusahaan membayar utang jangka pendek dengan aset lancar.',
    formula: 'Aset Lancar ÷ Utang Lancar',
    interpretation: 'Current ratio 2x berarti aset lancar 2 kali lipat utang jangka pendek. Idealnya > 1x untuk kesehatan keuangan.',
    example: 'Perusahaan dengan aset lancar Rp200 miliar dan utang lancar Rp100 miliar memiliki current ratio 2x.',
    caution: 'Terlalu tinggi (>3x) bisa berarti kas tidak digunakan secara efisien.'
  },
  // Arus Kas
  {
    term: 'FCF Yield',
    fullName: 'Free Cash Flow Yield',
    category: 'Arus Kas',
    icon: PieChart,
    definition: 'Kas bebas yang dihasilkan perusahaan relatif terhadap nilai perusahaan. Menunjukkan "imbal hasil kas" bagi investor.',
    formula: 'Free Cash Flow ÷ Enterprise Value × 100%',
    interpretation: 'FCF yield 5% berarti perusahaan menghasilkan kas bebas 5% dari nilai totalnya per tahun. Semakin tinggi semakin menarik.',
    example: 'Perusahaan dengan FCF Rp5 triliun dan EV Rp100 triliun memiliki FCF yield 5%.',
    caution: 'FCF bisa fluktuatif karena belanja modal. Lihat tren beberapa tahun.'
  },
  {
    term: 'Dividend Yield',
    fullName: 'Imbal Hasil Dividen',
    category: 'Arus Kas',
    icon: PieChart,
    definition: 'Dividen tahunan yang dibagikan relatif terhadap harga saham.',
    formula: 'Dividen per Saham ÷ Harga Saham × 100%',
    interpretation: 'Dividend yield 3% berarti investor menerima 3% dari nilai investasinya sebagai dividen per tahun.',
    example: 'Saham Rp10.000 dengan dividen Rp300 per tahun memiliki yield 3%.',
    caution: 'Yield tinggi bisa karena harga turun drastis, bukan karena dividen naik. Periksa konsistensi pembayaran.'
  },
  // Pertumbuhan
  {
    term: 'CAGR',
    fullName: 'Compound Annual Growth Rate',
    category: 'Pertumbuhan',
    icon: BarChart3,
    definition: 'Rata-rata pertumbuhan per tahun selama periode tertentu, memperhitungkan efek compounding.',
    formula: '((Nilai Akhir ÷ Nilai Awal)^(1/n) - 1) × 100%',
    interpretation: 'CAGR pendapatan 15% berarti rata-rata pendapatan tumbuh 15% per tahun. Bukan berarti setiap tahun tumbuh persis 15%.',
    example: 'Pendapatan naik dari Rp100 miliar ke Rp200 miliar dalam 5 tahun = CAGR sekitar 15%.',
    caution: 'CAGR menyembunyikan volatilitas. Perusahaan bisa tumbuh 50% lalu turun 20% tapi tetap punya CAGR positif.'
  },
  // Analisis
  {
    term: 'DuPont Analysis',
    fullName: 'Analisis DuPont',
    category: 'Analisis',
    icon: Calculator,
    definition: 'Metode memecah ROE menjadi tiga komponen untuk memahami sumber keuntungan perusahaan.',
    formula: 'ROE = Margin Laba × Perputaran Aset × Leverage',
    interpretation: 'Membantu melihat apakah ROE tinggi berasal dari: (1) margin laba yang baik, (2) efisiensi penggunaan aset, atau (3) penggunaan utang.',
    example: 'Dua perusahaan dengan ROE 20% bisa sangat berbeda: satu dari margin tinggi, satu dari leverage tinggi.',
    caution: 'ROE dari leverage tinggi lebih berisiko karena bergantung pada kemampuan membayar utang.'
  },
  {
    term: 'Quality Score',
    fullName: 'Skor Kualitas',
    category: 'Analisis',
    icon: Calculator,
    definition: 'Skor heuristik quality-3f-v2 dari profitabilitas (ROE), solvabilitas (D/E), dan valuasi (P/E). Pertumbuhan dan konsistensi belum dinilai.',
    formula: 'round((0.25 × P + 0.20 × S + 0.20 × V) / 0.65)',
    interpretation: 'Skor ≥80 memenuhi ambang skor shortlist; aturan finansial dan validitas data tetap harus dipenuhi.',
    example: 'FCF negatif tetap dapat menghasilkan skor 100 karena FCF bukan faktor skor.',
    caution: 'Bukan peluang untung atau confidence. Bobot belum dikalibrasi empiris, belum relatif sektor; bukti satu sumber belum diverifikasi independen.'
  },
  {
    term: 'Capital-to-RWA proxy',
    fullName: 'Rasio modal terhadap aset tertimbang menurut risiko dari field provider',
    category: 'Analisis',
    icon: Shield,
    definition: 'Perhitungan aritmetis total capital dibagi total risk-weighted assets pada FY yang sama.',
    formula: 'Total Capital ÷ Total Risk-Weighted Assets × 100%',
    interpretation: 'Dalam objective bank kanonik, nilai minimal 12% menjadi salah satu syarat screening.',
    example: 'Total capital 160 dan risk-weighted assets 1.000 menghasilkan proxy 16%.',
    caution: 'Bukan CAR regulator resmi dan bukan validasi independen kecukupan modal bank.'
  },
  {
    term: 'Bank Health Score',
    fullName: 'Skor heuristik bank-health-3f-v1',
    category: 'Analisis',
    icon: Calculator,
    definition: 'Heuristik ranking dari faktor ROE, capital-to-RWA proxy, dan P/BV untuk bank yang lolos kriteria.',
    formula: 'round(0,40 × skor ROE + 0,40 × skor proxy modal + 0,20 × skor P/BV)',
    interpretation: 'Skor mengurutkan kandidat dalam hasil screening dan tidak memiliki ambang kelulusan tambahan.',
    example: 'Nilai lebih tinggi berarti kombinasi tiga faktor mendapat skor formula lebih tinggi, bukan bank lebih aman.',
    caution: 'Bukan peluang untung, confidence, kalibrasi risiko, penilaian NPL/NIM, moat, atau kualitas kredit.'
  },
  // Ukuran
  {
    term: 'Market Cap',
    fullName: 'Kapitalisasi Pasar',
    category: 'Ukuran',
    icon: BarChart3,
    definition: 'Total nilai pasar seluruh saham beredar. Menunjukkan ukuran perusahaan di mata pasar.',
    formula: 'Harga Saham × Jumlah Saham Beredar',
    interpretation: 'Market cap Rp500 triliun berarti pasar menilai seluruh perusahaan senilai Rp500 triliun.',
    example: 'Saham Rp10.000 dengan 50 miliar lembar beredar = market cap Rp500 triliun.',
    caution: 'Market cap besar tidak selalu berarti lebih baik. Perusahaan kecil bisa tumbuh lebih cepat.'
  }
]

const categories = [...new Set(glossaryTerms.map(t => t.category))]

const filteredTerms = computed(() => {
  if (!searchQuery.value.trim()) return glossaryTerms
  const query = searchQuery.value.toLowerCase()
  return glossaryTerms.filter(term => 
    term.term.toLowerCase().includes(query) ||
    term.fullName.toLowerCase().includes(query) ||
    term.definition.toLowerCase().includes(query) ||
    term.category.toLowerCase().includes(query)
  )
})

const groupedTerms = computed(() => {
  const groups: Record<string, typeof glossaryTerms> = {}
  for (const category of categories) {
    const terms = filteredTerms.value.filter(t => t.category === category)
    if (terms.length > 0) groups[category] = terms
  }
  return groups
})
</script>

<template>
  <div class="page-shell space-y-7">
    <!-- Header -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
        <span class="section-kicker">Referensi</span>
        <span class="badge bg-slate-100 text-slate-700">{{ glossaryTerms.length }} istilah</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
        Kamus Istilah Finansial
      </h1>
      <p class="text-sm text-slate-600 mt-1 max-w-3xl">
        Pahami istilah-istilah keuangan yang digunakan dalam Voyager One dengan penjelasan sederhana, rumus, dan contoh praktis.
      </p>

      <!-- Search -->
      <div class="mt-6 relative">
        <label for="glossary-search" class="sr-only">Cari istilah finansial</label>
        <Search class="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          id="glossary-search"
          v-model="searchQuery"
          type="text"
          placeholder="Cari istilah, misalnya: ROE, P/E, CAGR..."
          class="w-full min-h-11 rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm focus:border-[#2F64A8]"
        />
      </div>
      <p class="mt-2 text-xs text-slate-500" role="status" aria-live="polite">{{ filteredTerms.length }} istilah ditemukan.</p>
    </div>

    <!-- Quick Navigation -->
    <div class="flex flex-wrap gap-2">
      <a
        v-for="category in categories"
        :key="category"
        :href="`#${category.toLowerCase().replace(/\s+/g, '-')}`"
        class="badge bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
      >
        {{ category }}
      </a>
    </div>

    <!-- No Results -->
    <div v-if="filteredTerms.length === 0" class="bg-white rounded-2xl border border-slate-200 p-8 text-center">
      <BookOpen class="mx-auto h-8 w-8 text-slate-400" />
      <h2 class="mt-3 font-bold text-slate-900">Tidak ditemukan</h2>
      <p class="mt-2 text-sm text-slate-600">Tidak ada istilah yang cocok dengan "{{ searchQuery }}".</p>
    </div>

    <!-- Terms by Category -->
    <div v-for="(terms, category) in groupedTerms" :key="category" class="space-y-4">
      <h2 :id="category.toLowerCase().replace(/\s+/g, '-')" class="text-lg font-bold text-slate-900 scroll-mt-20">
        {{ category }}
      </h2>
      
      <div class="grid gap-4 md:grid-cols-2">
        <article
          v-for="item in terms"
          :key="item.term"
          class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
        >
          <!-- Header -->
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#407EC9]/10 text-[#2F64A8]">
              <component :is="item.icon" class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <h3 class="font-mono text-lg font-bold text-[#2F64A8]">{{ item.term }}</h3>
              <p class="text-xs text-slate-500">{{ item.fullName }}</p>
            </div>
          </div>

          <!-- Definition -->
          <p class="mt-4 text-sm leading-6 text-slate-700">
            {{ item.definition }}
          </p>

          <!-- Formula -->
          <div class="mt-4 rounded-lg bg-slate-50 p-3">
            <p class="text-xs font-semibold text-slate-500 mb-1">Rumus</p>
            <p class="font-mono text-xs text-slate-800">{{ item.formula }}</p>
          </div>

          <!-- Interpretation -->
          <div class="mt-3">
            <p class="text-xs font-semibold text-slate-500 mb-1">Cara membaca</p>
            <p class="text-xs leading-5 text-slate-600">{{ item.interpretation }}</p>
          </div>

          <!-- Example -->
          <div class="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-3">
            <p class="text-xs font-semibold text-blue-800 mb-1">Contoh</p>
            <p class="text-xs leading-5 text-blue-700">{{ item.example }}</p>
          </div>

          <!-- Caution -->
          <div class="mt-3 rounded-lg bg-amber-50 border border-amber-100 p-3">
            <p class="text-xs font-semibold text-amber-800 mb-1">Perhatian</p>
            <p class="text-xs leading-5 text-amber-700">{{ item.caution }}</p>
          </div>
        </article>
      </div>
    </div>

    <!-- Footer Note -->
    <div class="rounded-2xl bg-slate-100 p-6 text-center">
      <p class="text-xs leading-5 text-slate-600">
        <strong class="text-slate-800">Catatan:</strong> Penjelasan di atas disederhanakan untuk memudahkan pemahaman. 
        Untuk analisis investasi yang serius, konsultasikan dengan profesional keuangan berlisensi.
      </p>
    </div>
  </div>
</template>
