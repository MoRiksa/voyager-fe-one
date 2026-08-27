<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { 
  X, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  BarChart3, 
  Building2,
  PieChart,
  HelpCircle,
  Database,
  ArrowRight
} from '@lucide/vue'

const store = useResearchStore()
const candidate = computed(() => store.selectedCompany)
const dialogRef = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null

const handleClose = () => {
  store.closeCandidateModal()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') handleClose()
  if (event.key !== 'Tab' || !dialogRef.value) return

  const focusable = Array.from(dialogRef.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(() => store.isDetailModalOpen, async (isOpen) => {
  if (isOpen) {
    previousFocus = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeydown)
    await nextTick()
    dialogRef.value?.focus()
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleKeydown)
    previousFocus?.focus()
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div 
    v-if="store.isDetailModalOpen && candidate"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 lg:p-8 bg-slate-900/60 backdrop-blur-xs"
    @click.self="handleClose"
  >
    <div ref="dialogRef" data-testid="candidate-dialog" role="dialog" aria-modal="true" aria-labelledby="candidate-dialog-title" tabindex="-1" class="bg-white w-full max-w-4xl h-[94dvh] sm:h-auto sm:max-h-[90dvh] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden outline-none">
      <!-- Modal Header -->
      <div class="p-6 border-b border-slate-200/80 bg-slate-50/70 flex items-start justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-[#407EC9] text-white flex items-center justify-center font-mono font-bold text-lg shadow-sm shrink-0">
            {{ candidate.symbol.slice(0, 2) }}
          </div>
          <div>
            <div class="flex items-center gap-2.5">
               <h2 id="candidate-dialog-title" class="text-2xl font-bold font-mono text-slate-900">{{ candidate.symbol }}</h2>
              <span class="px-2.5 py-0.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-md">
                {{ candidate.sector }} • {{ candidate.subsector }}
              </span>
              <span class="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-900 text-white rounded">
                Rank #{{ candidate.rank }}
              </span>
            </div>
            <p class="text-sm text-slate-600 font-medium mt-0.5">{{ candidate.name }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Quality Score Tag -->
          <div class="text-right">
            <div class="inline-flex items-baseline gap-1 px-3 py-1.5 rounded-xl bg-[#407EC9] text-white shadow-xs">
              <Award class="w-4 h-4 self-center" />
              <span class="font-mono font-bold text-lg tabular-nums">{{ candidate.qualityScore }}</span>
              <span class="text-xs opacity-80">/100</span>
            </div>
            <div class="text-xs text-slate-500 font-medium mt-0.5">Skor kualitas</div>
            <div class="mt-0.5 max-w-32 text-[10px] leading-4 text-slate-400">{{ candidate.qualityScore >= 90 ? 'Sangat kuat dalam model' : candidate.qualityScore >= 80 ? 'Kuat dalam model' : 'Perlu analisis tambahan' }}</div>
          </div>

           <button
            @click="handleClose"
             aria-label="Tutup analisis perusahaan"
             class="icon-button"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="p-6 sm:p-8 overflow-y-auto space-y-6">
        <!-- 1. Executive Thesis Strip -->
        <div class="p-4 rounded-xl bg-[#407EC9]/5 border border-[#407EC9]/20">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[#407EC9] mb-1.5 flex items-center gap-1.5">
            <ShieldCheck class="w-4 h-4" />
             Mengapa perusahaan ini dipilih
          </h4>
          <p class="text-sm text-slate-800 leading-relaxed font-normal">
            {{ candidate.whySelected }}
          </p>
        </div>

        <!-- 2. Derived Intelligence 5-Factor Score Breakdown -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Komponen skor
              </h4>
              <h3 class="text-base font-bold text-slate-900 mt-0.5">Lima faktor penilaian</h3>
            </div>
            <span class="text-xs text-slate-500 font-mono">Skala 0-100</span>
          </div>
          <p class="mb-4 text-xs leading-5 text-slate-500">90-100 sangat kuat, 80-89 kuat, dan 70-79 campuran. Bobot menunjukkan kontribusi ke skor akhir, bukan peluang keuntungan.</p>

          <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <!-- Factor 1: Profitability -->
            <div class="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
              <span class="text-[11px] text-slate-500 font-medium">Profitabilitas (25%)</span>
              <div class="text-lg font-mono font-bold text-slate-900 mt-1 tabular-nums">
                {{ candidate.scoreBreakdown.profitability }}
              </div>
              <div class="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div class="bg-[#407EC9] h-full" :style="{ width: `${candidate.scoreBreakdown.profitability}%` }"></div>
              </div>
            </div>

            <!-- Factor 2: Growth -->
            <div class="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
              <span class="text-[11px] text-slate-500 font-medium">Pertumbuhan (25%)</span>
              <div class="text-lg font-mono font-bold text-slate-900 mt-1 tabular-nums">
                {{ candidate.scoreBreakdown.growth }}
              </div>
              <div class="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div class="bg-[#407EC9] h-full" :style="{ width: `${candidate.scoreBreakdown.growth}%` }"></div>
              </div>
            </div>

            <!-- Factor 3: Solvency -->
            <div class="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
              <span class="text-[11px] text-slate-500 font-medium">Solvabilitas (20%)</span>
              <div class="text-lg font-mono font-bold text-slate-900 mt-1 tabular-nums">
                {{ candidate.scoreBreakdown.solvency }}
              </div>
              <div class="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div class="bg-[#407EC9] h-full" :style="{ width: `${candidate.scoreBreakdown.solvency}%` }"></div>
              </div>
            </div>

            <!-- Factor 4: Valuation -->
            <div class="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
              <span class="text-[11px] text-slate-500 font-medium">Valuasi (20%)</span>
              <div class="text-lg font-mono font-bold text-slate-900 mt-1 tabular-nums">
                {{ candidate.scoreBreakdown.valuation }}
              </div>
              <div class="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div class="bg-[#407EC9] h-full" :style="{ width: `${candidate.scoreBreakdown.valuation}%` }"></div>
              </div>
            </div>

            <!-- Factor 5: Consistency -->
            <div class="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
              <span class="text-[11px] text-slate-500 font-medium">Konsistensi (10%)</span>
              <div class="text-lg font-mono font-bold text-slate-900 mt-1 tabular-nums">
                {{ candidate.scoreBreakdown.consistency }}
              </div>
              <div class="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div class="bg-[#407EC9] h-full" :style="{ width: `${candidate.scoreBreakdown.consistency}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. DuPont 3-Stage Financial Deconstruction -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Analisis profitabilitas
              </h4>
              <h3 class="text-base font-bold text-slate-900 mt-0.5">Sumber ROE: margin × efisiensi aset × leverage</h3>
            </div>
            <span class="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
              ROE: {{ candidate.dupontAnalysis.calculatedRoe }}%
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <!-- Stage 1: Net Margin -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span class="text-xs text-slate-500 font-medium">Margin laba bersih</span>
              <p class="text-xl font-mono font-bold text-slate-900 mt-1">{{ candidate.dupontAnalysis.netProfitMargin }}%</p>
              <span class="text-[11px] text-slate-400">Laba dari setiap Rp100 pendapatan</span>
            </div>

            <div class="text-center font-mono font-bold text-slate-400 text-lg hidden md:block">×</div>

            <!-- Stage 2: Asset Turnover -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span class="text-xs text-slate-500 font-medium">Efisiensi aset</span>
              <p class="text-xl font-mono font-bold text-slate-900 mt-1">{{ candidate.dupontAnalysis.assetTurnover }}x</p>
              <span class="text-[11px] text-slate-400">Pendapatan dari setiap Rp1 aset</span>
            </div>

            <div class="text-center font-mono font-bold text-slate-400 text-lg hidden md:block">×</div>

            <!-- Stage 3: Equity Multiplier -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span class="text-xs text-slate-500 font-medium">Equity Multiplier</span>
              <p class="text-xl font-mono font-bold text-slate-900 mt-1">{{ candidate.dupontAnalysis.equityMultiplier }}x</p>
              <span class="text-[11px] text-slate-400">Financial Leverage Factor</span>
            </div>
          </div>
        </div>

        <!-- 4. Strengths & Potential Concerns -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Strengths -->
          <div class="p-5 rounded-xl bg-emerald-50/40 border border-emerald-200/60">
            <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
              <CheckCircle2 class="w-4 h-4 text-emerald-600" />
              Key Fundamental Strengths
            </h4>
            <ul class="space-y-2">
              <li 
                v-for="(strength, idx) in candidate.keyStrengths" 
                :key="idx"
                class="text-xs text-slate-700 flex items-start gap-2"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <span>{{ strength }}</span>
              </li>
            </ul>
          </div>

          <!-- Concerns -->
          <div class="p-5 rounded-xl bg-amber-50/40 border border-amber-200/60">
            <h4 class="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-1.5">
              <AlertTriangle class="w-4 h-4 text-amber-600" />
              Potential Concerns & Risk Flags
            </h4>
            <ul class="space-y-2">
              <li 
                v-for="(concern, idx) in candidate.potentialConcerns" 
                :key="idx"
                class="text-xs text-slate-700 flex items-start gap-2"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                <span>{{ concern }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 5. Traceable Evidence & Citations -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Database class="w-4 h-4 text-[#407EC9]" />
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700">
               Data pendukung
              </h4>
            </div>
             <span class="text-xs text-slate-500 font-mono">Sumber dan konteks metrik</span>
          </div>

          <div class="space-y-2">
            <div 
              v-for="(evidence, idx) in candidate.evidenceCitations" 
              :key="idx"
              class="p-3 rounded-lg bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <span class="font-mono font-semibold text-slate-800">{{ evidence.metric }}: </span>
                <span class="font-mono font-bold text-[#407EC9]">{{ evidence.value }}</span>
                <p class="text-slate-500 text-[11px] mt-0.5">{{ evidence.context }}</p>
              </div>
              <span class="font-mono text-[10px] text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shrink-0 self-start sm:self-center">
                {{ evidence.source }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <span class="text-xs text-slate-500">
           Posisi terhadap perusahaan sejenis: <strong class="text-slate-800">{{ candidate.peerRankInMemory }}</strong>
        </span>

        <div class="flex items-center gap-2">
          <button @click="handleClose" class="button-secondary">Tutup</button>
          <router-link :to="`/research/${store.report.sessionId}/company/${candidate.symbol}`" class="button-primary" @click="handleClose">Analisis lengkap</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
