<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import DataProvenance from '../components/DataProvenance.vue'
import { ArrowLeft, ArrowRight, BarChart3, CheckCircle2, AlertTriangle, Database, GitCompare, Landmark, LineChart, Scale, WalletCards } from '@lucide/vue'
import type { CandidateCompany } from '../types'

type DossierItem = { label: string; value: string; context?: string }

const route = useRoute()
const store = useResearchStore()
const company = computed(() => store.candidates.find(candidate => candidate.symbol === String(route.params.symbol).toUpperCase()))
const formatIdr = (value: number) => new Intl.NumberFormat('id-ID').format(value)
const compactSource = (source: string) => source.startsWith('Derived')
  ? `Turunan · ${source.split('/').pop()}`
  : `Fixture v1 · ${source.split('/').slice(-2).join('/')}`
const metricGroups = computed(() => !company.value ? [] : [
  { title: 'Valuasi', icon: Scale, items: [
    { label: 'Harga fixture', value: `Rp${formatIdr(company.value.priceIdr)}` },
    { label: 'Kapitalisasi pasar', value: `Rp${company.value.marketCapTrillionIdr} tn` },
    { label: 'P/E', value: `${company.value.peRatio}x` },
    { label: 'P/BV', value: `${company.value.pbvRatio}x` },
    { label: 'EV/EBITDA', value: `${company.value.evToEbitda}x` }
  ] },
  { title: 'Profitabilitas', icon: LineChart, items: [
    { label: 'ROE', value: `${company.value.roePercent}%` },
    { label: 'ROA', value: `${company.value.roaPercent}%` },
    { label: 'Margin laba bersih', value: `${company.value.dupontAnalysis.netProfitMargin}%` },
    { label: 'CAGR laba bersih 3 tahun', value: `${company.value.netIncome3yCagrPercent}%` }
  ] },
  { title: 'Neraca', icon: Landmark, items: [
    { label: 'Debt/Equity', value: `${company.value.debtToEquity}x` },
    { label: 'Current ratio', value: `${company.value.currentRatio}x` },
    { label: 'Pengali ekuitas', value: `${company.value.dupontAnalysis.equityMultiplier}x` }
  ] },
  { title: 'Arus kas', icon: WalletCards, items: [
    { label: 'FCF yield', value: `${company.value.freeCashFlowYieldPercent}%` }
  ] }
])
const trendItems = computed<DossierItem[]>(() => !company.value ? [] : company.value.trends?.length ? company.value.trends.map(item => ({ label: item.label, value: `${item.value}`, context: `${item.period ? `${item.period} · ` : ''}Nilai indeks fixture ilustratif, bukan persentase.` })) : [
  { label: 'Pendapatan', value: `${company.value.revenue3yCagrPercent}% CAGR`, context: 'Rata-rata pertumbuhan tahunan selama tiga tahun.' },
  { label: 'Laba bersih', value: `${company.value.netIncome3yCagrPercent}% CAGR`, context: 'Rata-rata pertumbuhan tahunan selama tiga tahun.' }
])
const sameSectorPeers = computed(() => !company.value ? [] : store.candidates.filter(candidate => candidate.symbol !== company.value?.symbol && candidate.sector === company.value?.sector))
const otherCandidates = computed(() => !company.value ? [] : store.candidates.filter(candidate => candidate.symbol !== company.value?.symbol && candidate.sector !== company.value?.sector))
const relatedSessions = computed(() => !company.value ? [] : store.sessions.filter(session => session.candidates.some(candidate => candidate.symbol === company.value?.symbol)).slice(0, 3))
const optionalCoverage = computed(() => !company.value ? [] : [
  { label: 'Kinerja harga', available: Boolean(company.value.listingPerformance?.length) },
  { label: 'Segmen', available: Boolean(company.value.segments?.length) },
  { label: 'Pandangan ke depan', available: Boolean(company.value.forwardEstimates?.length) },
  { label: 'Riwayat dividen', available: Boolean(company.value.dividendHistory?.length) },
  { label: 'Tata kelola', available: Boolean(company.value.ownershipManagement?.length) },
  { label: 'ESG', available: Boolean(company.value.esg?.length) }
])
const availableOptionalCount = computed(() => optionalCoverage.value.filter(item => item.available).length)
const factors = computed(() => company.value ? [
  { label: 'Profitabilitas', value: company.value.scoreBreakdown.profitability, weight: '25%' },
  { label: 'Pertumbuhan', value: company.value.scoreBreakdown.growth, weight: '25%' },
  { label: 'Solvabilitas', value: company.value.scoreBreakdown.solvency, weight: '20%' },
  { label: 'Valuasi', value: company.value.scoreBreakdown.valuation, weight: '20%' },
  { label: 'Konsistensi', value: company.value.scoreBreakdown.consistency, weight: '10%' }
] : [])
const scoreInterpretation = computed(() => !company.value ? '' : company.value.qualityScore >= 90 ? 'Sangat kuat dalam ruang lingkup sesi' : company.value.qualityScore >= 80 ? 'Kuat, dengan tradeoff yang perlu diperiksa' : company.value.qualityScore >= 70 ? 'Campuran dan perlu analisis tambahan' : 'Tidak diprioritaskan oleh model')
const primaryMetrics = computed(() => company.value ? [
  { label: 'Efisiensi modal', term: 'ROE', value: `${company.value.roePercent}%`, help: 'Laba yang dihasilkan dari setiap Rp100 modal. Nilai tinggi juga dapat dipengaruhi leverage.' },
  { label: 'Harga dibanding laba', term: 'P/E', value: `${company.value.peRatio}x`, help: 'Harga untuk setiap Rp1 laba tahunan. Bandingkan dengan sektor dan histori perusahaan.' },
  { label: 'Pertumbuhan pendapatan', term: 'CAGR 3 tahun', value: `${company.value.revenue3yCagrPercent}%`, help: 'Rata-rata pertumbuhan per tahun selama tiga tahun, bukan pertumbuhan setiap tahun.' },
  { label: 'Kas bebas dibanding nilai', term: 'FCF yield', value: `${company.value.freeCashFlowYieldPercent}%`, help: 'Kas bebas tahunan relatif terhadap nilai perusahaan.' }
] : [])
const dupontParts = computed(() => company.value ? [
  { label: 'Margin laba bersih', value: `${company.value.dupontAnalysis.netProfitMargin}%`, help: 'Laba yang tersisa dari setiap Rp100 pendapatan.' },
  { label: 'Efisiensi aset', value: `${company.value.dupontAnalysis.assetTurnover}x`, help: 'Pendapatan yang dihasilkan setiap Rp1 aset.' },
  { label: 'Pengaruh leverage', value: `${company.value.dupontAnalysis.equityMultiplier}x`, help: 'Aset yang didukung setiap Rp1 modal; lebih tinggi berarti leverage lebih besar.' },
  { label: 'ROE terhitung', value: `${company.value.dupontAnalysis.calculatedRoe}%`, help: 'Hasil gabungan margin, efisiensi aset, dan leverage.' }
] : [])
</script>

<template>
  <div v-if="!company" class="mx-auto flex min-h-[65dvh] max-w-xl flex-col items-center justify-center px-6 text-center">
    <h1 class="text-2xl font-bold text-slate-950">Perusahaan tidak ditemukan</h1>
    <p class="mt-3 text-sm text-slate-600">Ticker ini tidak tersedia dalam sesi riset yang sedang dibuka.</p>
    <router-link :to="`/research/${store.report.sessionId}/screener`" class="button-primary mt-6">Kembali ke kandidat</router-link>
  </div>

  <div v-else class="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <router-link :to="`/research/${store.report.sessionId}/screener`" class="text-link inline-flex"><ArrowLeft class="h-4 w-4" /> Kembali ke kandidat</router-link>

    <header class="overflow-hidden rounded-3xl bg-[#102138] text-white shadow-xl">
      <div class="grid gap-7 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div class="flex flex-wrap items-center gap-2 text-xs text-blue-200"><span>{{ company.sector }}</span><span aria-hidden="true">·</span><span>{{ company.subsector }}</span></div>
          <h1 class="mt-3 font-mono text-4xl font-bold tracking-tight sm:text-5xl">{{ company.symbol }}</h1>
          <p class="mt-2 text-base text-slate-300">{{ company.name }}</p>
          <p class="mt-6 max-w-3xl text-sm leading-6 text-slate-200">{{ company.whySelected }}</p>
        </div>
        <div class="max-w-56 rounded-2xl border border-white/15 bg-white/8 p-5 text-center"><span class="text-xs text-blue-200">Skor kualitas</span><strong class="mt-1 block font-mono text-4xl">{{ company.qualityScore }}</strong><span class="text-xs text-slate-400">dari 100</span><p class="mt-2 text-xs leading-5 text-blue-100">{{ scoreInterpretation }}</p></div>
      </div>
    </header>

    <DataProvenance source="Prototype fixture v1 dan metrik turunan sesi" :financial-period="company.financialPeriod" :price-as-of="company.priceAsOf" :generated-at="store.report.timestamp" />

    <section class="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Metrik utama">
      <div v-for="metric in primaryMetrics" :key="metric.term" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span class="text-xs font-semibold text-slate-700">{{ metric.label }}</span><span class="ml-1 text-xs text-slate-500">{{ metric.term }}</span><strong class="mt-1 block font-mono text-xl text-slate-950">{{ metric.value }}</strong><p class="mt-2 text-[11px] leading-5 text-slate-500">{{ metric.help }}</p></div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="financial-dossier-title">
      <div><p class="section-kicker">Ringkasan fundamental</p><h2 id="financial-dossier-title" class="mt-1 text-lg font-bold text-slate-950">Dossier metrik keuangan</h2><p class="mt-2 text-xs leading-5 text-slate-500">Angka ditampilkan sesuai fixture. Definisi rasio dapat berbeda antar sektor, terutama pada perusahaan finansial.</p></div>
      <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><article v-for="group in metricGroups" :key="group.title" class="rounded-2xl border border-slate-200 p-4"><h3 class="flex items-center gap-2 text-sm font-bold text-slate-950"><component :is="group.icon" class="h-4 w-4 text-[#407EC9]" />{{ group.title }}</h3><dl class="mt-4 divide-y divide-slate-100"><div v-for="item in group.items" :key="item.label" class="flex items-baseline justify-between gap-3 py-2.5"><dt class="text-xs text-slate-600">{{ item.label }}</dt><dd class="shrink-0 font-mono text-sm font-bold text-slate-950">{{ item.value }}</dd></div></dl></article></div>
    </section>

    <div class="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
      <div class="space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div class="flex items-center gap-2"><BarChart3 class="h-4 w-4 text-[#407EC9]" /><h2 class="text-lg font-bold text-slate-950">Lima faktor penilaian</h2></div>
          <p class="mt-2 text-xs leading-5 text-slate-500">Setiap faktor dinilai 0-100 dalam model demonstrasi. Bobot menunjukkan kontribusi pada skor akhir, bukan peluang keuntungan.</p>
          <div class="mt-5 space-y-4"><div v-for="factor in factors" :key="factor.label"><div class="mb-1.5 flex justify-between text-xs"><span class="font-semibold text-slate-700">{{ factor.label }} · {{ factor.weight }}</span><span class="font-mono font-bold">{{ factor.value }}/100</span></div><div class="h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-[#407EC9]" :style="{ width: `${factor.value}%` }"></div></div></div></div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div class="flex items-center gap-2"><GitCompare class="h-4 w-4 text-[#407EC9]" /><h2 class="text-lg font-bold text-slate-950">Sumber ROE: margin × efisiensi aset × leverage</h2></div>
          <div class="mt-5 grid gap-3 sm:grid-cols-4"><div v-for="part in dupontParts" :key="part.label" class="rounded-xl bg-slate-50 p-4 text-center"><span class="text-xs font-semibold text-slate-700">{{ part.label }}</span><strong class="mt-1 block font-mono text-lg">{{ part.value }}</strong><p class="mt-2 text-[11px] leading-5 text-slate-500">{{ part.help }}</p></div></div>
        </section>
      </div>

      <aside class="space-y-6">
        <section class="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5"><h2 class="flex items-center gap-2 text-sm font-bold text-emerald-950"><CheckCircle2 class="h-4 w-4" /> Kekuatan utama</h2><ul class="mt-4 space-y-3 text-sm leading-6 text-slate-700"><li v-for="strength in company.keyStrengths" :key="strength" class="flex gap-2"><span class="text-emerald-600">•</span>{{ strength }}</li></ul></section>
        <section class="rounded-2xl border border-amber-200 bg-amber-50/60 p-5"><h2 class="flex items-center gap-2 text-sm font-bold text-amber-950"><AlertTriangle class="h-4 w-4" /> Risiko dan hal yang perlu dipantau</h2><ul class="mt-4 space-y-3 text-sm leading-6 text-slate-700"><li v-for="risk in company.potentialConcerns" :key="risk" class="flex gap-2"><span class="text-amber-600">•</span>{{ risk }}</li></ul></section>
      </aside>
    </div>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div class="flex items-center gap-2"><Database class="h-4 w-4 text-[#407EC9]" /><h2 class="text-lg font-bold text-slate-950">Nilai, sumber, dan konteks pembanding</h2></div>
      <div class="mt-5 grid gap-3 md:grid-cols-2"><article v-for="evidence in company.evidenceCitations" :key="`${evidence.metric}-${evidence.source}`" class="rounded-xl border border-slate-200 p-4"><div class="flex items-start justify-between gap-3"><div><h3 class="text-sm font-bold text-slate-900">{{ evidence.metric }}</h3><p class="mt-1 font-mono text-lg font-bold text-[#2F64A8]">{{ evidence.value }}</p></div><span class="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600" :title="evidence.source">{{ compactSource(evidence.source) }}</span></div><p class="mt-3 text-xs leading-5 text-slate-600">{{ evidence.context }}</p><dl v-if="evidence.period || evidence.asOf" class="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-500"><div v-if="evidence.period"><dt class="inline font-semibold">Periode:</dt> <dd class="inline font-mono">{{ evidence.period }}</dd></div><div v-if="evidence.asOf"><dt class="inline font-semibold">Per tanggal:</dt> <dd class="inline font-mono">{{ evidence.asOf }}</dd></div></dl></article></div>
    </section>

    <section class="grid gap-5 lg:grid-cols-2" aria-label="Kinerja, tren, dan cakupan analisis">
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 class="text-lg font-bold text-slate-950">Kinerja dan tren</h2><div v-if="company.listingPerformance?.length" class="mt-4 grid gap-3 sm:grid-cols-2"><div v-for="item in company.listingPerformance" :key="item.label" class="rounded-xl bg-slate-50 p-4"><span class="text-xs text-slate-600">{{ item.label }}</span><strong class="mt-1 block font-mono text-lg">{{ item.value }}</strong><p v-if="item.detail" class="mt-2 text-xs leading-5 text-slate-500">{{ item.detail }}</p></div></div><div v-else class="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><p class="text-sm font-semibold text-slate-800">Kinerja harga tidak tersedia</p><p class="mt-1 text-xs leading-5 text-slate-500">Fixture tidak memuat return harga, benchmark indeks, volatilitas, atau total shareholder return.</p></div><div class="mt-4 grid gap-3 sm:grid-cols-2"><div v-for="item in trendItems" :key="item.label" class="rounded-xl border border-slate-200 p-4"><span class="text-xs text-slate-600">{{ item.label }}</span><strong class="mt-1 block font-mono text-lg">{{ item.value }}</strong><p v-if="item.context" class="mt-2 text-xs leading-5 text-slate-500">{{ item.context }}</p></div></div></article>
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 class="text-lg font-bold text-slate-950">Segmen dan pandangan ke depan</h2><div v-if="company.segments?.length" class="mt-4 space-y-3"><div v-for="item in company.segments" :key="item.label" class="rounded-xl border border-slate-200 p-4"><div class="flex justify-between gap-3"><span class="text-sm font-semibold">{{ item.label }}</span><strong class="font-mono">{{ item.value }}</strong></div><p v-if="item.detail" class="mt-2 text-xs leading-5 text-slate-500">{{ item.detail }}</p></div></div><div v-else class="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><p class="text-sm font-semibold text-slate-800">Rincian segmen tidak tersedia</p><p class="mt-1 text-xs leading-5 text-slate-500">Fixture tidak memuat kontribusi pendapatan, laba, atau geografi per segmen.</p></div><div v-if="company.forwardEstimates?.length" class="mt-4 space-y-3"><div v-for="item in company.forwardEstimates" :key="item.label" class="rounded-xl border border-slate-200 p-4"><div class="flex justify-between gap-3"><span class="text-sm font-semibold">{{ item.label }}</span><strong class="font-mono">{{ item.value }}</strong></div><p v-if="item.detail" class="mt-2 text-xs leading-5 text-slate-500">{{ item.detail }}</p></div></div><div v-else class="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><p class="text-sm font-semibold text-slate-800">Estimasi forward tidak tersedia</p><p class="mt-1 text-xs leading-5 text-slate-500">Tidak ada panduan manajemen, estimasi analis, target harga, atau proyeksi laba dalam fixture.</p></div></article>
    </section>

    <section class="grid gap-5 lg:grid-cols-2" aria-label="Dividen, tata kelola, dan ESG">
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 class="text-lg font-bold text-slate-950">Dividen</h2><div class="mt-4 rounded-xl bg-slate-50 p-4"><span class="text-xs text-slate-600">Dividend yield fixture</span><strong class="mt-1 block font-mono text-2xl">{{ company.dividendYieldPercent }}%</strong></div><div v-if="company.dividendHistory?.length" class="mt-4 space-y-3"><div v-for="item in company.dividendHistory" :key="item.label" class="flex justify-between gap-3 border-b border-slate-100 pb-3 text-sm"><span>{{ item.label }}</span><strong class="font-mono">{{ item.value }}</strong></div></div><div v-else class="mt-4 rounded-xl border border-dashed border-slate-300 p-4"><p class="text-sm font-semibold text-slate-800">Riwayat dividen tidak tersedia</p><p class="mt-1 text-xs leading-5 text-slate-500">Yield saat ini tersedia, tetapi payout ratio, pertumbuhan dividen, tanggal pembayaran, dan histori tidak dimuat.</p></div></article>
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 class="text-lg font-bold text-slate-950">Tata kelola dan ESG</h2><div v-if="company.ownershipManagement?.length || company.esg?.length" class="mt-4 grid gap-3 sm:grid-cols-2"><div v-for="item in [...(company.ownershipManagement || []), ...(company.esg || [])]" :key="item.label" class="rounded-xl border border-slate-200 p-4"><span class="text-xs text-slate-600">{{ item.label }}</span><strong class="mt-1 block font-mono text-base">{{ item.value }}</strong><p v-if="item.detail" class="mt-2 text-xs leading-5 text-slate-500">{{ item.detail }}</p></div></div><div v-else class="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><p class="text-sm font-semibold text-slate-800">Data tata kelola dan ESG tidak tersedia</p><p class="mt-1 text-xs leading-5 text-slate-500">Fixture tidak memuat struktur dewan, kepemilikan, kontroversi, emisi, target iklim, atau skor ESG. Risiko ESG dalam catatan kekhawatiran bersifat naratif, bukan penilaian terverifikasi.</p></div></article>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="peer-context-title"><div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p class="section-kicker">Konteks kandidat sesi</p><h2 id="peer-context-title" class="mt-1 text-lg font-bold text-slate-950">Pembanding yang tersedia</h2><p class="mt-2 text-xs leading-5 text-slate-500">{{ company.peerRankInMemory }}. Peringkat ini berasal dari memori fixture dan tidak menggantikan benchmark sektor yang lengkap.</p></div><router-link :to="`/research/${store.report.sessionId}/peers`" class="button-secondary shrink-0">Bandingkan kandidat <GitCompare class="h-4 w-4" /></router-link></div><div v-if="sameSectorPeers.length" class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><article v-for="peer in sameSectorPeers" :key="peer.symbol" class="rounded-xl border border-slate-200 p-4"><div class="flex items-center justify-between gap-3"><router-link :to="`/research/${store.report.sessionId}/company/${peer.symbol}`" class="font-mono text-base font-bold text-[#2F64A8] hover:underline">{{ peer.symbol }}</router-link><span class="text-xs text-slate-500">Skor {{ peer.qualityScore }}</span></div><p class="mt-1 truncate text-xs text-slate-600">{{ peer.name }}</p><dl class="mt-3 flex gap-4 text-xs"><div><dt class="text-slate-500">P/E</dt><dd class="font-mono font-bold">{{ peer.peRatio }}x</dd></div><div><dt class="text-slate-500">ROE</dt><dd class="font-mono font-bold">{{ peer.roePercent }}%</dd></div></dl></article></div><div v-else class="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><p class="flex items-center gap-2 text-sm font-bold text-amber-950"><AlertTriangle class="h-4 w-4" /> Tidak ada pembanding satu sektor dalam kandidat sesi</p><p class="mt-2 text-xs leading-5 text-slate-600">{{ otherCandidates.length ? `${otherCandidates.length} kandidat lain berasal dari sektor berbeda. Perbandingan rasio lintas sektor dapat menyesatkan dan harus dibaca sebagai konteks sesi saja.` : 'Sesi ini tidak memiliki kandidat lain untuk dibandingkan.' }}</p></div></section>

    <section class="grid gap-5 lg:grid-cols-[1fr_0.8fr]" aria-label="Kelengkapan dan sesi terkait"><article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 class="text-lg font-bold text-slate-950">Kelengkapan dan keterbatasan data</h2><p class="mt-2 text-sm leading-6 text-slate-600">{{ availableOptionalCount }} dari {{ optionalCoverage.length }} kelompok data lanjutan tersedia. Metrik inti lengkap untuk model fixture, tetapi periode pelaporan dan rekonsiliasi ke laporan keuangan asli tidak tersedia.</p><ul class="mt-4 grid gap-2 sm:grid-cols-2"><li v-for="item in optionalCoverage" :key="item.label" class="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs"><CheckCircle2 v-if="item.available" class="h-4 w-4 text-emerald-600" /><AlertTriangle v-else class="h-4 w-4 text-amber-600" /><span>{{ item.label }}: {{ item.available ? 'tersedia' : 'tidak tersedia' }}</span></li></ul><ul class="mt-5 space-y-2 text-xs leading-5 text-slate-600"><li v-for="limitation in store.report.limitations" :key="limitation" class="flex gap-2"><span aria-hidden="true">•</span>{{ limitation }}</li><li class="flex gap-2"><span aria-hidden="true">•</span>Angka dapat tidak sebanding lintas sektor dan belum diperbarui secara real-time.</li></ul></article><article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 class="text-lg font-bold text-slate-950">Sesi lokal terkait</h2><div v-if="relatedSessions.length" class="mt-4 space-y-3"><router-link v-for="session in relatedSessions" :key="session.id" :to="`/research/${session.id}/company/${company.symbol}`" class="block rounded-xl border border-slate-200 p-4 hover:border-[#407EC9]"><span class="text-sm font-bold text-slate-900">{{ session.objective }}</span><span class="mt-1 block font-mono text-[11px] text-slate-500">{{ session.updatedAt }} · {{ session.status }}</span></router-link></div><div v-else class="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><p class="text-sm font-semibold text-slate-800">Belum ada sesi lokal terkait</p><p class="mt-1 text-xs leading-5 text-slate-500">Perusahaan ini belum ditemukan pada snapshot sesi yang tersimpan di browser.</p></div></article></section>

    <section class="flex flex-col gap-5 rounded-2xl bg-[#102138] p-6 text-white sm:p-8 lg:flex-row lg:items-center lg:justify-between"><div><p class="text-xs font-bold uppercase tracking-wider text-blue-200">Langkah berikutnya</p><h2 class="mt-2 text-xl font-bold">Uji konteks, lalu baca sintesis sesi</h2><p class="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Bandingkan rasio dengan kandidat lain dan tinjau laporan lengkap sebelum menggunakan dossier ini sebagai bahan keputusan.</p></div><div class="flex flex-wrap gap-2"><router-link :to="`/research/${store.report.sessionId}/peers`" class="button-secondary">Ke pembanding <GitCompare class="h-4 w-4" /></router-link><router-link :to="`/research/${store.report.sessionId}/report`" class="button-primary">Baca laporan <ArrowRight class="h-4 w-4" /></router-link></div></section>
  </div>
</template>
