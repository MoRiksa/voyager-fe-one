<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { X, ArrowUpRight, AlertTriangle, CheckCircle2, Database } from '@lucide/vue'
import { handleDialogBackdropClick } from '../utils/dialog'

const store = useResearchStore()
const dialog = ref<HTMLDialogElement>()
let previousFocus: HTMLElement | null = null

watch(() => store.isDetailModalOpen, async open => {
  if (open) {
    previousFocus = document.activeElement as HTMLElement
    await nextTick()
    dialog.value?.showModal()
  } else {
    dialog.value?.close()
    previousFocus?.focus()
  }
})
</script>

<template>
  <dialog
    ref="dialog"
    data-testid="candidate-dialog"
    :aria-labelledby="store.selectedCompany ? 'candidate-dialog-title' : undefined"
    :aria-label="store.selectedCompany ? undefined : 'Ringkasan perusahaan'"
    class="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-0 text-slate-900 shadow-2xl shadow-slate-900/15"
    @click="event => handleDialogBackdropClick(event, store.closeCandidateModal)"
    @close="store.closeCandidateModal"
    @cancel="store.closeCandidateModal"
  >
    <template v-if="store.selectedCompany">
      <!-- Sticky Modal Header -->
      <header class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur-md">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center rounded-md bg-[#244F87] px-2.5 py-0.5 font-mono text-xs font-bold text-white shadow-xs">
              #{{ store.selectedCompany.rank || '—' }} · {{ store.selectedCompany.symbol }}
            </span>
            <span v-if="store.selectedCompany.sector" class="text-xs text-slate-500 font-medium">
              {{ store.selectedCompany.sector }}
            </span>
          </div>
          <h2 id="candidate-dialog-title" class="mt-1.5 text-xl font-bold tracking-tight text-slate-950">
            {{ store.selectedCompany.symbol }} — {{ store.selectedCompany.name }}
          </h2>
        </div>

        <button
          type="button"
          autofocus
          class="button-secondary shrink-0"
          aria-label="Tutup analisis perusahaan"
          @click="store.closeCandidateModal"
        >
          <X class="h-4 w-4" />
          <span>Tutup</span>
        </button>
      </header>

      <!-- Modal Body Content -->
      <div class="space-y-5 p-6">
        <!-- Bank Evidence Preset Variant -->
        <template v-if="store.selectedCompany.formulaVersion === 'bank-evidence-v1'">
          <section class="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 transition-all">
            <h3 class="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <CheckCircle2 class="h-4 w-4 text-emerald-600 shrink-0" />
              Dasar penyertaan data
            </h3>
            <p class="mt-2 text-sm leading-6 text-slate-700">
              Data tersedia pada {{ store.selectedCompany.financialPeriod || 'periode yang tersedia' }} dan disajikan sesuai urutan market cap provider.
            </p>
          </section>

          <section class="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-amber-950">
            <h3 class="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle class="h-4 w-4 text-amber-600 shrink-0" />
              Basis yang perlu diverifikasi
            </h3>
            <p class="mt-2 text-sm leading-6">
              ROE berasal dari earnings / total equity provider yang basisnya dapat tidak cocok. Basis tanggal dan saham P/BV historis provider belum terverifikasi.
            </p>
          </section>

          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            Data tersedia dalam urutan market cap provider. ROE provider-derived-unverified dan P/BV historis provider memakai common FY; nilai tidak menentukan keanggotaan.
          </div>
        </template>

        <!-- Standard Screening Variant -->
        <template v-else>
          <section class="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
            <h3 class="font-bold text-slate-900 text-sm">Mengapa dipilih</h3>
            <p class="mt-2 text-sm leading-6 text-slate-700">{{ store.selectedCompany.whySelected }}</p>
          </section>

          <section class="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-amber-950">
            <h3 class="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle class="h-4 w-4 text-amber-600 shrink-0" />
              Risiko
            </h3>
            <ul class="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6">
              <li v-for="risk in store.selectedCompany.potentialConcerns" :key="risk">{{ risk }}</li>
              <li v-if="!store.selectedCompany.potentialConcerns.length">Risiko spesifik belum tersedia.</li>
            </ul>
          </section>

          <div class="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1A375C] flex flex-wrap items-baseline gap-1.5">
            <span class="font-bold">Skor pendukung {{ store.selectedCompany.qualityScore ?? 'Tidak tersedia' }}/100.</span>
            <span class="text-xs text-slate-600">Bukan confidence atau peluang untung.</span>
          </div>
        </template>

        <!-- Provenance & Data Origin Audit Box -->
        <div class="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div class="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Database class="h-3.5 w-3.5" />
            <span>Audit Jejak Data</span>
          </div>
          <p class="text-xs leading-6 text-slate-600 font-mono">
            FY: {{ store.selectedCompany.financialPeriod || 'Tidak tersedia' }} · Harga per: {{ store.selectedCompany.priceAsOf || 'Tidak tersedia' }}<br />
            Diambil: {{ store.selectedCompany.providerSource?.retrievedAt || 'Tidak tersedia' }}<br />
            Bukti: {{ store.selectedCompany.evidenceStatus || 'Tidak tersedia' }} · Narasi: {{ store.selectedCompany.narrativeStatus || 'Tidak tersedia' }}
          </p>
        </div>
      </div>

      <!-- Sticky Modal Footer -->
      <footer class="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/95 px-6 py-4 backdrop-blur-md">
        <button
          type="button"
          class="button-secondary"
          @click="store.closeCandidateModal"
        >
          Tutup
        </button>

        <router-link
          :to="`/research/${store.report.sessionId}/company/${store.selectedCompany.symbol}`"
          class="button-primary"
          @click="store.closeCandidateModal"
        >
          <span>Buka analisis kandidat</span>
          <ArrowUpRight class="h-4 w-4" />
        </router-link>
      </footer>
    </template>
  </dialog>
</template>
