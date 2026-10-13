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
    term: 'Bank Evidence',
    fullName: 'Tinjauan bank-evidence-v1',
    category: 'Analisis',
    icon: Calculator,
    definition: 'Tinjauan ketersediaan data ROE dan P/BV untuk bank top market cap provider pada latest common FY.',
    formula: 'ROE provider-derived = earnings / total equity; tanpa formula skor atau ambang nilai.',
    interpretation: 'Data tersedia berarti dapat ditampilkan pada cakupan terbatas; nilai tidak menentukan keanggotaan dan urutan mengikuti market cap provider.',
    example: 'ROE provider-derived-unverified dan P/BV historis provider ditampilkan pada common FY.',
    caution: 'Basis earnings dan equity dapat tidak cocok; basis tanggal dan saham P/BV belum terverifikasi.'
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
  <div class="page-shell space-y-8">
    <!-- Editorial Hero Header -->
    <header class="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/70 to-blue-50/30 p-6 sm:p-8 md:p-10 shadow-xs">
      <div class="relative z-10 max-w-3xl space-y-3">
        <div class="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/70 px-3 py-1 font-mono text-xs font-bold text-[#1E4270]">
          <BookOpen class="size-3.5" />
          <span>Kamus & Glosarium Riset</span>
          <span class="text-slate-300">•</span>
          <span>{{ glossaryTerms.length }} Istilah</span>
        </div>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Kamus Istilah Finansial & Indikator
        </h1>
        <p class="text-sm sm:text-base leading-relaxed text-slate-600 max-w-2xl">
          Pahami istilah-istilah keuangan yang digunakan dalam Voyager One dengan penjelasan sederhana, rumus terverifikasi, dan contoh interpretasi praktis.
        </p>

        <!-- Search Input -->
        <div class="pt-3 max-w-xl">
          <label for="glossary-search" class="sr-only">Cari istilah finansial</label>
          <div class="relative">
            <Search class="absolute left-3.5 top-3.5 size-4 text-slate-400 pointer-events-none" />
            <input
              id="glossary-search"
              v-model="searchQuery"
              type="text"
              placeholder="Cari istilah, misalnya: ROE, P/E, CAGR, Quality Score..."
              class="w-full min-h-11 rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm shadow-2xs transition-colors focus:border-[#1E4270] focus:ring-2 focus:ring-[#1E4270]/20"
            />
          </div>
          <p class="mt-2 text-xs text-slate-500 font-mono" role="status" aria-live="polite">
            {{ filteredTerms.length }} istilah ditemukan.
          </p>
        </div>
      </div>

      <div class="pointer-events-none absolute -right-12 -top-12 size-72 rounded-full bg-blue-100/30 blur-3xl" aria-hidden="true"></div>
    </header>

    <!-- Quick Navigation Category Badges -->
    <div class="flex flex-wrap gap-2">
      <a
        v-for="category in categories"
        :key="category"
        :href="`#${category.toLowerCase().replace(/\s+/g, '-')}`"
        class="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-[#1E4270] hover:bg-slate-50 hover:text-[#1E4270]"
      >
        {{ category }}
      </a>
    </div>

    <!-- No Results State -->
    <div v-if="filteredTerms.length === 0" class="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <BookOpen class="mx-auto size-8 text-slate-400" />
      <h2 class="mt-3 text-base font-bold text-slate-900">Tidak ditemukan</h2>
      <p class="mt-1 text-xs text-slate-500">Tidak ada istilah yang cocok dengan "{{ searchQuery }}".</p>
    </div>

    <!-- Terms by Category -->
    <div v-for="(terms, category) in groupedTerms" :key="category" class="space-y-4">
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
        <h2 :id="category.toLowerCase().replace(/\s+/g, '-')" class="text-base sm:text-lg font-bold text-slate-900 scroll-mt-24">
          {{ category }}
        </h2>
        <span class="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
          {{ terms.length }}
        </span>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        <article
          v-for="item in terms"
          :key="item.term"
          class="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-colors"
          :data-testid="item.term === 'Bank Evidence' ? 'bank-evidence-glossary' : undefined"
        >
          <div>
            <!-- Header -->
            <div class="flex items-start gap-3.5 pb-3 border-b border-slate-100">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1E4270] ring-1 ring-blue-200/70">
                <component :is="item.icon" class="size-5" />
              </div>
              <div class="min-w-0">
                <h3 class="font-mono text-base sm:text-lg font-extrabold text-[#1E4270] tracking-tight">{{ item.term }}</h3>
                <p class="text-xs font-medium text-slate-500">{{ item.fullName }}</p>
              </div>
            </div>

            <!-- Definition -->
            <p class="mt-3.5 text-xs sm:text-sm leading-relaxed text-slate-700">
              {{ item.definition }}
            </p>

            <!-- Formula -->
            <div v-if="item.term !== 'Bank Filter'" class="mt-3.5 rounded-xl bg-slate-50 border border-slate-200/70 p-3">
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Rumus</p>
              <p class="font-mono text-xs font-semibold text-slate-900">{{ item.formula }}</p>
            </div>

            <!-- Interpretation -->
            <div class="mt-3 text-xs leading-relaxed text-slate-600">
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Cara membaca</p>
              <p>{{ item.interpretation }}</p>
            </div>
          </div>

          <!-- Bottom Metric Insights -->
          <div class="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <!-- Example -->
            <div class="rounded-xl bg-blue-50/80 border border-blue-100 p-2.5 text-xs leading-relaxed text-blue-900">
              <p class="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-0.5">Contoh</p>
              <p class="text-[11px]">{{ item.example }}</p>
            </div>

            <!-- Caution -->
            <div class="rounded-xl bg-amber-50/80 border border-amber-200/80 p-2.5 text-xs leading-relaxed text-amber-950">
              <p class="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-0.5">Perhatian</p>
              <p class="text-[11px]">{{ item.caution }}</p>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Footer Note -->
    <div class="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 text-center">
      <p class="text-xs leading-relaxed text-slate-600 max-w-2xl mx-auto">
        <strong class="font-bold text-slate-800">Catatan:</strong> Penjelasan di atas disederhanakan untuk memudahkan pemahaman. 
        Untuk analisis investasi yang serius, konsultasikan dengan profesional keuangan berlisensi.
      </p>
    </div>
  </div>
</template>
