<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { 
  X, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  Cpu, 
  Calculator, 
  Layers,
  Award,
  AlertCircle
} from '@lucide/vue'

const store = useResearchStore()
const dialogRef = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null

const close = () => store.closeMethodology()
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
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

watch(() => store.isMethodologyModalOpen, async (isOpen) => {
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
    v-if="store.isMethodologyModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-900/60 backdrop-blur-xs transition-opacity"
    @click.self="close"
  >
    <div ref="dialogRef" role="dialog" aria-modal="true" aria-labelledby="methodology-dialog-title" tabindex="-1" class="bg-white w-full max-w-3xl max-h-[90dvh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden outline-none">
      <!-- Modal Header -->
      <div class="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#407EC9] text-white flex items-center justify-center shadow-xs">
            <Calculator class="w-5 h-5" />
          </div>
          <div>
             <h2 id="methodology-dialog-title" class="text-xl font-bold text-slate-900">Cara skor dihitung</h2>
             <p class="text-xs text-slate-500">Lima faktor penilaian dan batas penggunaannya</p>
          </div>
        </div>

        <button
           @click="close"
           aria-label="Tutup metodologi"
           class="icon-button"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-slate-600">
        <!-- 1. Qualifying Test Mandate -->
        <div class="p-4 rounded-xl bg-[#407EC9]/5 border border-[#407EC9]/20">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[#407EC9] mb-1 flex items-center gap-1.5">
            <ShieldCheck class="w-4 h-4" />
             Metodologi yang dapat ditelusuri
          </h4>
          <p class="text-xs text-slate-700 leading-relaxed">
            Voyager One merangkum data ke dalam lima faktor penilaian, analisis DuPont tiga tahap, dan penyaringan bertingkat. Setiap hasil tetap perlu dibaca bersama bukti dan keterbatasannya.
          </p>
        </div>

        <!-- 2. The 5-Factor Scoring Formula -->
        <div>
          <h3 class="text-base font-bold text-slate-900 mb-2">1. Formula skor kualitas</h3>
          <p class="text-xs leading-relaxed mb-3">
            Setiap kandidat dinilai pada skala 0 sampai 100 menggunakan dimensi fundamental berbobot:
          </p>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
            <div class="font-bold text-[#407EC9]">
              Skor Kualitas = (0.25 × Profitabilitas) + (0.25 × Pertumbuhan) + (0.20 × Solvabilitas) + (0.20 × Valuasi) + (0.10 × Konsistensi)
            </div>
            <div class="text-[11px] text-slate-500 pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div>• <strong>Profitabilitas (25%)</strong>: ROE, ROA, dan margin</div>
              <div>• <strong>Pertumbuhan (25%)</strong>: CAGR pendapatan dan laba bersih tiga tahun</div>
              <div>• <strong>Solvabilitas (20%)</strong>: Debt/Equity, current ratio, dan posisi kas</div>
              <div>• <strong>Valuasi (20%)</strong>: P/E dan P/BV fixture; konteks historis hanya jika tersedia pada bukti</div>
              <div>• <strong>Konsistensi (10%)</strong>: stabilitas laba dan dividen</div>
            </div>
          </div>
        </div>

        <!-- 3. De-coupled AI Orchestrator vs Deterministic Engine -->
        <div>
          <h3 class="text-base font-bold text-slate-900 mb-2">2. Perhitungan dan interpretasi</h3>
          <p class="text-xs leading-relaxed mb-3">
            Perhitungan angka dipisahkan dari interpretasi naratif. Tujuannya agar skor dapat ditelusuri ke komponen yang digunakan dan kesimpulan tetap menyertakan risiko.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3.5 rounded-xl border border-slate-200 bg-white">
              <h5 class="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Cpu class="w-3.5 h-3.5 text-[#407EC9]" />
                Perhitungan terukur
              </h5>
              <ul class="text-[11px] text-slate-600 space-y-1">
                <li>• Penyaringan dataset bertahap</li>
                <li>• Perhitungan DuPont dari data fixture</li>
                <li>• Skor faktor yang tersimpan pada fixture</li>
                <li>• Pemeriksaan kelengkapan metrik minimum</li>
              </ul>
            </div>

            <div class="p-3.5 rounded-xl border border-slate-200 bg-white">
              <h5 class="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Layers class="w-3.5 h-3.5 text-emerald-600" />
                Sintesis riset
              </h5>
              <ul class="text-[11px] text-slate-600 space-y-1">
                <li>• Menyusun tujuan menjadi rencana riset</li>
                <li>• Menerapkan rule set yang dipilih pengguna</li>
                <li>• Menjelaskan alasan kandidat dipilih</li>
                <li>• Menampilkan risiko dan keterbatasan</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 4. Research Safety & Disclaimers -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div class="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
            <AlertCircle class="w-4 h-4 text-slate-500" />
            Compliance Notice
          </div>
          <p class="text-[11px] text-slate-500 leading-relaxed">
            Voyager One operates strictly as a financial research tool. It does not perform automated trade execution, buy/sell recommendations, or guaranteed return claims.
          </p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
        <button
           @click="close"
          class="px-5 py-2 text-xs font-bold text-white bg-[#407EC9] hover:bg-[#2F64A8] rounded-xl transition-colors cursor-pointer"
        >
           Tutup
        </button>
      </div>
    </div>
  </div>
</template>
