<script setup lang="ts">
import { ref } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { 
  ArrowRight
} from 'lucide-vue-next'

const store = useResearchStore()
const leftTicker = ref(store.candidates[0]?.symbol || '')
const rightTicker = ref(store.candidates[1]?.symbol || '')
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- View Header -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
         <span class="section-kicker">Perbandingan kandidat</span>
        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
           Peer benchmark
        </span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
         Bandingkan kekuatan dan tradeoff kandidat
      </h1>
      <p class="text-sm text-slate-600 mt-1 max-w-3xl">
         Pilih kandidat dan lihat perbedaan profitabilitas, pertumbuhan, valuasi, serta kesehatan neracanya.
      </p>
    </div>

    <!-- Comparative Table -->
    <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm overflow-hidden">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
           <h3 class="text-lg font-bold text-slate-900">Metrik utama kandidat</h3>
           <p class="text-xs text-slate-500 mt-0.5">Gunakan tabel desktop atau perbandingan dua kandidat di mobile</p>
        </div>
        <div class="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
           {{ store.candidates.length }} kandidat
        </div>
      </div>

      <div class="md:hidden">
        <div class="grid grid-cols-[1fr_auto_1fr] items-end gap-2"><label class="text-xs font-bold text-slate-700">Kandidat A<select v-model="leftTicker" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-mono text-sm"><option v-for="candidate in store.candidates" :key="candidate.symbol" :value="candidate.symbol">{{ candidate.symbol }}</option></select></label><span class="pb-3 text-xs text-slate-400">vs</span><label class="text-xs font-bold text-slate-700">Kandidat B<select v-model="rightTicker" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-mono text-sm"><option v-for="candidate in store.candidates" :key="candidate.symbol" :value="candidate.symbol">{{ candidate.symbol }}</option></select></label></div>
        <div class="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
          <div v-for="metric in [{ label: 'Skor kualitas', key: 'qualityScore', suffix: '' }, { label: 'ROE', key: 'roePercent', suffix: '%' }, { label: 'P/E', key: 'peRatio', suffix: 'x' }, { label: '3Y revenue CAGR', key: 'revenue3yCagrPercent', suffix: '%' }, { label: 'FCF yield', key: 'freeCashFlowYieldPercent', suffix: '%' }]" :key="metric.key" class="grid grid-cols-3 gap-2 p-3 text-center text-xs"><span class="font-mono font-bold text-slate-900">{{ store.candidates.find(c => c.symbol === leftTicker)?.[metric.key as keyof typeof store.candidates[number]] }}{{ metric.suffix }}</span><span class="text-slate-500">{{ metric.label }}</span><span class="font-mono font-bold text-slate-900">{{ store.candidates.find(c => c.symbol === rightTicker)?.[metric.key as keyof typeof store.candidates[number]] }}{{ metric.suffix }}</span></div>
        </div>
      </div>

      <div class="hidden overflow-x-auto md:block">
        <table class="w-full text-left text-xs">
          <caption class="sr-only">Perbandingan metrik kandidat terpilih</caption>
          <thead>
            <tr class="border-b border-slate-200 text-slate-400 uppercase font-mono font-semibold">
               <th scope="col" class="pb-3 pr-4">Candidate</th>
              <th class="pb-3 pr-4 text-center">Quality Score</th>
              <th class="pb-3 pr-4 text-right">ROE (%)</th>
              <th class="pb-3 pr-4 text-right">ROA (%)</th>
              <th class="pb-3 pr-4 text-right">P/E Ratio</th>
              <th class="pb-3 pr-4 text-right">P/BV Ratio</th>
              <th class="pb-3 pr-4 text-right">EV/EBITDA</th>
              <th class="pb-3 pr-4 text-right">Debt/Equity</th>
              <th class="pb-3 pr-4 text-right">3Y Rev CAGR</th>
              <th class="pb-3 text-right">FCF Yield</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-mono">
            <tr 
              v-for="candidate in store.candidates"
              :key="candidate.symbol"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="py-4 pr-4">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-md bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                    #{{ candidate.rank }}
                  </span>
                  <div>
                    <button 
                      @click="store.openCandidateModal(candidate.symbol)"
                      class="font-bold text-[#407EC9] hover:underline cursor-pointer text-sm"
                    >
                      {{ candidate.symbol }}
                    </button>
                    <div class="text-[11px] text-slate-500 font-sans truncate max-w-[150px]">{{ candidate.name }}</div>
                  </div>
                </div>
              </td>

              <!-- Quality Score with indicator -->
              <td class="py-4 pr-4 text-center">
                <span class="px-2.5 py-1 rounded-md bg-[#407EC9]/10 text-[#407EC9] font-bold border border-[#407EC9]/20">
                  {{ candidate.qualityScore }}
                </span>
              </td>

              <!-- ROE -->
              <td class="py-4 pr-4 text-right font-bold text-emerald-700">
                {{ candidate.roePercent }}%
              </td>

              <!-- ROA -->
              <td class="py-4 pr-4 text-right text-slate-800">
                {{ candidate.roaPercent }}%
              </td>

              <!-- PE -->
              <td class="py-4 pr-4 text-right text-slate-800">
                {{ candidate.peRatio }}x
              </td>

              <!-- PBV -->
              <td class="py-4 pr-4 text-right text-slate-800">
                {{ candidate.pbvRatio }}x
              </td>

              <!-- EV/EBITDA -->
              <td class="py-4 pr-4 text-right text-slate-800">
                {{ candidate.evToEbitda }}x
              </td>

              <!-- Debt to Equity -->
              <td class="py-4 pr-4 text-right text-slate-800">
                {{ candidate.debtToEquity }}x
              </td>

              <!-- 3Y Rev CAGR -->
              <td class="py-4 pr-4 text-right text-slate-800">
                +{{ candidate.revenue3yCagrPercent }}%
              </td>

              <!-- FCF Yield -->
              <td class="py-4 text-right font-bold text-emerald-700">
                {{ candidate.freeCashFlowYieldPercent }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Comparative Synthesis Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h4 class="text-xs font-bold uppercase tracking-wider text-[#407EC9] font-mono mb-2">
          Highest Return on Capital
        </h4>
        <div class="text-xl font-bold font-mono text-slate-900">AMRT (24.8% ROE)</div>
        <p class="text-xs text-slate-600 mt-2 leading-relaxed">
          Driven by high inventory velocity (Asset Turnover 2.84x) across 19,000 nationwide convenience stores.
        </p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h4 class="text-xs font-bold uppercase tracking-wider text-[#407EC9] font-mono mb-2">
          Deep Value & Cash Generation
        </h4>
        <div class="text-xl font-bold font-mono text-slate-900">UNTR (12.8% FCF Yield)</div>
        <p class="text-xs text-slate-600 mt-2 leading-relaxed">
          Trades at modest 5.2x P/E with pristine net cash balance sheet and high 8.6% dividend distribution.
        </p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h4 class="text-xs font-bold uppercase tracking-wider text-[#407EC9] font-mono mb-2">
          Highest Quality Score
        </h4>
        <div class="text-xl font-bold font-mono text-slate-900">BBCA (94/100 Score)</div>
        <p class="text-xs text-slate-600 mt-2 leading-relaxed">
          Unrivaled low-cost deposit moat (81.4% CASA) sustaining 21.8% ROE and industry-lowest loan delinquency.
        </p>
      </div>
    </div>
  </div>
</template>
