<script setup lang="ts">
import { computed } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { formatDate, formatDateTime, sourceHost, sourceHref, sourceOriginLabel } from '../utils/presentation'
defineProps<{ source?: string; financialPeriod?: string; priceAsOf?: string; generatedAt?: string; compact?: boolean }>()
const store = useResearchStore()
const providerSources = computed(() => [...store.screeningFunnel.flatMap(stage => stage.providerSources || []), ...store.candidates.flatMap(c => c.providerSource ? [c.providerSource] : [])])
const origins = computed(() => [...new Set(providerSources.value.map(s => sourceOriginLabel(s.origin)))].join(', '))
const references = computed(() => [...new Set(providerSources.value.map(s => s.sourceRef))])
const retrieved = computed(() => [...new Set(providerSources.value.map(s => s.retrievedAt))])
const periods = computed(() => [...new Set(store.candidates.map(c => c.financialPeriod).filter(Boolean))].join(', '))
const prices = computed(() => [...new Set(store.candidates.map(c => c.priceAsOf).filter(Boolean))].join(', '))
const stale = computed(() => providerSources.value.some(source => source.origin === 'stale-cache'))
</script>
<template>
  <aside aria-label="Asal dan periode data" class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
    <h2 class="font-bold text-slate-800">Sumber dan waktu data</h2>
    <p v-if="stale" data-testid="stale-data-warning" role="alert" class="mt-2 rounded-lg bg-amber-50 p-3 text-amber-950">Salinan lama digunakan karena sumber sedang tidak tersedia. Periksa waktu pengambilan sebelum menggunakan hasil.</p>
    <dl class="mt-2 grid gap-3 sm:grid-cols-2"><div><dt>Asal</dt><dd class="font-medium text-slate-800">{{ origins || 'Tidak tersedia' }}</dd></div><div><dt>Periode keuangan</dt><dd>{{ financialPeriod || periods || 'Tidak tersedia' }}</dd></div><div><dt>Harga per tanggal</dt><dd>{{ formatDate(priceAsOf || prices) }}</dd></div><div><dt>Waktu pengambilan, bukan periode finansial</dt><dd><template v-if="retrieved.length"><time v-for="value in retrieved" :key="value" :datetime="value" class="block">{{ formatDateTime(value) }}</time></template><template v-else>Tidak tersedia</template></dd></div><div><dt>Laporan dibuat</dt><dd><time v-if="generatedAt || store.report.timestamp" :datetime="generatedAt || store.report.timestamp">{{ formatDateTime(generatedAt || store.report.timestamp) }}</time><template v-else>Belum dipublikasikan</template></dd></div></dl>
    <details v-if="references.length" class="mt-3"><summary class="min-h-10 cursor-pointer font-semibold">Referensi penyedia data</summary><ul class="space-y-2 break-words"><li v-for="reference in references" :key="reference"><a v-if="sourceHref(reference)" :href="sourceHref(reference)!" target="_blank" rel="noopener noreferrer" class="underline">Buka {{ sourceHost(reference) }}</a><span v-else>{{ reference }}</span></li></ul></details>
  </aside>
</template>
