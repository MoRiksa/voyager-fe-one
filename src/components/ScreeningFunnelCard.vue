<script setup lang="ts">
import { useResearchStore } from '../stores/researchStore'
import { Filter, ChevronRight, ShieldCheck, BarChart2 } from 'lucide-vue-next'

const store = useResearchStore()
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-[#407EC9] font-mono">Pillar 2: Screener Funnel</span>
        <h3 class="text-base font-bold text-slate-900 mt-0.5">Autonomous Universe Narrowing</h3>
      </div>
      <router-link 
        to="/screener" 
        class="text-xs text-[#407EC9] hover:underline font-semibold flex items-center gap-1"
      >
        <span>Inspect Funnel</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </router-link>
    </div>

    <!-- Funnel Steps Visualizer -->
    <div class="space-y-2.5">
      <div 
        v-for="(step, idx) in store.screeningFunnel" 
        :key="step.stage"
        class="p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors"
      >
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-mono font-bold flex items-center justify-center shadow-2xs">
              {{ idx + 1 }}
            </span>
            <span class="text-xs font-bold text-slate-800">{{ step.stage }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-mono font-bold text-slate-900 tabular-nums">
              {{ step.count.toLocaleString() }}
            </span>
            <span class="text-[11px] text-slate-400">tickers</span>
          </div>
        </div>

        <!-- Progress bar representation -->
        <div class="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden mb-1.5">
          <div 
            class="h-full rounded-full transition-all duration-700"
            :class="idx === store.screeningFunnel.length - 1 ? 'bg-[#407EC9]' : 'bg-slate-400'"
            :style="{ width: `${Math.max((step.count / 914) * 100, 3)}%` }"
          ></div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-slate-500">
          <span class="truncate pr-2">{{ step.filterCriteria }}</span>
          <span class="font-mono text-slate-600 font-medium shrink-0">
            {{ ((step.count / 914) * 100).toFixed(1) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
