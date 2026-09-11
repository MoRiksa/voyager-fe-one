<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
const store = useResearchStore()
const dialog = ref<HTMLDialogElement>()
let previousFocus: HTMLElement | null = null
watch(() => store.isDetailModalOpen, async open => {
  if (open) { previousFocus = document.activeElement as HTMLElement; await nextTick(); dialog.value?.showModal() }
  else { dialog.value?.close(); previousFocus?.focus() }
})
</script>
<template>
  <dialog ref="dialog" data-testid="candidate-dialog" aria-labelledby="candidate-dialog-title" class="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-900/60" @close="store.closeCandidateModal" @cancel="store.closeCandidateModal">
    <template v-if="store.selectedCompany"><div class="flex items-start justify-between gap-4"><h2 id="candidate-dialog-title" class="text-xl font-bold">{{ store.selectedCompany.symbol }} — {{ store.selectedCompany.name }}</h2><button type="button" autofocus class="button-secondary" aria-label="Tutup analisis perusahaan" @click="store.closeCandidateModal">Tutup</button></div><h3 class="mt-5 font-bold">Mengapa dipilih</h3><p class="mt-2 text-sm leading-6">{{ store.selectedCompany.whySelected }}</p><h3 class="mt-5 font-bold">Risiko</h3><ul class="mt-2 list-disc space-y-2 pl-5 text-sm leading-6"><li v-for="risk in store.selectedCompany.potentialConcerns" :key="risk">{{ risk }}</li><li v-if="!store.selectedCompany.potentialConcerns.length">Risiko spesifik belum tersedia.</li></ul><p class="mt-5 text-xs leading-6">FY: {{ store.selectedCompany.financialPeriod || 'Tidak tersedia' }} · Harga per: {{ store.selectedCompany.priceAsOf || 'Tidak tersedia' }}<br />Diambil: {{ store.selectedCompany.providerSource?.retrievedAt || 'Tidak tersedia' }}<br />Bukti: {{ store.selectedCompany.evidenceStatus || 'Tidak tersedia' }} · Narasi: {{ store.selectedCompany.narrativeStatus || 'Tidak tersedia' }}</p><p v-if="store.selectedCompany.formulaVersion === 'bank-filter-v1'" class="mt-4 text-sm">Lolos filter ROE/PBV dalam urutan market cap provider. ROE provider-derived-unverified dan P/BV historis provider memakai common FY; basis earnings, equity, dan tanggal dapat tidak cocok. Lakukan uji tuntas independen.</p><p v-else class="mt-4 text-sm">Skor pendukung {{ store.selectedCompany.qualityScore ?? 'Tidak tersedia' }}/100. Bukan confidence atau peluang untung.</p><router-link :to="`/research/${store.report.sessionId}/company/${store.selectedCompany.symbol}`" class="button-primary mt-5" @click="store.closeCandidateModal">Buka analisis kandidat</router-link></template>
  </dialog>
</template>
