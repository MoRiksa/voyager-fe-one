<script setup lang="ts">
import { useResearchStore } from '../stores/researchStore'
import { 
  GitCommit, 
  Filter, 
  Cpu, 
  HardDrive, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-vue-next'

const store = useResearchStore()

const getIcon = (pillarId: string) => {
  switch (pillarId) {
    case 'planner': return GitCommit
    case 'screener': return Filter
    case 'engine': return Cpu
    case 'state': return HardDrive
    case 'report': return FileText
    default: return Sparkles
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-[#407EC9] font-mono">
            Architecture Pillars
          </span>
          <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            5 Core Capabilities
          </span>
        </div>
        <h2 class="text-lg font-bold text-slate-900 mt-1">Autonomous Execution Pipeline</h2>
      </div>

      <div class="flex items-center gap-2 text-xs text-slate-500">
        <span class="inline-flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Completed
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-[#407EC9] animate-pulse"></span> Active
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-slate-300"></span> Pending
        </span>
      </div>
    </div>

    <!-- 5 Pillars Flow Grid -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
      <div
        v-for="(pillar, index) in store.pillars"
        :key="pillar.id"
        class="relative p-4 rounded-xl border transition-all flex flex-col justify-between"
        :class="{
          'bg-[#407EC9]/5 border-[#407EC9] shadow-sm ring-1 ring-[#407EC9]/30': pillar.status === 'active',
          'bg-slate-50/50 border-slate-200 hover:border-slate-300': pillar.status === 'completed',
          'bg-white/40 border-slate-200/60 opacity-60': pillar.status === 'pending'
        }"
      >
        <!-- Top Status Bar in card -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <div 
              class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-colors"
              :class="{
                'bg-[#407EC9] text-white shadow-sm': pillar.status === 'active',
                'bg-emerald-100 text-emerald-800': pillar.status === 'completed',
                'bg-slate-100 text-slate-500': pillar.status === 'pending'
              }"
            >
              0{{ pillar.number }}
            </div>

            <div class="flex items-center">
              <span v-if="pillar.status === 'completed'" class="text-emerald-600 flex items-center gap-1 text-[11px] font-semibold">
                <CheckCircle2 class="w-3.5 h-3.5" />
                Done
              </span>
              <span v-else-if="pillar.status === 'active'" class="text-[#407EC9] flex items-center gap-1 text-[11px] font-semibold">
                <Loader2 class="w-3.5 h-3.5 animate-spin" />
                Running
              </span>
              <span v-else class="text-slate-400 text-[11px] font-medium">
                Pending
              </span>
            </div>
          </div>

          <!-- Pillar Title & Subtitle -->
          <div class="flex items-start gap-2.5">
            <component 
              :is="getIcon(pillar.id)" 
              class="w-4 h-4 mt-0.5 shrink-0" 
              :class="pillar.status === 'active' ? 'text-[#407EC9]' : (pillar.status === 'completed' ? 'text-slate-700' : 'text-slate-400')" 
            />
            <div>
              <h3 class="text-xs font-bold text-slate-900 tracking-tight">{{ pillar.name }}</h3>
              <p class="text-[11px] text-slate-500 mt-1 leading-snug">{{ pillar.subtitle }}</p>
            </div>
          </div>
        </div>

        <!-- Pillar Metrics / Result Footer -->
        <div class="mt-4 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
          <span class="font-mono text-slate-600 font-medium truncate">
            {{ pillar.metricsSummary || 'Waiting for trigger' }}
          </span>
          <span v-if="pillar.durationMs" class="text-slate-400 font-mono flex items-center gap-0.5 ml-1 shrink-0">
            <Clock class="w-2.5 h-2.5" />
            {{ pillar.durationMs }}ms
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
