<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import DataProvenance from './DataProvenance.vue'
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
const modalRootRef = ref<HTMLElement | null>(null)
const dialogRef = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null
let inertedElements: HTMLElement[] = []

type InertEntry = { count: number; wasInert: boolean }
const globalState = globalThis as typeof globalThis & {
  __voyagerModalInertRegistry?: Map<HTMLElement, InertEntry>
}
const inertRegistry = globalState.__voyagerModalInertRegistry ??= new Map<HTMLElement, InertEntry>()

const restoreBackgroundInert = () => {
  for (const element of inertedElements) {
    const entry = inertRegistry.get(element)
    if (!entry) continue

    if (entry.count === 1) {
      element.inert = entry.wasInert
      inertRegistry.delete(element)
    } else {
      entry.count--
    }
  }
  inertedElements = []
}

const setBackgroundInert = () => {
  restoreBackgroundInert()
  const modalRoot = modalRootRef.value
  const parent = modalRoot?.parentElement
  if (!modalRoot || !parent) return

  inertedElements = Array.from(parent.children).filter(
    (element): element is HTMLElement => element instanceof HTMLElement && element !== modalRoot,
  )
  for (const element of inertedElements) {
    const entry = inertRegistry.get(element)
    if (entry) {
      entry.count++
    } else {
      inertRegistry.set(element, { count: 1, wasInert: element.inert })
      element.inert = true
    }
  }
}

const compactSource = (source: string) => source.startsWith('Derived')
  ? `Turunan · ${source.split('/').pop()}`
  : `Fixture v1 · ${source.split('/').slice(-2).join('/')}`

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
    setBackgroundInert()
    dialogRef.value?.focus()
  } else {
    restoreBackgroundInert()
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleKeydown)
    previousFocus?.focus()
  }
})

onBeforeUnmount(() => {
  restoreBackgroundInert()
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    ref="modalRootRef"
    v-if="store.isDetailModalOpen && candidate"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 lg:p-8 bg-slate-900/60 backdrop-blur-xs"
    @click.self="handleClose"
  >
    <div ref="dialogRef" data-testid="candidate-dialog" role="dialog" aria-modal="true" aria-labelledby="candidate-dialog-title" tabindex="-1" class="bg-white w-full max-w-4xl h-[94dvh] sm:h-auto sm:max-h-[90dvh] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden outline-none">
      <!-- Modal Header -->
      <div class="relative flex flex-col gap-4 border-b border-slate-200/80 bg-slate-50/70 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div class="flex min-w-0 items-start gap-3 pr-12 sm:gap-4 sm:pr-0">
          <div class="w-12 h-12 rounded-xl bg-[#2F64A8] text-white flex items-center justify-center font-mono font-bold text-lg shadow-sm shrink-0">
            {{ candidate.symbol.slice(0, 2) }}
          </div>
           <div class="min-w-0">
             <div class="flex flex-wrap items-center gap-2.5">
               <h2 id="candidate-dialog-title" class="text-2xl font-bold font-mono text-slate-900">{{ candidate.symbol }}</h2>
              <span class="px-2.5 py-0.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-md">
                {{ candidate.sector }} • {{ candidate.subsector }}
              </span>
              <span class="rounded-md bg-slate-900 px-2 py-1 text-xs font-mono font-bold text-white">
                Rank #{{ candidate.rank }}
              </span>
            </div>
            <p class="text-sm text-slate-600 font-medium mt-0.5">{{ candidate.name }}</p>
          </div>
        </div>

        <div class="flex items-start justify-between gap-3 sm:justify-end">
          <!-- Quality Score Tag -->
          <div class="text-right">
            <div class="inline-flex items-baseline gap-1 px-3 py-1.5 rounded-xl bg-[#2F64A8] text-white shadow-sm">
              <Award class="w-4 h-4 self-center" />
              <span class="font-mono font-bold text-lg tabular-nums">{{ candidate.qualityScore }}</span>
              <span class="text-xs opacity-80">/100</span>
            </div>
            <div class="text-xs text-slate-500 font-medium mt-0.5">Skor kualitas</div>
            <div class="mt-1 max-w-40 text-xs leading-5 text-slate-500">{{ candidate.qualityScore >= 90 ? 'Sangat kuat dalam model' : candidate.qualityScore >= 80 ? 'Kuat dalam model' : 'Perlu analisis tambahan' }}</div>
          </div>

           <button
            @click="handleClose"
             aria-label="Tutup analisis perusahaan"
             class="icon-button absolute right-3 top-3 sm:static"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="p-6 sm:p-8 overflow-y-auto space-y-6">
        <!-- 1. Executive Thesis Strip -->
        <DataProvenance source="prototype-fixture-v1 dan metrik turunan sesi" :financial-period="candidate.financialPeriod" :price-as-of="candidate.priceAsOf" :generated-at="store.report.timestamp" compact />

        <div class="p-4 rounded-xl bg-[#407EC9]/5 border border-[#407EC9]/20">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[#2F64A8] mb-1.5 flex items-center gap-1.5">
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

          <div class="grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <!-- Stage 1: Net Margin -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span class="text-xs text-slate-500 font-medium">Margin laba bersih</span>
              <p class="text-xl font-mono font-bold text-slate-900 mt-1">{{ candidate.dupontAnalysis.netProfitMargin }}%</p>
              <span class="text-xs text-slate-500">Laba dari setiap Rp100 pendapatan</span>
            </div>

            <div class="text-center font-mono font-bold text-slate-400 text-lg hidden md:block">×</div>

            <!-- Stage 2: Asset Turnover -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span class="text-xs text-slate-500 font-medium">Efisiensi aset</span>
              <p class="text-xl font-mono font-bold text-slate-900 mt-1">{{ candidate.dupontAnalysis.assetTurnover }}x</p>
              <span class="text-xs text-slate-500">Pendapatan dari setiap Rp1 aset</span>
            </div>

            <div class="text-center font-mono font-bold text-slate-400 text-lg hidden md:block">×</div>

            <!-- Stage 3: Equity Multiplier -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span class="text-xs text-slate-500 font-medium">Pengali Ekuitas</span>
              <p class="text-xl font-mono font-bold text-slate-900 mt-1">{{ candidate.dupontAnalysis.equityMultiplier }}x</p>
              <span class="text-xs text-slate-500">Pengaruh leverage ke pengembalian modal</span>
            </div>
          </div>
        </div>

        <!-- 4. Strengths & Potential Concerns -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Strengths -->
          <div class="p-5 rounded-xl bg-emerald-50/40 border border-emerald-200/60">
            <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
              <CheckCircle2 class="w-4 h-4 text-emerald-600" />
              Kekuatan Fundamental Utama
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
              Potensi Risiko dan Perhatian
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
                <span class="font-mono font-bold text-[#2F64A8]">{{ evidence.value }}</span>
                <p class="mt-1 text-xs text-slate-500">{{ evidence.context }}</p>
              </div>
              <div class="shrink-0 self-start text-left sm:self-center sm:text-right">
                <span class="block rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-mono text-slate-600" :title="evidence.source">{{ compactSource(evidence.source) }}</span>
                <span v-if="evidence.period" class="mt-1 block text-[10px] text-slate-500">Periode: <span class="font-mono">{{ evidence.period }}</span></span>
                <span v-if="evidence.asOf" class="mt-1 block text-[10px] text-slate-500">Per tanggal: <span class="font-mono">{{ evidence.asOf }}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <span class="text-xs text-slate-500">
           Posisi terhadap perusahaan sejenis: <strong class="text-slate-800">{{ candidate.peerRankInMemory }}</strong>
        </span>

        <div class="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <button @click="handleClose" class="button-secondary w-full">Tutup</button>
          <router-link :to="`/research/${store.report.sessionId}/company/${candidate.symbol}`" class="button-primary w-full" @click="handleClose">Analisis lengkap</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
