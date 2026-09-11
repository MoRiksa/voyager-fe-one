<script setup lang="ts">
import { computed } from 'vue'
import { useResearchStore } from '../stores/researchStore'
defineProps<{ source?: string; financialPeriod?: string; priceAsOf?: string; generatedAt?: string; compact?: boolean }>()
const store = useResearchStore()
const providerSources = computed(() => [...store.screeningFunnel.flatMap(stage => stage.providerSources || []), ...store.candidates.flatMap(c => c.providerSource ? [c.providerSource] : [])])
const origins = computed(() => [...new Set(providerSources.value.map(s => s.origin))].join(', '))
const references = computed(() => [...new Set(providerSources.value.map(s => s.sourceRef))])
const retrieved = computed(() => [...new Set(providerSources.value.map(s => s.retrievedAt))].join(', '))
const periods = computed(() => [...new Set(store.candidates.map(c => c.financialPeriod).filter(Boolean))].join(', '))
const prices = computed(() => [...new Set(store.candidates.map(c => c.priceAsOf).filter(Boolean))].join(', '))
const stale = computed(() => providerSources.value.some(source => source.origin === 'stale-cache'))
</script>
<template>
  <aside aria-label="Asal dan periode data" class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
    <h2 class="font-bold text-slate-800">Sumber dan waktu data</h2>
    <p v-if="stale" data-testid="stale-data-warning" role="alert" class="mt-2 rounded-lg bg-amber-50 p-3 text-amber-950">Data cache lama digunakan. Periksa waktu snapshot sebelum menggunakan hasil.</p>
    <dl class="mt-2 grid gap-3 sm:grid-cols-2"><div><dt>Asal</dt><dd class="font-medium text-slate-800">{{ origins || 'Tidak tersedia' }}</dd></div><div><dt>Periode keuangan</dt><dd>{{ financialPeriod || periods || 'Tidak tersedia' }}</dd></div><div><dt>Harga per tanggal</dt><dd>{{ priceAsOf || prices || 'Tidak tersedia' }}</dd></div><div><dt>Waktu pengambilan, bukan periode finansial</dt><dd>{{ retrieved || 'Tidak tersedia' }}</dd></div><div><dt>Laporan dibuat</dt><dd>{{ generatedAt || store.report.timestamp || 'Belum dipublikasikan' }}</dd></div></dl>
    <details v-if="references.length" class="mt-3"><summary class="min-h-10 cursor-pointer font-semibold">Referensi sumber</summary><ul class="space-y-2 break-words"><li v-for="reference in references" :key="reference">{{ reference }}</li></ul></details>
  </aside>
</template>
