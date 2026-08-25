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
  ShieldCheck,
  Activity,
  ExternalLink
} from 'lucide-vue-next'

const route = useRoute()
const store = useResearchStore()

const currentRouteName = computed(() => route.name)

const creditPercentage = computed(() => {
  return Math.round((store.creditsRemaining / store.totalCredits) * 100)
})

const navItems = [
  {
    group: 'CORE RESEARCH',
    items: [
      { name: 'home', label: 'Workspace', path: '/', icon: Layers },
      { name: 'screener', label: 'Screener Funnel', path: '/screener', icon: Filter },
      { name: 'peers', label: 'Peer Matrix', path: '/peers', icon: GitCompare },
    ]
  },
  {
    group: 'AUDIT & GOVERNANCE',
    items: [
      { name: 'trace', label: 'Tool Trace', path: '/trace', icon: Terminal },
      { name: 'methodology', label: 'Methodology', path: '/methodology', icon: BookOpen },
      { name: 'report', label: 'Final Report', path: '/report', icon: FileSpreadsheet },
    ]
  }
]
</script>

<template>
  <aside class="w-64 shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
    <!-- Top Brand & Header -->
    <div>
      <div class="p-6 border-b border-slate-100">
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-[#407EC9] flex items-center justify-center text-white shadow-sm shadow-[#407EC9]/30 transition-transform group-hover:scale-105">
            <Compass class="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-base tracking-tight text-slate-900 font-mono">VOYAGER<span class="text-[#407EC9]">.ONE</span></span>
            </div>
            <p class="text-[11px] text-slate-500 font-medium -mt-0.5">Financial Research Agent</p>
          </div>
        </router-link>

        <div class="mt-4 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px]">
          <span class="text-slate-500 font-medium">Engine Mode</span>
          <span class="font-mono font-bold text-[#407EC9] text-[10px] bg-[#407EC9]/10 px-1.5 py-0.5 rounded">
            AUTONOMOUS
          </span>
        </div>
      </div>

      <!-- Navigation Groups -->
      <nav class="p-4 space-y-6">
        <div v-for="section in navItems" :key="section.group">
          <div class="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            {{ section.group }}
          </div>
          <div class="space-y-1">
            <router-link
              v-for="item in section.items"
              :key="item.name"
              :to="item.path"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150"
              :class="currentRouteName === item.name 
                ? 'bg-[#407EC9] text-white shadow-sm shadow-[#407EC9]/25 font-bold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'"
            >
              <component :is="item.icon" class="w-4 h-4 shrink-0" />
              <span>{{ item.label }}</span>
            </router-link>
          </div>
        </div>
      </nav>
    </div>

    <!-- Bottom Credits & System Health -->
    <div class="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
      <!-- API Credit Bar -->
      <div class="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-500 font-medium flex items-center gap-1.5">
            <Coins class="w-3.5 h-3.5 text-[#407EC9]" />
            Sectors Credits
          </span>
          <span class="font-mono font-bold text-slate-800 tabular-nums">
            {{ store.creditsRemaining.toLocaleString() }}
          </span>
        </div>

        <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            class="h-full bg-[#407EC9] transition-all duration-500 rounded-full" 
            :style="{ width: `${creditPercentage}%` }"
          ></div>
        </div>

        <div class="flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span>{{ creditPercentage }}% remaining</span>
          <span>10,000 cap</span>
        </div>
      </div>

      <!-- Gateway Status -->
      <div class="flex items-center justify-between px-3 py-2 text-[11px] text-slate-500">
        <span class="flex items-center gap-2 font-medium">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          Gateway Online
        </span>
        <span class="font-mono text-[10px] text-slate-400">{{ store.report.sessionId }}</span>
      </div>
    </div>
  </aside>
</template>
