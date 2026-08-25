<script setup lang="ts">
import { ref } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  SlidersHorizontal, 
  Building2, 
  TrendingUp, 
  PieChart, 
  ShieldCheck,
  Loader2,
  HelpCircle
} from 'lucide-vue-next'

const store = useResearchStore()
const isCustomPromptFocused = ref(false)
const showAdvancedSettings = ref(false)

const handlePresetClick = (preset: any) => {
  store.selectPreset(preset)
}

const handleLaunch = () => {
  store.runAutonomousResearch()
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden transition-all">
    <!-- Header Banner -->
    <div class="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-white via-[#F4F8FD] to-white">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#407EC9]/10 text-[#407EC9] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles class="w-3.5 h-3.5" />
            Autonomous Objective Input
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Define Research Objective
          </h1>
          <p class="text-sm text-slate-600 mt-1 max-w-2xl">
            State your high-level research goal. The agent autonomously determines screening filters, Sectors API queries, candidate ranking, and evidence validation.
          </p>
        </div>

        <!-- Mode Indicator -->
        <div class="flex items-center gap-2 self-start md:self-center px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs shadow-sm">
          <ShieldCheck class="w-4 h-4 text-emerald-600" />
          <div>
            <div class="font-semibold text-slate-800">Deterministic Intelligence</div>
            <div class="text-[11px] text-slate-500">Zero Hallucinations • Traceable Logic</div>
          </div>
        </div>
      </div>

      <!-- Presets Selector -->
      <div class="mt-6">
        <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <span>Curated Institutional Strategies:</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            v-for="preset in store.presets"
            :key="preset.id"
            @click="handlePresetClick(preset)"
            class="text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between"
            :class="store.activePresetId === preset.id 
              ? 'bg-[#407EC9]/5 border-[#407EC9] ring-2 ring-[#407EC9]/20 shadow-sm' 
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'"
          >
            <div>
              <div class="flex items-center justify-between mb-1">
                <span 
                  class="text-[11px] font-semibold px-2 py-0.5 rounded"
                  :class="store.activePresetId === preset.id ? 'bg-[#407EC9] text-white' : 'bg-slate-100 text-slate-600'"
                >
                  {{ preset.category }}
                </span>
                <span class="text-[11px] text-slate-400 font-mono">{{ preset.expectedCandidates }} Targets</span>
              </div>
              <h4 class="text-xs font-bold text-slate-900 line-clamp-1 mt-1">{{ preset.title }}</h4>
              <p class="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{{ preset.objective }}</p>
            </div>
            
            <div class="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-slate-100">
              <span 
                v-for="tag in preset.tags.slice(0, 2)" 
                :key="tag"
                class="text-[10px] text-slate-500 font-medium"
              >
                #{{ tag }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Text Input & Actions -->
    <div class="p-6 md:p-8 bg-white">
      <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
        Custom Research Prompt / Objective:
      </label>
      <div 
        class="relative rounded-xl border transition-all duration-200"
        :class="isCustomPromptFocused ? 'border-[#407EC9] ring-4 ring-[#407EC9]/10 shadow-sm' : 'border-slate-300 hover:border-slate-400'"
      >
        <textarea
          v-model="store.currentObjective"
          @focus="isCustomPromptFocused = true"
          @blur="isCustomPromptFocused = false"
          rows="3"
          placeholder="Example: Find 5 Indonesian companies worth researching further based on strong fundamentals, healthy financials, reasonable valuation, and consistent growth."
          class="w-full p-4 text-sm sm:text-base text-slate-900 bg-transparent resize-none focus:outline-none placeholder:text-slate-400 font-normal leading-relaxed"
        ></textarea>

        <!-- Bottom controls inside input -->
        <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50/80 border-t border-slate-200/80 rounded-b-xl">
          <div class="flex items-center gap-3 text-xs text-slate-500">
            <span class="inline-flex items-center gap-1">
              <Building2 class="w-3.5 h-3.5 text-slate-400" />
              Target Universe: <strong class="text-slate-700 font-medium">914 IDX Listed Stocks</strong>
            </span>
            <span class="text-slate-300">•</span>
            <span class="inline-flex items-center gap-1">
              <SlidersHorizontal class="w-3.5 h-3.5 text-slate-400" />
              Depth: <strong class="text-slate-700 font-medium">Top 5 Candidates</strong>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="store.openMethodology"
              type="button"
              class="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-200/60 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle class="w-3.5 h-3.5" />
              <span>Scoring Methodology</span>
            </button>

            <!-- Primary CTA Button -->
            <button
              @click="handleLaunch"
              :disabled="store.isExecuting || !store.currentObjective.trim()"
              class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl bg-[#407EC9] hover:bg-[#2F64A8] active:bg-[#244F87] shadow-sm shadow-[#407EC9]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Loader2 v-if="store.isExecuting" class="w-4 h-4 animate-spin" />
              <Search v-else class="w-4 h-4 stroke-[2.5]" />
              <span>{{ store.isExecuting ? 'Agent Executing...' : 'Launch Autonomous Research' }}</span>
              <ArrowRight v-if="!store.isExecuting" class="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Strategy Tags / Pills -->
      <div class="flex flex-wrap items-center gap-2 mt-4 text-xs">
        <span class="text-slate-400 font-medium">Active Research Filters:</span>
        <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200/60">
          ROE >= 15%
        </span>
        <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200/60">
          Debt/Equity <= 1.0x
        </span>
        <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200/60">
          3Y Revenue CAGR >= 10%
        </span>
        <span class="px-2.5 py-1 rounded-md bg-[#407EC9]/10 text-[#407EC9] font-mono font-semibold border border-[#407EC9]/20">
          Derived Quality Score >= 80/100
        </span>
      </div>
    </div>
  </div>
</template>
