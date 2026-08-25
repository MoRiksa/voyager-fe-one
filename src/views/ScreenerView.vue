<script setup lang="ts">
import { useResearchStore } from '../stores/researchStore'
import { 
  Filter, 
  ChevronRight, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowDown, 
  SlidersHorizontal,
  Building2,
  TrendingUp,
  Database
} from 'lucide-vue-next'

const store = useResearchStore()
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- View Header -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-xs font-bold uppercase tracking-wider text-[#407EC9] font-mono">Pillar 2: Autonomous Screener</span>
        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
          Universe Funnel Engine
        </span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
        Multi-Stage Universe Narrowing
      </h1>
      <p class="text-sm text-slate-600 mt-1 max-w-3xl">
        The Autonomous Screener progressively narrows 900+ Indonesian listed companies down to a high-conviction shortlist using objective-derived quantitative hurdles without requiring manual ticker selection.
      </p>
    </div>

    <!-- Funnel Breakdown Stages -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div 
        v-for="(step, idx) in store.screeningFunnel"
        :key="step.stage"
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold flex items-center justify-center">
              0{{ idx + 1 }}
            </span>
            <span class="text-[10px] font-mono font-bold text-[#407EC9] bg-[#407EC9]/10 px-2 py-0.5 rounded">
              {{ ((step.count / 914) * 100).toFixed(1) }}% Retained
            </span>
          </div>

          <h3 class="text-sm font-bold text-slate-900">{{ step.stage }}</h3>
          <div class="text-2xl font-mono font-bold text-slate-900 my-2 tabular-nums">
            {{ step.count.toLocaleString() }}
            <span class="text-xs font-sans text-slate-400 font-normal">tickers</span>
          </div>

          <p class="text-xs text-slate-500 leading-relaxed">{{ step.description }}</p>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100">
          <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Filter Applied:</span>
          <span class="text-[11px] font-mono font-medium text-slate-700 bg-slate-50 p-1.5 rounded block border border-slate-200/60 truncate">
            {{ step.filterCriteria }}
          </span>
        </div>
      </div>
    </div>

    <!-- Shortlisted Companies Preview Table -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 class="text-lg font-bold text-slate-900">Validated Screening Shortlist</h3>
          <p class="text-xs text-slate-500 mt-0.5">Top companies advancing to Pillar 3 (Deep Research Engine)</p>
        </div>
        <div class="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Source: Sectors API /companies/ratios
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-200 text-slate-400 uppercase font-mono font-semibold">
              <th class="pb-3 pr-4">Rank</th>
              <th class="pb-3 pr-4">Symbol</th>
              <th class="pb-3 pr-4">Sector</th>
              <th class="pb-3 pr-4 text-right">Market Cap</th>
              <th class="pb-3 pr-4 text-right">ROE</th>
              <th class="pb-3 pr-4 text-right">P/E Ratio</th>
              <th class="pb-3 pr-4 text-right">Debt/Equity</th>
              <th class="pb-3 pr-4 text-right">FCF Yield</th>
              <th class="pb-3 text-right">Quality Score</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-mono">
            <tr 
              v-for="candidate in store.candidates"
              :key="candidate.symbol"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="py-3.5 pr-4 font-bold text-slate-900">#{{ candidate.rank }}</td>
              <td class="py-3.5 pr-4 font-bold text-[#407EC9]">
                <button 
                  @click="store.openCandidateModal(candidate.symbol)"
                  class="hover:underline cursor-pointer"
                >
                  {{ candidate.symbol }}
                </button>
              </td>
              <td class="py-3.5 pr-4 font-sans text-slate-700">{{ candidate.sector }}</td>
              <td class="py-3.5 pr-4 text-right text-slate-800">IDR {{ candidate.marketCapTrillionIdr }}T</td>
              <td class="py-3.5 pr-4 text-right font-bold text-emerald-700">{{ candidate.roePercent }}%</td>
              <td class="py-3.5 pr-4 text-right text-slate-800">{{ candidate.peRatio }}x</td>
              <td class="py-3.5 pr-4 text-right text-slate-800">{{ candidate.debtToEquity }}x</td>
              <td class="py-3.5 pr-4 text-right text-emerald-700">{{ candidate.freeCashFlowYieldPercent }}%</td>
              <td class="py-3.5 text-right font-bold text-[#407EC9]">
                <span class="px-2 py-1 rounded bg-[#407EC9]/10 border border-[#407EC9]/20">
                  {{ candidate.qualityScore }}/100
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
