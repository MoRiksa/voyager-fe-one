<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { 
  Compass, 
  Layers, 
  Filter, 
  GitCompare, 
  Terminal, 
  BookOpen, 
  FileSpreadsheet,
  Coins,
  Play,
  RotateCcw,
  CheckCircle2,
  Loader2
} from 'lucide-vue-next'

const route = useRoute()
const store = useResearchStore()

const currentRouteName = computed(() => route.name)

const creditPercentage = computed(() => {
  return Math.round((store.creditsRemaining / store.totalCredits) * 100)
})

const statusLabel = computed(() => {
  switch (store.status) {
    case 'UNDERSTANDING': return 'Understanding Objective'
    case 'PLANNING': return 'Formulating Research Plan'
    case 'DISCOVERING': return 'Discovering Company Universe'
    case 'SCREENING': return 'Executing Screener Logic'
    case 'RANKING': return 'Ranking Candidate Scores'
    case 'RESEARCHING': return 'Deep Financial Analysis'
    case 'COMPARING': return 'Peer Group Benchmarking'
    case 'VALIDATING': return 'Validating Data & Checks'
    case 'REPORTING': return 'Generating Final Report'
    case 'COMPLETED': return 'Research Session Ready'
    case 'FAILED': return 'Execution Error'
    default: return 'Agent Idle'
  }
})
</script>

<template>
  <header class="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
    <!-- Top Utility & Metadata Strip -->
    <div class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-100 py-1.5 flex items-center justify-between text-xs text-slate-500">
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center gap-1.5 font-medium text-slate-700">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Sectors API Gateway Connected
        </span>
        <span class="hidden md:inline text-slate-300">|</span>
        <span class="hidden md:inline">Track: AI Agents & Assistants • Derived Intelligence Engine</span>
      </div>

      <div class="flex items-center gap-4">
        <!-- API Credits Monitor -->
        <div class="flex items-center gap-2" title="Sectors API Credits Allocated">
          <Coins class="w-3.5 h-3.5 text-[#407EC9]" />
          <span class="font-mono font-medium text-slate-700 tabular-nums">
            {{ store.creditsRemaining.toLocaleString() }}
          </span>
          <span class="text-slate-400">/ {{ store.totalCredits.toLocaleString() }} credits</span>
          <div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-1">
            <div 
              class="h-full bg-[#407EC9] transition-all duration-500" 
              :style="{ width: `${creditPercentage}%` }"
            ></div>
          </div>
        </div>

        <span class="text-slate-300">|</span>
        <span class="font-mono text-slate-600">ID: {{ store.report.sessionId }}</span>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <div class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between h-16">
      <!-- Brand Logo -->
      <div class="flex items-center gap-6">
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-lg bg-[#407EC9] flex items-center justify-center text-white shadow-sm shadow-[#407EC9]/30 transition-transform group-hover:scale-105">
            <Compass class="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-lg tracking-tight text-slate-900 font-mono">VOYAGER<span class="text-[#407EC9]">.ONE</span></span>
              <span class="px-1.5 py-0.5 text-[10px] font-semibold bg-[#407EC9]/10 text-[#407EC9] rounded border border-[#407EC9]/20">
                AUTONOMOUS
              </span>
            </div>
            <p class="text-[11px] text-slate-500 font-medium -mt-0.5">Financial Research Agent</p>
          </div>
        </router-link>

        <!-- Navigation Links -->
        <nav class="hidden lg:flex items-center gap-1 ml-4 text-sm font-medium">
          <router-link 
            to="/" 
            class="px-3 py-2 rounded-md transition-colors flex items-center gap-2"
            :class="currentRouteName === 'home' ? 'bg-[#407EC9]/10 text-[#407EC9] font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'"
          >
            <Layers class="w-4 h-4" />
            Workspace
          </router-link>

          <router-link 
            to="/screener" 
            class="px-3 py-2 rounded-md transition-colors flex items-center gap-2"
            :class="currentRouteName === 'screener' ? 'bg-[#407EC9]/10 text-[#407EC9] font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'"
          >
            <Filter class="w-4 h-4" />
            Screener Funnel
          </router-link>

          <router-link 
            to="/peers" 
            class="px-3 py-2 rounded-md transition-colors flex items-center gap-2"
            :class="currentRouteName === 'peers' ? 'bg-[#407EC9]/10 text-[#407EC9] font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'"
          >
            <GitCompare class="w-4 h-4" />
            Peer Matrix
          </router-link>

          <router-link 
            to="/trace" 
            class="px-3 py-2 rounded-md transition-colors flex items-center gap-2"
            :class="currentRouteName === 'trace' ? 'bg-[#407EC9]/10 text-[#407EC9] font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'"
          >
            <Terminal class="w-4 h-4" />
            Tool Trace
          </router-link>

          <router-link 
            to="/methodology" 
            class="px-3 py-2 rounded-md transition-colors flex items-center gap-2"
            :class="currentRouteName === 'methodology' ? 'bg-[#407EC9]/10 text-[#407EC9] font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'"
          >
            <BookOpen class="w-4 h-4" />
            Methodology
          </router-link>

          <router-link 
            to="/report" 
            class="px-3 py-2 rounded-md transition-colors flex items-center gap-2"
            :class="currentRouteName === 'report' ? 'bg-[#407EC9]/10 text-[#407EC9] font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'"
          >
            <FileSpreadsheet class="w-4 h-4" />
            Final Report
          </router-link>
        </nav>
      </div>

      <!-- Action Status & Quick Run -->
      <div class="flex items-center gap-3">
        <!-- Live Agent State Badge -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
          <span 
            class="w-2 h-2 rounded-full"
            :class="store.isExecuting ? 'bg-[#407EC9] animate-ping' : 'bg-emerald-500'"
          ></span>
          <span class="text-slate-600 font-medium">{{ statusLabel }}</span>
        </div>

        <!-- Run / Re-run Simulation Button -->
        <button
          @click="store.runAutonomousResearch"
          :disabled="store.isExecuting"
          class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#407EC9] hover:bg-[#2F64A8] active:bg-[#244F87] text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Loader2 v-if="store.isExecuting" class="w-3.5 h-3.5 animate-spin" />
          <Play v-else class="w-3.5 h-3.5 fill-current" />
          <span>{{ store.isExecuting ? 'Researching...' : 'Re-Run Loop' }}</span>
        </button>
      </div>
    </div>
  </header>
</template>
