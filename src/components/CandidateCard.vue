<script setup lang="ts">
import type { CandidateCompany } from '../types'
import { useResearchStore } from '../stores/researchStore'
import { 
  Award, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  AlertTriangle
} from 'lucide-vue-next'

const props = defineProps<{
  candidate: CandidateCompany
}>()

const store = useResearchStore()

const handleInspect = () => {
  store.openCandidateModal(props.candidate.symbol)
}
</script>

<template>
  <article class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-[box-shadow,border-color] flex flex-col justify-between group">
    <!-- Top Header Strip: Rank, Symbol, Score -->
    <div>
      <div class="flex items-start justify-between gap-3 mb-4">
        <div class="flex items-start gap-3">
          <!-- Rank Badge -->
          <div class="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
            #{{ candidate.rank }}
          </div>

          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-bold text-slate-900 tracking-tight font-mono group-hover:text-[#407EC9] transition-colors">
                {{ candidate.symbol }}
              </h3>
              <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
                {{ candidate.subsector }}
              </span>
            </div>
            <p class="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">{{ candidate.name }}</p>
          </div>
        </div>

        <!-- Derived Quality Score Badge -->
        <div class="text-right shrink-0">
          <div class="inline-flex items-baseline gap-1 px-3 py-1.5 rounded-xl bg-[#407EC9]/10 border border-[#407EC9]/20 text-[#407EC9]">
            <Award class="w-3.5 h-3.5 self-center" />
            <span class="font-mono font-bold text-base tabular-nums">{{ candidate.qualityScore }}</span>
            <span class="text-[10px] font-medium text-slate-500">/100</span>
          </div>
           <div class="text-xs text-slate-500 font-medium mt-0.5">Skor kualitas</div>
        </div>
      </div>

      <!-- Financial Metrics 4-Col Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-slate-50/70 border border-slate-100 mb-4 text-center">
        <div>
          <span class="text-xs text-slate-500 uppercase font-semibold">ROE</span>
          <p class="text-xs font-mono font-bold text-slate-900 tabular-nums">{{ candidate.roePercent }}%</p>
        </div>
        <div>
          <span class="text-xs text-slate-500 uppercase font-semibold">P/E Ratio</span>
          <p class="text-xs font-mono font-bold text-slate-900 tabular-nums">{{ candidate.peRatio }}x</p>
        </div>
        <div>
          <span class="text-xs text-slate-500 uppercase font-semibold">Debt / Equity</span>
          <p class="text-xs font-mono font-bold text-slate-900 tabular-nums">{{ candidate.debtToEquity }}x</p>
        </div>
        <div>
          <span class="text-xs text-slate-500 uppercase font-semibold">FCF Yield</span>
          <p class="text-xs font-mono font-bold text-emerald-700 tabular-nums">{{ candidate.freeCashFlowYieldPercent }}%</p>
        </div>
      </div>

      <!-- Explainability: Why Selected? -->
      <div class="mb-4">
        <h4 class="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
          <Sparkles class="w-3 h-3 text-[#407EC9]" />
           Mengapa perusahaan ini dipilih
        </h4>
        <p class="text-xs text-slate-600 leading-relaxed line-clamp-3">
          {{ candidate.whySelected }}
        </p>
      </div>

      <div class="mb-5 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-950">
        <AlertTriangle class="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
        <span class="line-clamp-2">{{ candidate.potentialConcerns[0] }}</span>
      </div>

      <!-- Key Strengths Chips -->
      <div class="space-y-1.5 mb-5">
        <div 
          v-for="(strength, idx) in candidate.keyStrengths.slice(0, 2)" 
          :key="idx"
          class="text-[11px] text-slate-700 flex items-start gap-1.5"
        >
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
          <span class="line-clamp-1">{{ strength }}</span>
        </div>
      </div>
    </div>

    <!-- Card Action Button -->
    <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
      <span class="text-[11px] font-mono text-slate-400">
        {{ candidate.peerRankInMemory }}
      </span>

      <button
        @click="handleInspect"
        class="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-[#2F64A8] hover:text-[#244F87] py-2 px-2 rounded-lg hover:bg-[#407EC9]/5 transition-[background-color,color,transform] active:scale-[0.97] cursor-pointer"
      >
        <span>Lihat analisis</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>
  </article>
</template>
