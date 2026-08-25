<script setup lang="ts">
import { useResearchStore } from '../stores/researchStore'
import { 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  AlertTriangle,
  Database,
  Building2
} from 'lucide-vue-next'

const store = useResearchStore()

const handlePrint = () => {
  window.print()
}

const handleExportMarkdown = () => {
  const content = `# Autonomous Financial Research Report — Voyager One
**Session ID:** ${store.report.sessionId}
**Generated at:** ${store.report.timestamp}
**Objective:** ${store.report.objective}

## 1. Methodology & Universe
${store.report.methodologyOverview}
- Universe: ${store.report.universeSummary}

## 2. Top Ranked Candidates
${store.candidates.map(c => `### ${c.rank}. ${c.symbol} — ${c.name} (Quality Score: ${c.qualityScore}/100)
- **Sector:** ${c.sector} (${c.subsector})
- **ROE:** ${c.roePercent}% | **P/E:** ${c.peRatio}x | **Debt/Equity:** ${c.debtToEquity}x | **FCF Yield:** ${c.freeCashFlowYieldPercent}%
- **Why Selected:** ${c.whySelected}
- **Key Strengths:** ${c.keyStrengths.join('; ')}
- **Potential Concerns:** ${c.potentialConcerns.join('; ')}
`).join('\n')}

## 3. Comparative Synthesis
${store.report.peerComparisonNotes}

## 4. Limitations & Uncertainty
${store.report.limitations.map(l => `- ${l}`).join('\n')}

## 5. Compliance Disclaimer
${store.report.disclaimer}
`
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `VoyagerOne-Report-${store.report.sessionId}.md`)
  link.click()
}

const handleExportJson = () => {
  const content = JSON.stringify(store.report, null, 2)
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `VoyagerOne-Report-${store.report.sessionId}.json`)
  link.click()
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Action Bar -->
    <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
      <div>
        <span class="text-xs font-mono text-slate-500">Session ID: {{ store.report.sessionId }}</span>
        <h2 class="text-sm font-bold text-slate-900">Executive Research Dossier</h2>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="handlePrint"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <Printer class="w-3.5 h-3.5" />
          <span>Print / PDF</span>
        </button>

        <button
          @click="handleExportMarkdown"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <Download class="w-3.5 h-3.5" />
          <span>Markdown</span>
        </button>

        <button
          @click="handleExportJson"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#407EC9] hover:bg-[#2F64A8] rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <Download class="w-3.5 h-3.5" />
          <span>JSON</span>
        </button>
      </div>
    </div>

    <!-- Printable Formal Report Paper -->
    <div class="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
      <!-- Report Header -->
      <div class="border-b border-slate-200 pb-6">
        <div class="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
          <span>VOYAGER ONE • AUTONOMOUS FINANCIAL RESEARCH AGENT</span>
          <span>{{ store.report.timestamp }}</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Executive Research Report: Indonesian Market Intelligence
        </h1>
        <p class="text-sm font-medium text-[#407EC9] font-mono mt-1">
          Session ID: {{ store.report.sessionId }} • Sectors Hackathon 2026
        </p>
      </div>

      <!-- 1. Objective & Methodology -->
      <div class="space-y-3">
        <h2 class="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">1. Research Objective & Scope</h2>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 italic">
          "{{ store.report.objective }}"
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">
          {{ store.report.methodologyOverview }}
        </p>
      </div>

      <!-- 2. Ranked Candidates Dossiers -->
      <div class="space-y-6">
        <h2 class="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">2. Top Candidates Analysis & Derived Rankings</h2>

        <div 
          v-for="candidate in store.candidates"
          :key="candidate.symbol"
          class="p-6 rounded-xl border border-slate-200 bg-slate-50/40 space-y-4"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                  #{{ candidate.rank }}
                </span>
                <h3 class="text-lg font-bold font-mono text-slate-900">{{ candidate.symbol }} — {{ candidate.name }}</h3>
              </div>
              <span class="text-xs text-slate-500 font-medium">{{ candidate.sector }} • {{ candidate.subsector }}</span>
            </div>

            <div class="text-right">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#407EC9] text-white font-mono font-bold text-xs">
                Quality Score: {{ candidate.qualityScore }}/100
              </span>
            </div>
          </div>

          <!-- Financial Summary Strip -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-white rounded-lg border border-slate-200 text-center text-xs font-mono">
            <div>
              <span class="text-[10px] text-slate-400 uppercase">ROE</span>
              <p class="font-bold text-slate-900">{{ candidate.roePercent }}%</p>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase">P/E Multiple</span>
              <p class="font-bold text-slate-900">{{ candidate.peRatio }}x</p>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase">Debt/Equity</span>
              <p class="font-bold text-slate-900">{{ candidate.debtToEquity }}x</p>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase">3Y Rev CAGR</span>
              <p class="font-bold text-slate-900">+{{ candidate.revenue3yCagrPercent }}%</p>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase">FCF Yield</span>
              <p class="font-bold text-emerald-700">{{ candidate.freeCashFlowYieldPercent }}%</p>
            </div>
          </div>

          <!-- Why Selected -->
          <div>
            <h4 class="text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Research Selection Rationale:</h4>
            <p class="text-xs text-slate-600 leading-relaxed">{{ candidate.whySelected }}</p>
          </div>

          <!-- Strengths vs Concerns -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/60">
              <span class="font-bold text-emerald-800 block mb-1">Key Strengths:</span>
              <ul class="space-y-1 text-slate-700">
                <li v-for="(s, idx) in candidate.keyStrengths" :key="idx">• {{ s }}</li>
              </ul>
            </div>
            <div class="p-3 bg-amber-50/50 rounded-lg border border-amber-200/60">
              <span class="font-bold text-amber-800 block mb-1">Risk Flags:</span>
              <ul class="space-y-1 text-slate-700">
                <li v-for="(c, idx) in candidate.potentialConcerns" :key="idx">• {{ c }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Limitations & Uncertainty -->
      <div class="space-y-2 pt-4 border-t border-slate-200">
        <h2 class="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">3. Limitations & Uncertainty</h2>
        <ul class="text-xs text-slate-600 space-y-1">
          <li v-for="(limitation, idx) in store.report.limitations" :key="idx">
            • {{ limitation }}
          </li>
        </ul>
      </div>

      <!-- 4. Regulatory Disclaimer -->
      <div class="p-4 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
        <strong>Compliance Notice:</strong> {{ store.report.disclaimer }}
      </div>
    </div>
  </div>
</template>
