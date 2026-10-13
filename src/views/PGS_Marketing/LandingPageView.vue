<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  Compass,
  ArrowRight,
  ChevronDown,
  ArrowUpRight
} from '@lucide/vue'

// FAQ accordion state
const openFaqIndex = ref<number | null>(0)
const toggleFaq = (index: number) => {
  openFaqIndex.value = openFaqIndex.value === index ? null : index
}

// Features dataset
const features = [
  {
    step: '01',
    category: 'Kriteria Penyaringan',
    title: 'Saring Saham Berdasarkan Kinerja Nyata',
    description: 'Pilih emiten saham berdasarkan profitabilitas (ROE), rasio valuasi (P/E & P/BV), kesehatan neraca, dan pertumbuhan laba dari laporan resmi.',
    statLabel: 'Cakupan Pasar',
    statValue: 'Lintas Sektor'
  },
  {
    step: '02',
    category: 'Pemeriksaan Data',
    title: 'Tiap Angka Memiliki Sumber dan Waktu',
    description: 'Tiap angka metrik mencatat tanggal penarikan, tautan dokumen sumber, dan riwayat perhitungannya agar mudah Anda verifikasi.',
    statLabel: 'Transparansi',
    statValue: 'Rumus Terbuka'
  },
  {
    step: '03',
    category: 'Jadwal Rilis',
    title: 'Pantau Kalender Rilis Data Makro',
    description: 'Cek jadwal keputusan suku bunga bank sentral, angka inflasi, neraca dagang, dan rapat The Fed lengkap dengan angka konsensus serta riwayat sebelumnya.',
    statLabel: 'Frekuensi Data',
    statValue: 'Pembaruan Harian'
  },
  {
    step: '04',
    category: 'Bandingkan Emiten',
    title: 'Bandingkan Saham Pilihan Berdampingan',
    description: 'Sandingkan rasio profitabilitas, valuasi pasar, imbal hasil dividen, dan margin arus kas antar-saham dalam satu tampilan matriks yang ringkas.',
    statLabel: 'Model Komparasi',
    statValue: 'Multi-Emiten'
  }
]

// FAQ dataset
const faqs = [
  {
    question: 'Untuk apa Voyager.One digunakan?',
    answer: 'Voyager.One membantu analis dan investor memeriksa data keuangan emiten saham publik. Anda bisa menyaring saham, menyandingkan rasio valuasi, dan menelusuri sumber angka resmi tanpa rekomendasi tersembunyi.'
  },
  {
    question: 'Bagaimana cara skor dan peringkat saham dihitung?',
    answer: 'Peringkat dihitung memakai formula terbuka. Parameter utamanya mencakup ROE trailing twelve months, valuasi P/E & P/BV, pertumbuhan laba bersih, dan kesehatan neraca keuangan. Kami tidak memberi bobot spekulatif atau opini beli/jual.'
  },
  {
    question: 'Apakah platform ini memberikan rekomendasi investasi?',
    answer: 'Tidak. Seluruh data disajikan murni untuk riset dan bahan perbandingan. Kami tidak menyarankan beli atau jual saham apa pun. Pastikan Anda memeriksa laporan keuangan resmi sebelum mengambil keputusan modal.'
  },
  {
    question: 'Bagaimana cara melihat jadwal data di Kalender Ekonomi?',
    answer: 'Klik menu Kalender Ekonomi di bilah navigasi. Anda dapat memilih tanggal untuk melihat jadwal rilis data makroekonomi, angka perkiraan konsensus, dan hasil sebelumnya.'
  },
  {
    question: 'Dari mana data keuangan dan makro diambil?',
    answer: 'Data dihimpun dari laporan keuangan emiten resmi, bursa efek, bank sentral, badan statistik, dan penyedia data pasar modal berlisensi. Tanggal dan waktu snapshot tercantum di tiap sesi riset.'
  }
]

// 12 Bullish Candlestick bars in ascending stair-step formation (pure positivity, emerald green)
interface CandlePoint {
  x: number
  bodyY: number
  bodyHeight: number
  high: number
  low: number
  volHeight: number
}

const candles: CandlePoint[] = [
  { x: 50,  bodyY: 228, bodyHeight: 26, high: 216, low: 260, volHeight: 28 },
  { x: 95,  bodyY: 206, bodyHeight: 30, high: 194, low: 242, volHeight: 34 },
  { x: 140, bodyY: 186, bodyHeight: 28, high: 174, low: 224, volHeight: 40 },
  { x: 185, bodyY: 166, bodyHeight: 32, high: 154, low: 208, volHeight: 46 },
  { x: 230, bodyY: 146, bodyHeight: 30, high: 134, low: 188, volHeight: 52 },
  { x: 275, bodyY: 128, bodyHeight: 34, high: 116, low: 172, volHeight: 58 },
  { x: 320, bodyY: 110, bodyHeight: 32, high: 98,  low: 154, volHeight: 64 },
  { x: 365, bodyY: 92,  bodyHeight: 36, high: 80,  low: 138, volHeight: 70 },
  { x: 410, bodyY: 76,  bodyHeight: 34, high: 64,  low: 122, volHeight: 76 },
  { x: 455, bodyY: 60,  bodyHeight: 38, high: 48,  low: 106, volHeight: 84 },
  { x: 500, bodyY: 44,  bodyHeight: 40, high: 32,  low: 92,  volHeight: 92 },
  { x: 545, bodyY: 26,  bodyHeight: 46, high: 14,  low: 80,  volHeight: 104 }
]

// Active anchor navigation tracking
const activeSection = ref('hero')

// Dynamic glassmorphic topbar state when scrolled
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

// IntersectionObserver for scroll transitions
let revealObserver: IntersectionObserver | null = null
let sectionObserver: IntersectionObserver | null = null

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })

  // 1. Reveal on scroll observer
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  )

  const revealElements = document.querySelectorAll('.scroll-reveal')
  revealElements.forEach((el) => revealObserver?.observe(el))

  // 2. Active section tracking for navbar
  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      })
    },
    { threshold: 0.3 }
  )

  const sectionElements = document.querySelectorAll('section[id]')
  sectionElements.forEach((el) => sectionObserver?.observe(el))
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  revealObserver?.disconnect()
  sectionObserver?.disconnect()
})
</script>

<template>
  <div class="landing-page-root relative min-h-[100dvh] text-[#102138] selection:bg-[#407EC9]/20 selection:text-[#1E4270]">
    
    <!-- Ambient Background Texture: Light blue to white gradient + subtle ambient blurred light glows -->
    <div
      class="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#EBF3FC] via-[#F5F9FD] to-[#FFFFFF] print:hidden"
      aria-hidden="true"
    ></div>

    <!-- Architectural Financial Grid & Coordinate Matrix Pattern with Radial Mask -->
    <div
      class="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(36,79,135,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(36,79,135,0.04)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_35%,#000_30%,transparent_85%)] print:hidden"
      aria-hidden="true"
    ></div>

    <!-- Secondary Micro-Point Dot Matrix for tactile precision -->
    <div
      class="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(rgba(36,79,135,0.08)_1px,transparent_1px)] bg-[size:40px_40px] bg-[position:20px_20px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_20%,transparent_80%)] print:hidden"
      aria-hidden="true"
    ></div>

    <div
      class="pointer-events-none fixed -top-40 -left-20 z-0 size-[36rem] rounded-full bg-[#C9E0F6]/45 blur-3xl print:hidden"
      aria-hidden="true"
    ></div>

    <div
      class="pointer-events-none fixed top-1/3 -right-20 z-0 size-[32rem] rounded-full bg-[#E0EEFA]/55 blur-3xl print:hidden"
      aria-hidden="true"
    ></div>

    <!-- =========================================================================
         LANDING PAGE FLOATING TOP BAR (Fixed Glass Island that always follows screen)
         ========================================================================= -->
    <header class="fixed top-3 inset-x-0 z-50 px-4 transition-all duration-300 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-[84rem]">
        <div
          class="flex h-16 items-center justify-between rounded-2xl border px-4 transition-all duration-300 sm:px-6"
          :class="isScrolled
            ? 'border-white/50 bg-white/60 shadow-[0_16px_40px_-12px_rgba(36,79,135,0.22)] backdrop-blur-2xl backdrop-saturate-200 ring-1 ring-[#244F87]/15'
            : 'border-white/80 bg-white/85 shadow-[0_8px_24px_-8px_rgba(36,79,135,0.06)] backdrop-blur-md ring-1 ring-slate-900/5'"
        >
          
          <!-- Left: Brand Mark -->
          <router-link to="/landing-page" class="group flex items-center gap-3 text-[#102138] transition-transform hover:scale-[1.01]">
            <div class="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E4270] to-[#244F87] text-white shadow-sm ring-1 ring-slate-900/10">
              <Compass class="size-5 stroke-[2.2]" />
            </div>
            <div class="leading-tight">
              <span class="block font-mono text-sm font-extrabold tracking-tight">VOYAGER<span class="text-[#407EC9]">.ONE</span></span>
              <span class="block text-[10px] font-semibold text-slate-500">Riset Finansial Terbuka</span>
            </div>
          </router-link>

          <!-- Center: Editorial Section Anchors -->
          <nav class="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600" aria-label="Navigasi halaman pengenalan">
            <a
              href="#hero"
              class="transition-colors hover:text-[#1E4270]"
              :class="activeSection === 'hero' ? 'text-[#1E4270] font-bold underline underline-offset-4 decoration-2 decoration-[#407EC9]' : ''"
            >
              Ringkasan
            </a>
            <a
              href="#features"
              class="transition-colors hover:text-[#1E4270]"
              :class="activeSection === 'features' ? 'text-[#1E4270] font-bold underline underline-offset-4 decoration-2 decoration-[#407EC9]' : ''"
            >
              Kapabilitas
            </a>
            <a
              href="#faq"
              class="transition-colors hover:text-[#1E4270]"
              :class="activeSection === 'faq' ? 'text-[#1E4270] font-bold underline underline-offset-4 decoration-2 decoration-[#407EC9]' : ''"
            >
              Tanya Jawab
            </a>
            <router-link to="/economic-calendar" class="transition-colors hover:text-[#1E4270]">
              Kalender Ekonomi
            </router-link>
            <router-link to="/methodology" class="transition-colors hover:text-[#1E4270]">
              Metodologi
            </router-link>
          </nav>

          <!-- Right: Minimalized Action Button -->
          <div class="flex items-center gap-3">
            <router-link
              to="/workspace"
              class="group inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#1E4270] shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-[#244F87]/30 hover:bg-[#1E4270] hover:text-white hover:shadow-xs active:scale-[0.97]"
              title="Masuk ke Workspace Riset"
            >
              <span>Workspace</span>
              <ArrowUpRight class="size-3.5 stroke-[2] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </router-link>
          </div>

        </div>
      </div>
    </header>

    <div class="relative z-10 mx-auto max-w-[84rem] px-4 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      
      <!-- =========================================================================
           SECTION 1: HERO (LEFT LABEL/CONTENT + RIGHT CANDLESTICK ILLUSTRATION)
           ========================================================================= -->
      <section id="hero" class="scroll-reveal py-8 sm:py-12 md:py-16 lg:py-20" aria-labelledby="hero-heading">
        <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          <!-- LEFT HERO CONTENT -->
          <div class="flex flex-col items-start lg:col-span-7 xl:col-span-6">
            <!-- Label with accent bar -->
            <div class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#244F87]">
              <span class="h-1.5 w-6 rounded-full bg-[#407EC9]" aria-hidden="true"></span>
              <span>Workspace Riset Saham</span>
            </div>

            <!-- Display Headline -->
            <h1
              id="hero-heading"
              class="mt-6 text-4xl font-extrabold tracking-tight text-[#102138] sm:text-5xl md:text-6xl lg:text-[3.75rem] leading-[1.08] text-balance"
            >
              Riset saham emiten publik dengan rujukan data yang jelas.
            </h1>

            <p class="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Periksa laporan keuangan, rasio valuasi, dan kinerja saham lintas sektor. Lihat rumus perhitungan, kalender data makro, dan dokumen rujukan resmi di satu tempat.
            </p>

            <!-- Nested Double-Bezel CTA & Secondary Explore Action -->
            <div class="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
              <!-- Double-Bezel Button Architecture -->
              <div class="p-1 rounded-full bg-slate-900/5 ring-1 ring-slate-900/10">
                <router-link
                  to="/workspace"
                  class="group relative inline-flex items-center gap-3 rounded-full bg-[#1E4270] px-6 py-3.5 text-sm font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#244F87] active:scale-[0.98]"
                >
                  <span>Mulai Workspace Riset</span>
                  <!-- Button-in-Button Trailing Icon -->
                  <span class="flex size-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-0.5">
                    <ArrowUpRight class="size-4 stroke-[2.2] text-white" />
                  </span>
                </router-link>
              </div>

              <router-link
                to="/methodology"
                class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-2xs backdrop-blur-xs transition-colors hover:border-slate-400 hover:bg-white hover:text-slate-950"
              >
                <span>Pelajari metodologi analisis</span>
              </router-link>
            </div>
          </div>

          <!-- RIGHT HERO: PURE NAKED CANDLESTICK CHART (NO WHITE BACKGROUND, DIRECT STICK CANDLES) -->
          <div class="relative flex items-center justify-center lg:col-span-5 xl:col-span-6 w-full select-none">
            <!-- Naked Candlestick & Trendline SVG Chart directly on page background -->
            <div class="relative h-72 sm:h-84 md:h-96 lg:h-[28rem] w-full max-w-2xl xl:max-w-3xl">
              <svg
                viewBox="0 0 600 340"
                class="h-full w-full overflow-visible"
                aria-label="Animasi grafik lilin saham hijau (candlestick chart)"
              >
                <defs>
                  <!-- Bullish Up Trend Area Gradient (Emerald) -->
                  <linearGradient id="bullishGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#10B981" stop-opacity="0.22" />
                    <stop offset="100%" stop-color="#10B981" stop-opacity="0.0" />
                  </linearGradient>
                </defs>

                <!-- Subtle Horizontal Financial Gridlines directly on background -->
                <g class="gridlines">
                  <line x1="25" y1="60" x2="575" y2="60" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="4 4" opacity="0.45" />
                  <line x1="25" y1="120" x2="575" y2="120" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="4 4" opacity="0.45" />
                  <line x1="25" y1="180" x2="575" y2="180" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="4 4" opacity="0.45" />
                  <line x1="25" y1="240" x2="575" y2="240" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="4 4" opacity="0.45" />
                </g>

                <!-- Background Trendline Area Gradient Fill -->
                <path
                  d="M 50 240 C 150 210, 250 160, 350 120 S 480 60, 545 34 L 545 315 L 50 315 Z"
                  fill="url(#bullishGradient)"
                  class="chart-area"
                />

                <!-- Dynamic Moving Average Trendline (Smooth Curve) -->
                <path
                  d="M 50 240 C 150 210, 250 160, 350 120 S 480 60, 545 34"
                  fill="none"
                  stroke="#10B981"
                  stroke-width="3"
                  stroke-linecap="round"
                  class="chart-line"
                />

                <!-- Candlestick Units (1st candle up till the last candle in 6-second rolling wave) -->
                <g
                  v-for="(c, idx) in candles"
                  :key="'candle-' + idx"
                  class="candle-unit"
                  :style="{ animationDelay: `${idx * 0.3}s` }"
                >
                  <!-- High to Low Wick -->
                  <line
                    :x1="c.x"
                    :y1="c.high"
                    :x2="c.x"
                    :y2="c.low"
                    stroke="#10B981"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />

                  <!-- Bullish Candle Body -->
                  <rect
                    :x="c.x - 10"
                    :y="c.bodyY"
                    width="20"
                    :height="c.bodyHeight"
                    rx="3"
                    fill="#10B981"
                    stroke="#059669"
                    stroke-width="1.2"
                  />

                  <!-- Volume Bar at bottom -->
                  <rect
                    :x="c.x - 5"
                    :y="325 - c.volHeight"
                    width="10"
                    :height="c.volHeight"
                    rx="2"
                    fill="#10B981"
                    opacity="0.45"
                  />
                </g>

                <!-- Volume Base Label -->
                <text x="25" y="324" fill="#94A3B8" font-size="9" font-family="monospace">VOL</text>

                <!-- Glowing Bullish Peak Beacon on 12th Candle Summit -->
                <circle
                  cx="545"
                  cy="34"
                  r="10"
                  fill="#10B981"
                  opacity="0.35"
                  class="animate-ping"
                />
                <circle
                  cx="545"
                  cy="34"
                  r="5.5"
                  fill="#10B981"
                  stroke="#FFFFFF"
                  stroke-width="2.5"
                  class="chart-beacon"
                />
              </svg>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 2: WHAT WE HAVE (KAPABILITAS SISTEM)
           ========================================================================= -->
      <section id="features" class="scroll-reveal py-16 sm:py-20 md:py-28" aria-labelledby="features-heading">
        <div class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#244F87]">
            <span class="h-1.5 w-6 rounded-full bg-[#407EC9]" aria-hidden="true"></span>
            <span>Fitur Utama</span>
          </div>
          <h2
            id="features-heading"
            class="mt-4 text-3xl font-extrabold tracking-tight text-[#102138] sm:text-4xl lg:text-5xl"
          >
            Apa yang dapat Anda lakukan di Voyager.One
          </h2>
          <p class="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Semua tahapan analisis disusun transparan. Anda dapat melihat perhitungan tiap rasio, memeriksa catatan sumber, dan menguji ulang data secara mandiri.
          </p>
        </div>

        <!-- Asymmetric 2-column zig-zag cards with frosted white surface -->
        <div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
          
          <div
            v-for="(feat, idx) in features"
            :key="feat.title"
            class="feature-card group rounded-[2rem] border border-white/80 bg-white/80 p-6 sm:p-8 shadow-[0_8px_30px_-8px_rgba(36,79,135,0.06)] ring-1 ring-slate-900/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-10px_rgba(36,79,135,0.12)]"
            :class="idx === 0 || idx === 3 ? 'lg:col-span-7' : 'lg:col-span-5'"
            :style="{ transitionDelay: `${idx * 80}ms` }"
          >
            <div class="flex h-full flex-col justify-between">
              <div>
                <!-- Top step index & category -->
                <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <span class="font-mono text-xs font-bold text-[#244F87]">
                    {{ feat.step }} — {{ feat.category }}
                  </span>
                </div>

                <!-- Title & description -->
                <h3 class="mt-4 text-xl font-bold tracking-tight text-[#102138] sm:text-2xl">
                  {{ feat.title }}
                </h3>
                <p class="mt-3 text-sm leading-relaxed text-slate-600">
                  {{ feat.description }}
                </p>
              </div>

              <!-- Bottom Stat Highlight -->
              <div class="mt-8 flex items-baseline justify-between border-t border-slate-100 pt-4">
                <span class="text-xs font-medium text-slate-400">
                  {{ feat.statLabel }}
                </span>
                <span class="font-mono text-sm font-extrabold text-[#1E4270]">
                  {{ feat.statValue }}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: HOW & FAQ (PANDUAN & TANYA JAWAB)
           ========================================================================= -->
      <section id="faq" class="scroll-reveal py-16 sm:py-20 md:py-28" aria-labelledby="faq-heading">
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          
          <!-- Left: Sticky Editorial Header for FAQ -->
          <div class="lg:col-span-5">
            <div class="sticky top-28">
              <div class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#244F87]">
                <span class="h-1.5 w-6 rounded-full bg-[#407EC9]" aria-hidden="true"></span>
                <span>Pusat Informasi</span>
              </div>
              <h2
                id="faq-heading"
                class="mt-4 text-3xl font-extrabold tracking-tight text-[#102138] sm:text-4xl"
              >
                Tanya jawab & cara kerja
              </h2>
              <p class="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                Pertanyaan umum seputar sumber data, cara perhitungan rasio, dan batasan penggunaan hasil riset di platform ini.
              </p>

              <!-- Secondary Link to Documentation -->
              <div class="mt-8 flex flex-col gap-3">
                <router-link
                  to="/help"
                  class="group inline-flex items-center gap-2 text-sm font-bold text-[#1E4270] hover:underline"
                >
                  <span>Buka panduan bantuan lengkap</span>
                  <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
                </router-link>
                <router-link
                  to="/glossary"
                  class="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  <span>Kamus istilah finansial & rasio</span>
                  <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
                </router-link>
              </div>
            </div>
          </div>

          <!-- Right: Clean Minimalist Line-Separated Accordion Stack with Smooth Grid Transitions -->
          <div class="lg:col-span-7">
            <div class="divide-y divide-slate-200/90 rounded-2xl border border-white/80 bg-white/70 p-2 sm:p-4 shadow-[0_8px_30px_-8px_rgba(36,79,135,0.06)] ring-1 ring-slate-900/5 backdrop-blur-sm">
              <div
                v-for="(item, index) in faqs"
                :key="item.question"
                class="faq-row px-4 py-5 transition-colors duration-150 hover:bg-blue-50/30 rounded-xl"
              >
                <button
                  type="button"
                  class="flex w-full items-start justify-between gap-4 text-left font-bold text-[#102138] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#244F87] rounded-lg p-1"
                  :aria-expanded="openFaqIndex === index"
                  @click="toggleFaq(index)"
                >
                  <span class="text-base sm:text-lg leading-snug">{{ item.question }}</span>
                  <span
                    class="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-300"
                    :class="openFaqIndex === index ? 'rotate-180 bg-[#E7F1FB] text-[#1E4270]' : ''"
                  >
                    <ChevronDown class="size-4 stroke-[2.2]" />
                  </span>
                </button>

                <!-- Grid-based CSS accordion expansion for buttery smooth auto-height transition -->
                <div
                  class="faq-content grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  :class="openFaqIndex === index ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'"
                >
                  <div class="overflow-hidden">
                    <p class="pt-1 text-sm leading-relaxed text-slate-600">
                      {{ item.answer }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* Smooth scroll behavior for landing page */
.landing-page-root {
  scroll-behavior: smooth;
}

/* Candlestick SVG element transitions: wicks, bodies, line, volume, and beacon smoothly animate up and down */
/* 6-second progressive wave from 1st candle up till the last candle, repeating infinitely */
@keyframes candleWaveRise {
  0% {
    transform: translateY(32px) scaleY(0.4);
    opacity: 0.35;
    filter: drop-shadow(0 0 0 transparent);
  }
  16% {
    transform: translateY(-8px) scaleY(1.08);
    opacity: 1;
    filter: drop-shadow(0 4px 14px rgba(16, 185, 129, 0.75));
  }
  28%, 78% {
    transform: translateY(0) scaleY(1);
    opacity: 1;
    filter: drop-shadow(0 2px 8px rgba(16, 185, 129, 0.35));
  }
  92%, 100% {
    transform: translateY(32px) scaleY(0.4);
    opacity: 0.35;
    filter: drop-shadow(0 0 0 transparent);
  }
}

.candle-unit {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: candleWaveRise 6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  will-change: transform, opacity, filter;
}

.chart-line {
  filter: drop-shadow(0 2px 10px rgba(16, 185, 129, 0.45));
}

.chart-beacon {
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.9));
}

/* Scroll-triggered reveal transitions */
.scroll-reveal {
  opacity: 0;
  transform: translateY(2rem);
  filter: blur(2px);
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
              filter 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform, filter;
}

.scroll-reveal.is-revealed {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .candle-unit {
    animation: none !important;
  }
  .scroll-reveal {
    opacity: 1;
    transform: none;
    filter: none;
    transition: none;
  }
}
</style>
