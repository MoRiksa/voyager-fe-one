<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Building2, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Check, 
  Copy, 
  Layers, 
  SlidersHorizontal,
  FileSpreadsheet,
  ArrowUpRight,
  ChevronRight,
  Info
} from '@lucide/vue'

const store = useResearchStore()

// View Mode: 'interactive' (Rich Dossier) or 'document' (Formal Printable Document)
const viewMode = ref<'interactive' | 'document'>('interactive')
const selectedTicker = ref<string>(store.candidates[0]?.symbol || '')
const copySuccess = ref(false)
const copyError = ref('')
const reportSections = [
  { id: 'summary', label: 'Ringkasan' },
  { id: 'ranking', label: 'Ranking' },
  { id: 'candidates', label: 'Kandidat' },
  { id: 'risks', label: 'Risiko' }
]

const goToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

const activeCandidate = computed(() => {
  return store.candidates.find(c => c.symbol === selectedTicker.value) || store.candidates[0]
})
const analyticalHighlights = computed(() => store.candidates.slice(0, 3))
watch(() => store.report.sessionId, () => { selectedTicker.value = store.candidates[0]?.symbol || '' })

const handlePrint = () => {
  window.print()
}

const handleCopySummary = async () => {
  const summaryText = `VOYAGER ONE — RINGKASAN RISET
Sesi: ${store.report.sessionId} | ${store.report.timestamp}
Tujuan: ${store.report.objective}

KANDIDAT TERATAS:
${store.candidates.map(c => `#${c.rank} ${c.symbol} (${c.name}) — Skor: ${c.qualityScore}/100 | ROE: ${c.roePercent}% | P/E: ${c.peRatio}x | FCF yield: ${c.freeCashFlowYieldPercent}%\nAlasan: ${c.whySelected}`).join('\n\n')}

RINGKASAN PERBANDINGAN:
${store.report.peerComparisonNotes}

KETERBATASAN:
${store.report.limitations.map(l => `- ${l}`).join('\n')}
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

const handleExportMarkdown = () => {
  const content = `# Laporan Riset Finansial — Voyager One
**ID sesi:** ${store.report.sessionId}
**Dibuat pada:** ${store.report.timestamp}
**Ruang lingkup:** ${store.report.universeSummary}
**Tingkat keyakinan:** Tinggi

---

## Ringkasan dan tujuan riset
> "${store.report.objective}"

${store.report.methodologyOverview}

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
${c.evidenceCitations.map(e => `- **${e.metric}**: ${e.value} (Source: \`${e.source}\`) — ${e.context}`).join('\n')}
`).join('\n---\n\n')}

---

## Ringkasan lintas sektor
${store.report.peerComparisonNotes}

---

## Keterbatasan dan ketidakpastian
${store.report.limitations.map(l => `- ${l}`).join('\n')}

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
}

const handleExportJson = () => {
  const content = JSON.stringify(store.report, null, 2)
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `VoyagerOne-Report-${store.report.sessionId}.json`)
  link.click()
  URL.revokeObjectURL(url)
  store.notify('Data laporan JSON berhasil diunduh.', 'success')
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Top Action & View Switcher Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm print:hidden">
      <!-- Left: Session Context -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#407EC9]/10 text-[#407EC9] flex items-center justify-center shrink-0">
          <FileSpreadsheet class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
             <h1 class="text-base font-bold text-slate-900 font-mono">Laporan riset</h1>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
               SIAP DITINJAU
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
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            :class="viewMode === 'interactive' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'"
          >
             Interaktif
          </button>
          <button
             @click="viewMode = 'document'"
             :aria-pressed="viewMode === 'document'"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            :class="viewMode === 'document' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'"
          >
             Dokumen A4
          </button>
        </div>

        <span class="text-slate-200">|</span>

        <!-- Copy Summary -->
        <button
          @click="handleCopySummary"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
           title="Salin ringkasan riset"
        >
          <Check v-if="copySuccess" class="w-3.5 h-3.5 text-emerald-600" />
          <Copy v-else class="w-3.5 h-3.5" />
           <span>{{ copySuccess ? 'Tersalin' : 'Salin' }}</span>
        </button>

        <!-- Print PDF -->
        <button
          @click="handlePrint"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <Printer class="w-3.5 h-3.5" />
           <span>Unduh laporan</span>
        </button>

        <!-- Export Markdown -->
        <button
          @click="handleExportMarkdown"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <Download class="w-3.5 h-3.5" />
          <span>Markdown</span>
        </button>

        <!-- Export JSON -->
        <button
          @click="handleExportJson"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#407EC9] hover:bg-[#2F64A8] rounded-xl transition-colors cursor-pointer shadow-2xs"
        >
          <Download class="w-3.5 h-3.5" />
          <span>JSON</span>
        </button>
      </div>
      <p v-if="copyError" role="alert" class="mt-3 text-sm font-medium text-rose-700">{{ copyError }}</p>
    </div>

    <nav v-if="viewMode === 'interactive'" class="sticky top-16 z-10 hidden items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-sm backdrop-blur-md sm:flex print:hidden" aria-label="Bagian laporan">
      <button v-for="section in reportSections" :key="section.id" type="button" class="min-h-10 rounded-lg px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950" @click="goToSection(section.id)">{{ section.label }}</button>
    </nav>
    <label v-if="viewMode === 'interactive'" class="block text-xs font-bold text-slate-700 sm:hidden print:hidden">Lompat ke bagian
      <select class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" @change="goToSection(($event.target as HTMLSelectElement).value)">
        <option v-for="section in reportSections" :key="section.id" :value="section.id">{{ section.label }}</option>
      </select>
    </label>

    <!-- ========================================================================= -->
    <!-- MODE 1: INTERACTIVE EXECUTIVE DOSSIER (Rich Interactive View)            -->
    <!-- ========================================================================= -->
    <div v-if="viewMode === 'interactive'" class="space-y-8">
      <!-- 1. Executive Summary & Objective Card -->
      <div id="summary" class="scroll-mt-36 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-[#407EC9] mb-1.5">
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
              <span class="text-xs text-slate-500 font-mono uppercase block">Keyakinan</span>
              <strong class="text-emerald-600 font-mono">Tinggi</strong>
            </div>
            <span class="text-slate-300">•</span>
            <div>
               <span class="text-[10px] text-slate-500 font-mono uppercase block">Status</span>
               <strong class="text-[#407EC9] font-mono">Selesai</strong>
            </div>
          </div>
        </div>

        <!-- Research Objective Highlight -->
        <div class="space-y-2">
          <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Tujuan riset
          </label>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 font-medium leading-relaxed">
            "{{ store.report.objective }}"
          </div>
        </div>

        <!-- Key Analytical Highlights (3-Pillar Summary) -->
        <div v-if="analyticalHighlights.length" class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div v-for="(company, index) in analyticalHighlights" :key="company.symbol" class="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
            <div class="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <span class="w-5 h-5 rounded-md bg-[#407EC9] text-white flex items-center justify-center text-[10px] font-mono">{{ index + 1 }}</span>
              <span>{{ company.symbol }} · skor {{ company.qualityScore }}</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">{{ company.whySelected }}</p>
          </div>
        </div>
      </div>

      <!-- 2. Master Comparison Matrix Table (Institutional Bloomberg Style) -->
      <div id="ranking" class="scroll-mt-36 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
              Perbandingan kandidat
            </h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
               {{ store.candidates.length }} kandidat
            </span>
          </div>
          <span class="text-xs text-slate-500 font-mono">Diurutkan berdasarkan skor kualitas</span>
        </div>

         <div class="overflow-x-auto">
           <table class="w-full text-left text-xs border-collapse">
             <caption class="sr-only">Perbandingan kandidat riset berdasarkan skor dan metrik utama</caption>
            <thead>
              <tr class="bg-slate-50 text-slate-500 font-mono text-[11px] border-b border-slate-200">
                 <th scope="col" class="py-3 px-4 font-bold">RANK</th>
                 <th scope="col" class="py-3 px-4 font-bold">TICKER & COMPANY</th>
                <th class="py-3 px-4 font-bold">SECTOR</th>
                <th class="py-3 px-4 font-bold text-center">QUALITY SCORE</th>
                <th class="py-3 px-4 font-bold text-right">ROE</th>
                <th class="py-3 px-4 font-bold text-right">P/E</th>
                <th class="py-3 px-4 font-bold text-right">DEBT/EQ</th>
                <th class="py-3 px-4 font-bold text-right">3Y CAGR</th>
                <th class="py-3 px-4 font-bold text-right">FCF YIELD</th>
                <th class="py-3 px-4 font-bold">PRIMARY DUPONT DRIVER</th>
                <th class="py-3 px-4 font-bold text-center">ACTION</th>
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
                  <span class="inline-block px-2 py-1 rounded-md bg-[#407EC9] text-white font-bold text-xs">
                    {{ c.qualityScore }}/100
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums">{{ c.roePercent }}%</td>
                <td class="py-3.5 px-4 text-right text-slate-700 tabular-nums">{{ c.peRatio }}x</td>
                <td class="py-3.5 px-4 text-right text-slate-700 tabular-nums">{{ c.debtToEquity }}x</td>
                <td class="py-3.5 px-4 text-right text-slate-700 tabular-nums">+{{ c.revenue3yCagrPercent }}%</td>
                <td class="py-3.5 px-4 text-right font-bold text-emerald-700 tabular-nums">{{ c.freeCashFlowYieldPercent }}%</td>
                <td class="py-3.5 px-4 font-sans text-slate-600 text-[11px]">
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                    Margin: {{ c.dupontAnalysis.netProfitMargin }}%
                  </span>
                </td>
                <td class="py-3.5 px-4 text-center font-sans">
                   <button
                     type="button"
                     @click="selectedTicker = c.symbol"
                     :aria-pressed="selectedTicker === c.symbol"
                     class="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#407EC9] hover:bg-[#407EC9] hover:text-white transition-colors cursor-pointer"
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
      <div v-if="activeCandidate" id="candidates" class="scroll-mt-36 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div class="text-[11px] font-bold uppercase tracking-wider text-[#407EC9] font-mono">
              Analisis mendalam
            </div>
            <h3 class="text-lg font-bold text-slate-900">
              Kandidat: <span class="font-mono text-[#407EC9]">{{ activeCandidate.symbol }}</span> ({{ activeCandidate.name }})
            </h3>
            <router-link :to="`/research/${store.report.sessionId}/company/${activeCandidate.symbol}`" class="text-link mt-2 inline-flex">Buka halaman perusahaan <ArrowUpRight class="h-4 w-4" /></router-link>
          </div>

          <!-- Horizontal Candidate Ticker Tabs -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              v-for="c in store.candidates"
              :key="c.symbol"
               @click="selectedTicker = c.symbol"
               :aria-pressed="selectedTicker === c.symbol"
              class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              :class="selectedTicker === c.symbol 
                ? 'bg-[#407EC9] text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            >
              <span>#{{ c.rank }}</span>
              <span>{{ c.symbol }}</span>
            </button>
          </div>
        </div>

        <!-- Active Candidate Content -->
        <div class="space-y-6">
          <!-- 4-Stat Strip -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
              <span class="text-xs font-mono uppercase text-slate-500 font-semibold">Skor kualitas</span>
              <p class="text-xl font-bold font-mono text-[#407EC9] mt-0.5">{{ activeCandidate.qualityScore }}<span class="text-xs text-slate-400">/100</span></p>
            </div>
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
              <span class="text-[10px] font-mono uppercase text-slate-400 font-semibold">Return on Equity</span>
              <p class="text-xl font-bold font-mono text-slate-900 mt-0.5">{{ activeCandidate.roePercent }}%</p>
            </div>
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
              <span class="text-[10px] font-mono uppercase text-slate-400 font-semibold">Valuation (P/E)</span>
              <p class="text-xl font-bold font-mono text-slate-900 mt-0.5">{{ activeCandidate.peRatio }}x</p>
            </div>
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
              <span class="text-[10px] font-mono uppercase text-slate-400 font-semibold">Free Cash Flow Yield</span>
              <p class="text-xl font-bold font-mono text-emerald-700 mt-0.5">{{ activeCandidate.freeCashFlowYieldPercent }}%</p>
            </div>
          </div>

          <!-- 3-Stage DuPont ROE Decomposition Visualizer -->
          <div class="p-5 rounded-2xl bg-[#407EC9]/5 border border-[#407EC9]/20 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <BarChart3 class="w-4 h-4 text-[#407EC9]" />
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  3-Stage DuPont ROE Decomposition Engine
                </h4>
              </div>
              <span class="text-xs font-mono font-bold text-[#407EC9]">
                ROE terhitung: {{ activeCandidate.dupontAnalysis.calculatedRoe }}%
              </span>
            </div>

            <!-- Formula Chain Visualizer -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
              <div class="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span class="text-[10px] uppercase font-mono text-slate-400 font-bold block">1. Net Margin</span>
                <p class="text-base font-bold font-mono text-slate-900 mt-0.5">{{ activeCandidate.dupontAnalysis.netProfitMargin }}%</p>
                <span class="text-[10px] text-slate-500">Operating Profitability</span>
              </div>

              <div class="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span class="text-[10px] uppercase font-mono text-slate-400 font-bold block">2. Asset Turnover</span>
                <p class="text-base font-bold font-mono text-slate-900 mt-0.5">{{ activeCandidate.dupontAnalysis.assetTurnover }}x</p>
                <span class="text-[10px] text-slate-500">Asset Efficiency</span>
              </div>

              <div class="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span class="text-[10px] uppercase font-mono text-slate-400 font-bold block">3. Equity Multiplier</span>
                <p class="text-base font-bold font-mono text-slate-900 mt-0.5">{{ activeCandidate.dupontAnalysis.equityMultiplier }}x</p>
                <span class="text-[10px] text-slate-500">Financial Leverage</span>
              </div>

              <div class="p-3 rounded-xl bg-[#407EC9] text-white shadow-2xs">
                <span class="text-[10px] uppercase font-mono text-white/80 font-bold block">= Calculated ROE</span>
                <p class="text-base font-bold font-mono text-white mt-0.5">{{ activeCandidate.dupontAnalysis.calculatedRoe }}%</p>
                <span class="text-[10px] text-white/80">Compound Return</span>
              </div>
            </div>
          </div>

          <!-- 5-Factor Scoring Meters -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Lima faktor penilaian (skala 0-100)
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                <div class="flex justify-between text-xs">
                  <span class="text-slate-600 font-medium">Profitability & ROIC (25% Weight)</span>
                  <span class="font-mono font-bold text-slate-900">{{ activeCandidate.scoreBreakdown.profitability }}/100</span>
                </div>
                <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-[#407EC9] rounded-full" :style="{ width: `${activeCandidate.scoreBreakdown.profitability}%` }"></div>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                <div class="flex justify-between text-xs">
                  <span class="text-slate-600 font-medium">Solvency & Debt Health (20% Weight)</span>
                  <span class="font-mono font-bold text-slate-900">{{ activeCandidate.scoreBreakdown.solvency }}/100</span>
                </div>
                <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-600 rounded-full" :style="{ width: `${activeCandidate.scoreBreakdown.solvency}%` }"></div>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                <div class="flex justify-between text-xs">
                  <span class="text-slate-600 font-medium">Valuation Multiple (20% Weight)</span>
                  <span class="font-mono font-bold text-slate-900">{{ activeCandidate.scoreBreakdown.valuation }}/100</span>
                </div>
                <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-500 rounded-full" :style="{ width: `${activeCandidate.scoreBreakdown.valuation}%` }"></div>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                <div class="flex justify-between text-xs">
                  <span class="text-slate-600 font-medium">Growth Consistency (25% Weight)</span>
                  <span class="font-mono font-bold text-slate-900">{{ activeCandidate.scoreBreakdown.growth }}/100</span>
                </div>
                <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-indigo-500 rounded-full" :style="{ width: `${activeCandidate.scoreBreakdown.growth}%` }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Why Selected & Strengths / Concerns -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Alasan pemilihan dan risiko
            </h4>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
              <strong>Core Thesis:</strong> {{ activeCandidate.whySelected }}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Strengths -->
              <div class="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-2">
                <span class="text-xs font-bold text-emerald-900 uppercase font-mono flex items-center gap-1.5">
                  <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
                  Key Competitive Advantages (Moat)
                </span>
                <ul class="space-y-1.5 text-xs text-slate-700">
                  <li v-for="(s, idx) in activeCandidate.keyStrengths" :key="idx" class="flex items-start gap-1.5">
                    <span class="text-emerald-600 font-bold">•</span>
                    <span>{{ s }}</span>
                  </li>
                </ul>
              </div>

              <!-- Concerns -->
              <div class="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-2">
                <span class="text-xs font-bold text-amber-900 uppercase font-mono flex items-center gap-1.5">
                  <AlertTriangle class="w-3.5 h-3.5 text-amber-600" />
                  Potential Downside & Watch Items
                </span>
                <ul class="space-y-1.5 text-xs text-slate-700">
                  <li v-for="(c, idx) in activeCandidate.potentialConcerns" :key="idx" class="flex items-start gap-1.5">
                    <span class="text-amber-600 font-bold">•</span>
                    <span>{{ c }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Evidence Citations Strip -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Data pendukung
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
              <div 
                v-for="(citation, idx) in activeCandidate.evidenceCitations" 
                :key="idx"
                class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-2"
              >
                <div>
                  <div class="font-bold text-slate-800">{{ citation.metric }}: <span class="text-[#407EC9]">{{ citation.value }}</span></div>
                  <div class="text-[10px] text-slate-500 font-sans mt-0.5">{{ citation.context }}</div>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono shrink-0">
                  {{ citation.source }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><h2 class="font-bold text-slate-900">Tidak ada kandidat dalam laporan ini</h2><p class="mt-2 text-sm text-slate-600">Tidak ada perusahaan pada dataset prototype yang memenuhi seluruh kriteria.</p></div>

      <!-- 4. Macro & Comparative Peer Notes -->
      <div class="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
          Ringkasan lintas sektor
        </h3>
        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {{ store.report.peerComparisonNotes }}
        </p>
      </div>

      <!-- 5. Limitations & Regulatory Disclaimer -->
      <div id="risks" class="scroll-mt-36 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
          Keterbatasan dan pemberitahuan penggunaan
        </h3>
        <ul class="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
          <li v-for="(limitation, idx) in store.report.limitations" :key="idx">
            {{ limitation }}
          </li>
        </ul>

        <div class="mt-4 p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
          <strong>Pemberitahuan:</strong> {{ store.report.disclaimer }}
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODE 2: PRINTABLE INSTITUTIONAL SHEET (A4 Structured White-Paper)         -->
    <!-- ========================================================================= -->
    <div v-else class="bg-white rounded-2xl border border-slate-300 p-8 sm:p-14 shadow-sm space-y-8 font-sans max-w-4xl mx-auto">
      <!-- Formal Document Header -->
      <div class="border-b-2 border-slate-900 pb-6 flex items-start justify-between gap-4">
        <div>
          <div class="text-[11px] font-mono font-bold uppercase text-slate-500 tracking-wider">
            Sectors Hackathon 2026 • AI Autonomous Research Agent
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Indonesian Equities Research Memorandum
          </h1>
          <p class="text-xs text-slate-600 font-mono mt-1">
            Session ID: {{ store.report.sessionId }} • Generated: {{ store.report.timestamp }}
          </p>
        </div>

        <div class="text-right font-mono text-xs text-slate-500 shrink-0">
          <div class="font-bold text-slate-900">VOYAGER.ONE</div>
          <div>Derived Intelligence Engine</div>
        </div>
      </div>

      <!-- Objective Statement -->
      <div class="space-y-2">
        <h2 class="text-xs font-bold font-mono uppercase text-slate-900 tracking-wider">1. Mandate & Objective</h2>
        <div class="p-3 bg-slate-50 border-l-4 border-[#407EC9] text-xs italic text-slate-800">
          "{{ store.report.objective }}"
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">
          {{ store.report.methodologyOverview }}
        </p>
      </div>

      <!-- Recommendation Table -->
      <div class="space-y-2">
        <h2 class="text-xs font-bold font-mono uppercase text-slate-900 tracking-wider">2. Cross-Sectional Ranking Matrix</h2>
        <table class="w-full text-left text-xs border border-slate-300 border-collapse">
          <thead>
            <tr class="bg-slate-100 border-b border-slate-300 font-mono text-[11px]">
              <th class="p-2 border-r border-slate-300">#</th>
              <th class="p-2 border-r border-slate-300">Ticker</th>
              <th class="p-2 border-r border-slate-300">Company</th>
              <th class="p-2 border-r border-slate-300 text-center">Score</th>
              <th class="p-2 border-r border-slate-300 text-right">ROE</th>
              <th class="p-2 border-r border-slate-300 text-right">P/E</th>
              <th class="p-2 border-r border-slate-300 text-right">D/E</th>
              <th class="p-2 text-right">FCF Yield</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 font-mono">
            <tr v-for="c in store.candidates" :key="c.symbol">
              <td class="p-2 border-r border-slate-200 font-bold">#{{ c.rank }}</td>
              <td class="p-2 border-r border-slate-200 font-bold text-[#407EC9]">{{ c.symbol }}</td>
              <td class="p-2 border-r border-slate-200 font-sans">{{ c.name }}</td>
              <td class="p-2 border-r border-slate-200 text-center font-bold">{{ c.qualityScore }}/100</td>
              <td class="p-2 border-r border-slate-200 text-right">{{ c.roePercent }}%</td>
              <td class="p-2 border-r border-slate-200 text-right">{{ c.peRatio }}x</td>
              <td class="p-2 border-r border-slate-200 text-right">{{ c.debtToEquity }}x</td>
              <td class="p-2 text-right font-bold text-emerald-800">{{ c.freeCashFlowYieldPercent }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Candidate Profiles (Clean Print Layout) -->
      <div class="space-y-4">
        <h2 class="text-xs font-bold font-mono uppercase text-slate-900 tracking-wider">3. Candidate Theses & DuPont Analysis</h2>
        
        <div v-for="c in store.candidates" :key="c.symbol" class="p-4 border border-slate-200 rounded-lg space-y-2 text-xs">
          <div class="flex justify-between items-center border-b border-slate-100 pb-2">
            <div class="font-bold text-slate-900 font-mono text-sm">
              #{{ c.rank }} {{ c.symbol }} — {{ c.name }} ({{ c.subsector }})
            </div>
            <span class="font-mono font-bold text-slate-900">Score: {{ c.qualityScore }}/100</span>
          </div>

          <p class="text-slate-700 leading-relaxed">{{ c.whySelected }}</p>

          <div class="p-2 bg-slate-50 font-mono text-[11px] text-slate-700 rounded border border-slate-200">
            <strong>DuPont ROE ({{ c.roePercent }}%):</strong> Net Margin {{ c.dupontAnalysis.netProfitMargin }}% × Asset Turnover {{ c.dupontAnalysis.assetTurnover }}x × Leverage {{ c.dupontAnalysis.equityMultiplier }}x.
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <strong class="text-emerald-800">Strengths:</strong>
              <ul class="list-disc pl-4 text-slate-600">
                <li v-for="(s, idx) in c.keyStrengths" :key="idx">{{ s }}</li>
              </ul>
            </div>
            <div>
              <strong class="text-amber-800">Risks:</strong>
              <ul class="list-disc pl-4 text-slate-600">
                <li v-for="(r, idx) in c.potentialConcerns" :key="idx">{{ r }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Limitations & Sign-off -->
      <div class="pt-4 border-t border-slate-300 space-y-2 text-xs text-slate-500">
        <h2 class="font-bold font-mono uppercase text-slate-700 text-[11px]">4. Disclaimers & Regulatory Notice</h2>
        <p>{{ store.report.disclaimer }}</p>
      </div>
    </div>
  </div>
</template>
