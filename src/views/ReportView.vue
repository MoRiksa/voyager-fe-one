<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import DataProvenance from '../components/DataProvenance.vue'
import ReportCandidateAnalysis from '../components/ReportCandidateAnalysis.vue'
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  Award, 
  Database, 
  Building2, 
  TrendingUp, 
  PieChart, 
  Check, 
  Copy, 
  Layers, 
  SlidersHorizontal,
  FileSpreadsheet,
  ChevronRight,
  Info
} from '@lucide/vue'

const store = useResearchStore()
const router = useRouter()

// View Mode: 'interactive' (Rich Dossier) or 'document' (Formal Printable Document)
const viewMode = ref<'interactive' | 'document'>('interactive')
const activeSection = ref('summary')
const selectedTicker = ref<string>(store.candidates[0]?.symbol || '')
const copySuccess = ref(false)
const copyError = ref('')
const exportBusy = ref('')
const exportError = ref('')
const reportSections = [
  { id: 'summary', label: 'Ringkasan' },
  { id: 'scope', label: 'Ruang lingkup' },
  { id: 'ranking', label: 'Ranking' },
  { id: 'candidates', label: 'Kandidat' },
  { id: 'peers', label: 'Pembanding' },
  { id: 'evidence', label: 'Bukti & metode' },
  { id: 'uncertainty', label: 'Ketidakpastian' }
]
const reportTabs = ref<HTMLButtonElement[]>([])

const analyticalHighlights = computed(() => store.candidates.slice(0, 3))
const hasReportData = computed(() => store.screeningFunnel.length > 0 || store.candidates.length > 0)
const evidenceSourceLabel = (source: string) => source.startsWith('Derived')
  ? `Turunan · ${source.split('/').pop()}`
  : `Fixture v1 · ${source.split('/').slice(-2).join('/')}`
const evidenceSources = computed(() => [...new Set(store.candidates.flatMap(candidate => candidate.evidenceCitations.map(citation => evidenceSourceLabel(citation.source))).filter(Boolean))])
const financialPeriods = computed(() => [...new Set(store.candidates.map(candidate => candidate.financialPeriod).filter(Boolean))].join(', '))
const priceDates = computed(() => [...new Set(store.candidates.map(candidate => candidate.priceAsOf).filter(Boolean))].join(', '))
const evidenceTiming = (citation: { period?: string; asOf?: string }) => [citation.period && `Periode: ${citation.period}`, citation.asOf && `Per tanggal: ${citation.asOf}`].filter(Boolean).join(' | ')
watch(() => store.report.sessionId, () => {
  selectedTicker.value = store.candidates[0]?.symbol || ''
  activeSection.value = 'summary'
})

const inspectCandidate = (symbol: string) => {
  selectedTicker.value = symbol
  activeSection.value = 'candidates'
}

const handleTabKeydown = (event: KeyboardEvent, index: number) => {
  let nextIndex: number | undefined
  if (event.key === 'ArrowRight') nextIndex = (index + 1) % reportSections.length
  else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + reportSections.length) % reportSections.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = reportSections.length - 1
  if (nextIndex === undefined) return

  event.preventDefault()
  activeSection.value = reportSections[nextIndex].id
  nextTick(() => reportTabs.value[nextIndex!]?.focus())
}

const handlePrint = async () => {
  exportBusy.value = 'PDF'
  exportError.value = ''
  try {
    viewMode.value = 'document'
    await nextTick()
    window.print()
  } catch {
    exportError.value = 'Laporan tidak dapat dibuka untuk dicetak. Coba lagi dari menu browser.'
  } finally {
    exportBusy.value = ''
  }
}

const handleCopySummary = async () => {
  const summaryText = `VOYAGER ONE — RINGKASAN RISET
Sesi: ${store.report.sessionId}
Periode keuangan: ${financialPeriods.value || 'Tidak tersedia'}
Harga per tanggal: ${priceDates.value || 'Tidak tersedia'}
Laporan dibuat: ${store.report.timestamp}
Tujuan: ${store.report.objective}

KANDIDAT TERATAS:
${store.candidates.map(c => `#${c.rank} ${c.symbol} (${c.name}) — Skor: ${c.qualityScore}/100 | ROE: ${c.roePercent}% | P/E: ${c.peRatio}x | FCF yield: ${c.freeCashFlowYieldPercent}%\nAlasan: ${c.whySelected}`).join('\n\n')}

CARA MEMBACA:
Skor 80+ memenuhi ambang shortlist. ROE mengukur laba terhadap modal; P/E harga terhadap laba; Debt/Equity utang terhadap modal; FCF yield kas bebas relatif terhadap nilai perusahaan. Rasio paling relevan dibandingkan dalam sektor yang sama.

RINGKASAN PERBANDINGAN:
${store.report.peerComparisonNotes}

KETERBATASAN:
${store.report.limitations.map(l => `- ${l}`).join('\n')}

KETIDAKPASTIAN DAN PROVENANCE:
${store.report.uncertaintyNotes}
`
  try {
    await navigator.clipboard.writeText(summaryText)
    copyError.value = ''
    copySuccess.value = true
    store.notify('Ringkasan riset disalin ke clipboard.', 'success')
    setTimeout(() => { copySuccess.value = false }, 2000)
  } catch {
    copyError.value = 'Ringkasan tidak dapat disalin. Periksa izin clipboard browser Anda.'
    store.notify(copyError.value, 'error')
  }
}

const handleExportMarkdown = async () => {
  exportBusy.value = 'Markdown'
  exportError.value = ''
  await nextTick()
  try {
    const content = `# Laporan Riset Finansial — Voyager One
**ID sesi:** ${store.report.sessionId}
**Dibuat pada:** ${store.report.timestamp}
**Periode keuangan:** ${financialPeriods.value || 'Tidak tersedia'}
**Harga per tanggal:** ${priceDates.value || 'Tidak tersedia'}
**Ruang lingkup:** ${store.report.universeSummary}
**Sumber data:** Prototype fixture v1 (${store.screeningFunnel[0]?.retainedSymbols.join(', ') || 'tidak ada'})
**Status:** ${store.status === 'COMPLETED' ? 'Selesai' : 'Hasil parsial'}

---

## Ringkasan dan tujuan riset
> "${store.report.objective}"

${store.report.methodologyOverview}

## Aturan penyaringan yang diterapkan
${store.activePlan.criteria.map(rule => `- ${rule}`).join('\n')}

---

## Perbandingan kandidat
| Peringkat | Ticker | Nama | Sektor | Skor | ROE | P/E | D/E | FCF yield | Penggerak DuPont utama |
|------|--------|------|--------|-------|-----|-----|-----|-----------|------------------------|
${store.candidates.map(c => `| #${c.rank} | **${c.symbol}** | ${c.name} | ${c.subsector} | **${c.qualityScore}/100** | ${c.roePercent}% | ${c.peRatio}x | ${c.debtToEquity}x | ${c.freeCashFlowYieldPercent}% | Net Margin (${c.dupontAnalysis.netProfitMargin}%) |`).join('\n')}

---

## Analisis kandidat

${store.candidates.map(c => `### #${c.rank} ${c.symbol} — ${c.name}
- **Skor kualitas:** ${c.qualityScore}/100
- **Sektor:** ${c.sector} (${c.subsector})
- **DuPont tiga tahap:** Net margin: ${c.dupontAnalysis.netProfitMargin}% × Asset turnover: ${c.dupontAnalysis.assetTurnover}x × Leverage: ${c.dupontAnalysis.equityMultiplier}x = **ROE terhitung ${c.dupontAnalysis.calculatedRoe}%**
- **Komponen skor:** Profitabilitas (${c.scoreBreakdown.profitability}/100), Solvabilitas (${c.scoreBreakdown.solvency}/100), Valuasi (${c.scoreBreakdown.valuation}/100), Pertumbuhan (${c.scoreBreakdown.growth}/100)
- **Alasan dipilih:** ${c.whySelected}

#### Kekuatan utama:
${c.keyStrengths.map(s => `- ${s}`).join('\n')}

#### Risiko dan ketidakpastian:
${c.potentialConcerns.map(r => `- ${r}`).join('\n')}

#### Data pendukung:
${c.evidenceCitations.map(e => `- **${e.metric}**: ${e.value} (Sumber: \`${evidenceSourceLabel(e.source)}\`)${evidenceTiming(e) ? ` — ${evidenceTiming(e)}` : ''} — ${e.context}`).join('\n')}
`).join('\n---\n\n')}

---

## Ringkasan lintas sektor
${store.report.peerComparisonNotes}

---

## Keterbatasan dan ketidakpastian
${store.report.limitations.map(l => `- ${l}`).join('\n')}

**Catatan ketidakpastian:** ${store.report.uncertaintyNotes}

## Bukti dan provenance
- **Dataset:** prototype-fixture-v1
- **Dihasilkan:** ${store.report.timestamp}
- **Sumber bukti:** ${evidenceSources.value.join(', ') || 'Tidak tersedia'}

---

## Pemberitahuan penggunaan
${store.report.disclaimer}
`
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `VoyagerOne-ExecutiveReport-${store.report.sessionId}.md`)
  link.click()
  URL.revokeObjectURL(url)
  store.notify('Laporan Markdown berhasil diunduh.', 'success')
  } catch {
    exportError.value = 'Laporan Markdown tidak dapat diunduh.'
    store.notify(exportError.value, 'error')
  } finally {
    exportBusy.value = ''
  }
}

const handleExportJson = async () => {
  exportBusy.value = 'JSON'
  exportError.value = ''
  await nextTick()
  try {
    const content = JSON.stringify({
    report: store.report,
    screeningFunnel: store.screeningFunnel,
    auditEvents: store.toolCalls,
     provenance: {
       sourceKind: 'prototype-fixture',
       datasetId: 'prototype-fixture-v1',
       inputSymbols: store.screeningFunnel[0]?.retainedSymbols || [],
       financialPeriods: financialPeriods.value ? financialPeriods.value.split(', ') : [],
       priceAsOf: priceDates.value ? priceDates.value.split(', ') : [],
       generatedAt: store.report.timestamp
     }
  }, null, 2)
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `VoyagerOne-Report-${store.report.sessionId}.json`)
  link.click()
  URL.revokeObjectURL(url)
  store.notify('Data laporan JSON berhasil diunduh.', 'success')
  } catch {
    exportError.value = 'Data JSON tidak dapat diunduh.'
    store.notify(exportError.value, 'error')
  } finally {
    exportBusy.value = ''
  }
}

const useAsTemplate = async () => {
  store.setObjective(store.currentObjective, store.activePresetId)
  await router.push('/research/new')
}
</script>

<template>
  <div class="page-shell space-y-7">
    <section v-if="!hasReportData" data-testid="results-pending" class="mx-auto flex min-h-[60dvh] max-w-2xl flex-col items-center justify-center text-center print:hidden">
      <div v-if="store.isExecuting" class="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#2F64A8]" role="progressbar" aria-label="Memproses"></div>
      <span class="section-kicker">{{ store.status === 'FAILED' ? 'Laporan belum lengkap' : 'Riset sedang berjalan' }}</span>
      <h1 class="mt-3 text-3xl font-bold tracking-tight text-slate-950">{{ store.status === 'FAILED' ? 'Laporan tidak berhasil diselesaikan' : 'Laporan sedang disusun' }}</h1>
      <p class="mt-3 max-w-xl text-sm leading-6 text-slate-600">{{ store.status === 'FAILED' ? 'Kembali ke ringkasan sesi untuk meninjau status proses.' : 'Ranking, analisis kandidat, risiko, dan keterbatasan akan tersedia setelah seluruh tahap selesai.' }}</p>
      <router-link :to="`/research/${store.report.sessionId}`" class="button-primary mt-6">Kembali ke progress riset</router-link>
    </section>
    <template v-else>
    <section v-if="store.status !== 'COMPLETED'" role="alert" class="rounded-2xl border p-4 text-sm print:border-slate-400 print:bg-white print:text-slate-900" :class="store.status === 'FAILED' ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-amber-200 bg-amber-50 text-amber-900'"><strong>{{ store.status === 'FAILED' ? 'Laporan gagal sebelum selesai.' : 'Laporan ini masih parsial.' }}</strong> Bagian yang tersedia tetap ditampilkan; cakupan, ranking, dan kesimpulan dapat berubah.</section>
    <!-- Top Action & View Switcher Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm print:hidden">
      <!-- Left: Session Context -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#407EC9]/10 text-[#2F64A8] flex items-center justify-center shrink-0">
          <FileSpreadsheet class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
             <h1 class="text-base font-bold text-slate-900 font-mono">Laporan riset</h1>
            <span class="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-mono font-bold text-emerald-700">
               {{ store.status === 'COMPLETED' ? 'SIAP DITINJAU' : 'HASIL PARSIAL' }}
            </span>
          </div>
          <p class="text-xs text-slate-500 font-mono">
             Sesi: {{ store.report.sessionId }} • {{ store.report.timestamp }}
          </p>
        </div>
      </div>

      <!-- Right: View Mode Toggle & Export Actions -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Mode Switcher -->
         <div class="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
             @click="viewMode = 'interactive'"
             :aria-pressed="viewMode === 'interactive'"
            class="button-compact"
            :class="viewMode === 'interactive' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'"
          >
             Interaktif
          </button>
          <button
             @click="viewMode = 'document'"
             :aria-pressed="viewMode === 'document'"
            class="button-compact"
            :class="viewMode === 'document' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'"
          >
             Dokumen A4
          </button>
        </div>

        <span class="text-slate-200">|</span>

        <!-- Copy Summary -->
        <button
          @click="handleCopySummary"
          class="button-compact bg-slate-100 text-slate-700 hover:bg-slate-200"
           title="Salin ringkasan riset"
        >
          <Check v-if="copySuccess" class="w-3.5 h-3.5 text-emerald-600" />
          <Copy v-else class="w-3.5 h-3.5" />
           <span>{{ copySuccess ? 'Tersalin' : 'Salin' }}</span>
        </button>

        <!-- Print PDF -->
        <button
          @click="handlePrint"
          :disabled="Boolean(exportBusy)"
          class="button-compact bg-[#2F64A8] text-white hover:bg-[#244F87] disabled:cursor-wait disabled:opacity-60"
        >
          <Printer class="w-3.5 h-3.5" />
           <span>{{ exportBusy === 'PDF' ? 'Menyiapkan…' : 'Unduh laporan' }}</span>
        </button>

        <details class="relative"><summary class="button-compact cursor-pointer list-none bg-slate-100 text-slate-700 hover:bg-slate-200"><Download class="h-3.5 w-3.5" /> Format lain</summary><div class="absolute right-0 z-20 mt-2 grid min-w-40 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"><button type="button" :disabled="Boolean(exportBusy)" class="button-compact justify-start text-slate-700 hover:bg-slate-100 disabled:opacity-50" @click="handleExportMarkdown">{{ exportBusy === 'Markdown' ? 'Menyiapkan…' : 'Markdown' }}</button><button type="button" :disabled="Boolean(exportBusy)" class="button-compact justify-start text-slate-700 hover:bg-slate-100 disabled:opacity-50" @click="handleExportJson">{{ exportBusy === 'JSON' ? 'Menyiapkan…' : 'JSON' }}</button></div></details>
      </div>
      <p v-if="copyError || exportError" role="alert" class="mt-3 text-sm font-medium text-rose-700">{{ copyError || exportError }}</p>
    </div>

    <nav v-if="viewMode === 'interactive'" class="sticky top-16 z-10 hidden items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-sm backdrop-blur-md sm:flex print:hidden" aria-label="Bagian laporan" role="tablist">
      <button v-for="(section, index) in reportSections" :id="`report-tab-${section.id}`" :key="section.id" :ref="element => { if (element) reportTabs[index] = element as HTMLButtonElement }" type="button" role="tab" :tabindex="activeSection === section.id ? 0 : -1" :aria-selected="activeSection === section.id" :aria-controls="activeSection === section.id ? `report-panel-${section.id}` : undefined" class="min-h-10 rounded-lg px-4 text-xs font-bold transition-colors" :class="activeSection === section.id ? 'bg-[#2F64A8] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'" @click="activeSection = section.id" @keydown="handleTabKeydown($event, index)">{{ section.label }}</button>
    </nav>
    <label v-if="viewMode === 'interactive'" class="block text-xs font-bold text-slate-700 sm:hidden print:hidden">Tampilkan bagian
      <select v-model="activeSection" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm">
        <option v-for="section in reportSections" :key="section.id" :value="section.id">{{ section.label }}</option>
      </select>
    </label>

    <!-- ========================================================================= -->
    <!-- MODE 1: INTERACTIVE EXECUTIVE DOSSIER (Rich Interactive View)            -->
    <!-- ========================================================================= -->
    <div v-if="viewMode === 'interactive'" class="space-y-8">
      <!-- 1. Executive Summary & Objective Card -->
      <div v-if="activeSection === 'summary'" id="report-panel-summary" role="tabpanel" aria-labelledby="report-tab-summary" class="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-[#2F64A8] mb-1.5">
              <ShieldCheck class="w-4 h-4" />
               Ringkasan riset
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
               Riset pasar modal Indonesia
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
               Hasil penyaringan dan analisis lima faktor terhadap dataset prototype.
            </p>
          </div>

          <!-- Metadata Stat Box -->
          <div class="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs">
            <div>
              <span class="text-xs text-slate-500 font-mono uppercase block">Ruang lingkup</span>
               <strong class="text-slate-800 font-mono">{{ store.screeningFunnel[0]?.count || 0 }} perusahaan</strong>
            </div>
            <span class="text-slate-300">•</span>
            <div>
              <span class="text-xs text-slate-500 font-mono uppercase block">Sumber</span>
              <strong class="text-[#2F64A8] font-mono">Fixture v1</strong>
            </div>
            <span class="text-slate-300">•</span>
            <div>
               <span class="text-[10px] text-slate-500 font-mono uppercase block">Status</span>
               <strong class="text-[#2F64A8] font-mono">{{ store.status === 'COMPLETED' ? 'Selesai' : 'Parsial' }}</strong>
            </div>
          </div>
        </div>

        <!-- Research Objective Highlight -->
        <div class="space-y-2">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
             Tujuan riset
          </p>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 font-medium leading-relaxed">
            "{{ store.report.objective }}"
          </div>
        </div>

        <!-- Key Analytical Highlights (3-Pillar Summary) -->
        <div v-if="analyticalHighlights.length" class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div v-for="(company, index) in analyticalHighlights" :key="company.symbol" class="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
            <div class="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <span class="flex h-5 w-5 items-center justify-center rounded-md bg-[#2F64A8] text-xs font-mono text-white">{{ index + 1 }}</span>
              <span>{{ company.symbol }} · skor {{ company.qualityScore }}</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">{{ company.whySelected }}</p>
          </div>
        </div>
      </div>

      <section v-if="activeSection === 'scope'" id="report-panel-scope" role="tabpanel" aria-labelledby="report-tab-scope" class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div><p class="section-kicker">Mandat riset</p><h2 class="mt-1 text-xl font-bold text-slate-950">Ruang lingkup dan aturan seleksi</h2></div>
        <dl class="grid gap-4 text-sm sm:grid-cols-2"><div class="rounded-xl bg-slate-50 p-4"><dt class="text-xs font-bold text-slate-500">Tujuan</dt><dd class="mt-2 leading-6 text-slate-800">{{ store.report.objective }}</dd></div><div class="rounded-xl bg-slate-50 p-4"><dt class="text-xs font-bold text-slate-500">Semesta data</dt><dd class="mt-2 leading-6 text-slate-800">{{ store.report.universeSummary }}</dd></div></dl>
        <div><h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">Kriteria yang diterapkan</h3><ol class="mt-3 space-y-2 text-sm text-slate-700"><li v-for="(criterion, index) in store.activePlan.criteria" :key="criterion" class="rounded-lg border border-slate-200 px-3 py-2"><span class="mr-2 font-mono font-bold text-[#2F64A8]">{{ index + 1 }}.</span>{{ criterion }}</li></ol></div>
      </section>

      <!-- 2. Master Comparison Matrix Table (Institutional Bloomberg Style) -->
      <div v-if="activeSection === 'ranking'" id="report-panel-ranking" role="tabpanel" aria-labelledby="report-tab-ranking" class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
              Perbandingan kandidat
            </h3>
            <span class="badge bg-slate-100 text-slate-600">
               {{ store.candidates.length }} kandidat
            </span>
          </div>
          <span class="text-xs text-slate-500 font-mono">Diurutkan berdasarkan skor kualitas</span>
        </div>
        <p data-testid="report-metric-guide" class="border-b border-slate-100 px-5 py-3 text-xs leading-5 text-slate-500">Skor 80+ memenuhi ambang kualitas. ROE = laba terhadap modal; P/E = harga terhadap laba; Debt/Equity = utang terhadap modal; CAGR = rata-rata pertumbuhan tahunan tiga tahun; FCF yield = kas bebas relatif terhadap nilai perusahaan. Bandingkan rasio terutama dalam sektor yang sama.</p>

        <div class="grid gap-3 p-4 md:hidden">
          <article v-for="c in store.candidates" :key="c.symbol" class="rounded-xl border border-slate-200 bg-white p-4" :class="selectedTicker === c.symbol ? 'border-[#2F64A8] bg-[#F4F8FD]' : ''">
            <div class="flex items-start justify-between gap-3">
              <div><p class="font-mono text-xs font-bold text-[#2F64A8]">#{{ c.rank }} · {{ c.symbol }}</p><h4 class="mt-1 text-sm font-bold text-slate-950">{{ c.name }}</h4><p class="mt-1 text-xs text-slate-500">{{ c.subsector }}</p></div>
              <span class="badge bg-[#2F64A8] text-white">{{ c.qualityScore }}/100</span>
            </div>
            <dl class="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
              <div><dt class="text-slate-500">ROE</dt><dd class="mt-1 font-mono font-bold text-slate-900">{{ c.roePercent }}%</dd></div>
              <div><dt class="text-slate-500">P/E</dt><dd class="mt-1 font-mono font-bold text-slate-900">{{ c.peRatio }}x</dd></div>
              <div><dt class="text-slate-500">Utang/modal</dt><dd class="mt-1 font-mono font-bold text-slate-900">{{ c.debtToEquity }}x</dd></div>
              <div><dt class="text-slate-500">FCF yield</dt><dd class="mt-1 font-mono font-bold text-slate-900">{{ c.freeCashFlowYieldPercent }}%</dd></div>
            </dl>
            <button type="button" class="button-secondary mt-3 w-full" @click="inspectCandidate(c.symbol)">Buka analisis kandidat</button>
          </article>
        </div>
         <div class="hidden overflow-x-auto md:block">
           <table class="data-table">
             <caption class="sr-only">Perbandingan kandidat riset berdasarkan skor dan metrik utama</caption>
            <thead>
              <tr class="bg-slate-50 text-slate-600 font-mono text-xs border-b border-slate-200">
                 <th scope="col" class="py-3 px-4 font-bold">RANK</th>
                 <th scope="col" class="py-3 px-4 font-bold">TICKER & COMPANY</th>
                 <th scope="col" class="text-left">SECTOR</th>
                 <th scope="col" class="text-center">QUALITY SCORE</th>
                 <th scope="col" class="text-right">ROE</th>
                 <th scope="col" class="text-right">P/E</th>
                 <th scope="col" class="text-right">DEBT/EQ</th>
                 <th scope="col" class="text-right">3Y REVENUE CAGR</th>
                 <th scope="col" class="text-right">FCF YIELD</th>
                 <th scope="col">PRIMARY DUPONT DRIVER</th>
                 <th scope="col" class="text-center">ACTION</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-mono">
              <tr 
                v-for="c in store.candidates" 
                :key="c.symbol"
                 class="hover:bg-[#407EC9]/5 transition-colors"
                :class="selectedTicker === c.symbol ? 'bg-[#407EC9]/10 font-bold' : ''"
              >
                <td class="py-3.5 px-4 font-bold text-slate-900">#{{ c.rank }}</td>
                <td class="py-3.5 px-4 font-sans">
                  <div class="font-bold text-slate-900 font-mono">{{ c.symbol }}</div>
                  <div class="text-[11px] text-slate-500 line-clamp-1">{{ c.name }}</div>
                </td>
                <td class="py-3.5 px-4 text-slate-600 font-sans">{{ c.subsector }}</td>
                <td class="py-3.5 px-4 text-center">
                   <span class="badge inline-block bg-[#2F64A8] text-white">
                    {{ c.qualityScore }}/100
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums">{{ c.roePercent }}%</td>
                <td class="py-3.5 px-4 text-right text-slate-700 tabular-nums">{{ c.peRatio }}x</td>
                <td class="py-3.5 px-4 text-right text-slate-700 tabular-nums">{{ c.debtToEquity }}x</td>
                <td class="py-3.5 px-4 text-right text-slate-700 tabular-nums">+{{ c.revenue3yCagrPercent }}%</td>
                <td class="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums">{{ c.freeCashFlowYieldPercent }}%</td>
                <td class="py-3.5 px-4 font-sans text-slate-600 text-[11px]">
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                    Margin: {{ c.dupontAnalysis.netProfitMargin }}%
                  </span>
                </td>
                <td class="py-3.5 px-4 text-center font-sans">
                   <button
                     type="button"
                     @click="inspectCandidate(c.symbol)"
                     :aria-pressed="selectedTicker === c.symbol"
                     class="button-compact text-[#2F64A8] hover:bg-[#2F64A8] hover:text-white"
                  >
                     Pilih
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. Interactive Deep-Dive Dossier Tab Section -->
      <ReportCandidateAnalysis
        v-if="activeSection === 'candidates'"
        v-model:selected-ticker="selectedTicker"
        :candidates="store.candidates"
        :session-id="store.report.sessionId"
      />

      <!-- 4. Macro & Comparative Peer Notes -->
      <div v-if="activeSection === 'peers'" id="report-panel-peers" role="tabpanel" aria-labelledby="report-tab-peers" class="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
          Konteks pembanding
        </h3>
        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {{ store.report.peerComparisonNotes }}
        </p>
      </div>

      <section v-if="activeSection === 'evidence'" id="report-panel-evidence" role="tabpanel" aria-labelledby="report-tab-evidence" class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div><p class="section-kicker">Jejak analisis</p><h2 class="mt-1 text-xl font-bold text-slate-950">Bukti dan metodologi</h2><p class="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{{ store.report.methodologyOverview }}</p></div>
        <div class="grid gap-3 sm:grid-cols-2"><article v-for="candidate in store.candidates" :key="candidate.symbol" class="rounded-xl border border-slate-200 p-4"><h3 class="font-mono text-sm font-bold text-slate-900">{{ candidate.symbol }}</h3><ul class="mt-3 space-y-2 text-xs text-slate-600"><li v-for="citation in candidate.evidenceCitations" :key="`${citation.source}-${citation.metric}`"><strong class="text-slate-800">{{ citation.metric }}: {{ citation.value }}</strong><span class="block">{{ citation.context }}</span><span class="block font-mono text-[10px] text-slate-500" :title="citation.source">{{ evidenceSourceLabel(citation.source) }}</span><span v-if="citation.period" class="block text-[10px] text-slate-500">Periode: {{ citation.period }}</span><span v-if="citation.asOf" class="block text-[10px] text-slate-500">Per tanggal: {{ citation.asOf }}</span></li></ul></article></div>
        <DataProvenance source="prototype-fixture-v1 dan metrik turunan sesi" :financial-period="financialPeriods || undefined" :price-as-of="priceDates || undefined" :generated-at="store.report.timestamp" />
      </section>

      <!-- 5. Limitations & Regulatory Disclaimer -->
      <div v-if="activeSection === 'uncertainty'" id="report-panel-uncertainty" role="tabpanel" aria-labelledby="report-tab-uncertainty" class="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
          Ketidakpastian, keterbatasan, dan provenance
        </h3>
        <p class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{{ store.report.uncertaintyNotes }}</p>
        <ul class="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
          <li v-for="(limitation, idx) in store.report.limitations" :key="idx">
            {{ limitation }}
          </li>
        </ul>

        <div class="mt-4 p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
          <strong>Pemberitahuan:</strong> {{ store.report.disclaimer }}
        </div>
        <DataProvenance source="prototype-fixture-v1 dan metrik turunan sesi" :financial-period="financialPeriods || undefined" :price-as-of="priceDates || undefined" :generated-at="store.report.timestamp" />
      </div>

      <section data-testid="report-next" class="grid gap-5 rounded-2xl bg-[#102138] p-6 text-white shadow-xl sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center print:hidden">
        <div><p class="text-xs font-bold uppercase tracking-wider text-blue-200">Riset selesai</p><h2 class="mt-2 text-xl font-bold">Laporan tersimpan di Pustaka Riset</h2><p class="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Kembali ke pustaka untuk membuka riset lain, atau gunakan tujuan ini sebagai template tanpa mengubah hasil yang sudah tersimpan.</p></div>
        <div class="flex flex-wrap gap-2"><router-link to="/research" class="button-primary bg-white text-[#1E4270] hover:bg-blue-50">Kembali ke pustaka <ChevronRight class="h-4 w-4" /></router-link><button type="button" data-testid="report-use-template" class="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-bold text-white hover:bg-white/10" @click="useAsTemplate"><Copy class="h-4 w-4" /> Gunakan sebagai template</button><router-link :to="`/research/${store.report.sessionId}/peers`" class="inline-flex min-h-11 items-center px-3 text-sm font-bold text-white">Kembali ke perbandingan</router-link></div>
      </section>
    </div>

    <!-- ========================================================================= -->
    <!-- MODE 2: PRINTABLE INSTITUTIONAL SHEET (A4 Structured White-Paper)         -->
    <!-- ========================================================================= -->
    <div v-else class="bg-white rounded-2xl border border-slate-300 p-8 sm:p-14 shadow-sm space-y-8 font-sans max-w-4xl mx-auto">
      <!-- Formal Document Header -->
      <div class="border-b-2 border-slate-900 pb-6 flex items-start justify-between gap-4">
        <div>
          <div class="text-[11px] font-mono font-bold uppercase text-slate-500 tracking-wider">
            Laporan riset pasar modal Indonesia
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Memorandum riset saham Indonesia
          </h1>
          <p class="text-xs text-slate-600 font-mono mt-1">
             ID sesi: {{ store.report.sessionId }} • Dibuat: {{ store.report.timestamp }}
          </p>
        </div>

        <div class="text-right font-mono text-xs text-slate-500 shrink-0">
          <div class="font-bold text-slate-900">VOYAGER.ONE</div>
          <div>Mesin analisis turunan</div>
        </div>
      </div>

      <!-- Objective Statement -->
      <div class="space-y-2">
        <h2 class="text-xs font-bold font-mono uppercase text-slate-900 tracking-wider">1. Mandat, tujuan, dan ruang lingkup</h2>
        <div class="p-3 bg-slate-50 border-l-4 border-[#407EC9] text-xs italic text-slate-800">
          "{{ store.report.objective }}"
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">
          {{ store.report.methodologyOverview }}
        </p>
        <p class="text-xs text-slate-600"><strong>Ruang lingkup:</strong> {{ store.report.universeSummary }}</p>
      </div>

      <!-- Recommendation Table -->
      <div class="space-y-2">
        <h2 class="text-xs font-bold font-mono uppercase text-slate-900 tracking-wider">2. Matriks peringkat lintas kandidat</h2>
         <table class="w-full text-left text-xs border border-slate-300 border-collapse">
          <caption class="sr-only">Matriks peringkat kandidat berdasarkan skor dan metrik keuangan utama</caption>
          <thead>
            <tr class="bg-slate-100 border-b border-slate-300 font-mono text-[11px]">
              <th scope="col" class="p-2 border-r border-slate-300">#</th>
              <th scope="col" class="p-2 border-r border-slate-300">Kode saham</th>
              <th scope="col" class="p-2 border-r border-slate-300">Perusahaan</th>
              <th scope="col" class="p-2 border-r border-slate-300 text-center">Skor</th>
              <th scope="col" class="p-2 border-r border-slate-300 text-right">ROE</th>
              <th scope="col" class="p-2 border-r border-slate-300 text-right">P/E</th>
              <th scope="col" class="p-2 border-r border-slate-300 text-right">D/E</th>
              <th scope="col" class="p-2 text-right">Imbal hasil FCF</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 font-mono">
            <tr v-for="c in store.candidates" :key="c.symbol">
              <th scope="row" class="p-2 border-r border-slate-200 font-bold">#{{ c.rank }}</th>
              <td class="p-2 border-r border-slate-200 font-bold text-[#2F64A8]">{{ c.symbol }}</td>
              <td class="p-2 border-r border-slate-200 font-sans">{{ c.name }}</td>
              <td class="p-2 border-r border-slate-200 text-center font-bold">{{ c.qualityScore }}/100</td>
              <td class="p-2 border-r border-slate-200 text-right">{{ c.roePercent }}%</td>
              <td class="p-2 border-r border-slate-200 text-right">{{ c.peRatio }}x</td>
              <td class="p-2 border-r border-slate-200 text-right">{{ c.debtToEquity }}x</td>
              <td class="p-2 text-right font-bold text-emerald-800">{{ c.freeCashFlowYieldPercent }}%</td>
            </tr>
          </tbody>
        </table>
        <p class="text-[11px] leading-5 text-slate-500">Cara membaca: skor 80+ memenuhi ambang shortlist. ROE mengukur laba terhadap modal; P/E harga terhadap laba; D/E utang terhadap modal; FCF yield kas bebas relatif terhadap nilai perusahaan. Rasio perlu dibandingkan dalam sektor yang sama.</p>
      </div>

      <!-- Candidate Profiles (Clean Print Layout) -->
      <div class="space-y-4">
        <h2 class="text-xs font-bold font-mono uppercase text-slate-900 tracking-wider">3. Tesis kandidat dan analisis DuPont</h2>
        
        <div v-for="c in store.candidates" :key="c.symbol" class="p-4 border border-slate-200 rounded-lg space-y-2 text-xs">
          <div class="flex justify-between items-center border-b border-slate-100 pb-2">
            <div class="font-bold text-slate-900 font-mono text-sm">
              #{{ c.rank }} {{ c.symbol }} — {{ c.name }} ({{ c.subsector }})
            </div>
            <span class="font-mono font-bold text-slate-900">Skor: {{ c.qualityScore }}/100</span>
          </div>

          <p class="text-slate-700 leading-relaxed">{{ c.whySelected }}</p>

          <div class="p-2 bg-slate-50 font-mono text-[11px] text-slate-700 rounded border border-slate-200">
            <strong>ROE DuPont ({{ c.roePercent }}%):</strong> Margin laba {{ c.dupontAnalysis.netProfitMargin }}% × Perputaran aset {{ c.dupontAnalysis.assetTurnover }}x × Leverage {{ c.dupontAnalysis.equityMultiplier }}x.
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <strong class="text-emerald-800">Kekuatan:</strong>
              <ul class="list-disc pl-4 text-slate-600">
                <li v-for="(s, idx) in c.keyStrengths" :key="idx">{{ s }}</li>
              </ul>
            </div>
            <div>
              <strong class="text-amber-800">Risiko:</strong>
              <ul class="list-disc pl-4 text-slate-600">
                <li v-for="(r, idx) in c.potentialConcerns" :key="idx">{{ r }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-3 border-t border-slate-300 pt-4 text-xs text-slate-600">
        <h2 class="font-bold font-mono uppercase text-slate-700 text-[11px]">4. Bukti, metodologi, dan asal-usul data</h2>
        <p>{{ store.report.methodologyOverview }}</p>
        <div v-for="c in store.candidates" :key="`evidence-${c.symbol}`"><strong>{{ c.symbol }}:</strong><ul class="mt-1 list-disc pl-4"><li v-for="citation in c.evidenceCitations" :key="`${c.symbol}-${citation.metric}`">{{ citation.metric }}: {{ citation.value }}. {{ citation.context }} Sumber: {{ evidenceSourceLabel(citation.source) }}<template v-if="citation.period">. Periode: {{ citation.period }}</template><template v-if="citation.asOf">. Per tanggal: {{ citation.asOf }}</template></li></ul></div>
        <p><strong>Sumber data:</strong> prototype-fixture-v1 dan metrik turunan sesi. <strong>Periode keuangan:</strong> {{ financialPeriods || 'tidak tersedia' }}. <strong>Harga per tanggal:</strong> {{ priceDates || 'tidak tersedia' }}. <strong>Laporan dibuat:</strong> {{ store.report.timestamp }}.</p>
      </div>

      <div class="space-y-3 border-t border-slate-300 pt-4 text-xs text-slate-600">
        <h2 class="font-bold font-mono uppercase text-slate-700 text-[11px]">5. Ketidakpastian, keterbatasan, dan pemberitahuan</h2>
        <p><strong>Ketidakpastian:</strong> {{ store.report.uncertaintyNotes }}</p>
        <ul class="list-disc space-y-1 pl-4"><li v-for="limitation in store.report.limitations" :key="limitation">{{ limitation }}</li></ul>
        <p><strong>Pemberitahuan:</strong> {{ store.report.disclaimer }}</p>
      </div>
    </div>
    </template>
  </div>
</template>
