<script setup lang="ts">
defineProps<{
  source?: string
  financialPeriod?: string
  priceAsOf?: string
  generatedAt?: string
  compact?: boolean
}>()

const unavailable = 'Tidak diketahui / tidak tersedia'
</script>

<template>
  <aside
    aria-label="Asal dan periode data"
    class="rounded-xl border border-slate-200 bg-slate-50/70 text-slate-600"
    :class="compact ? 'px-3 py-2.5' : 'p-4'"
  >
    <h2 class="font-bold uppercase tracking-wider text-slate-700" :class="compact ? 'text-[10px]' : 'text-xs'">
      Asal dan periode data
    </h2>
    <dl class="mt-2 grid gap-x-5 gap-y-2" :class="compact ? 'text-[11px] sm:grid-cols-2' : 'text-xs sm:grid-cols-2'">
      <div>
        <dt class="font-semibold text-slate-500">Sumber</dt>
        <dd class="mt-0.5 font-medium text-slate-800">{{ source || unavailable }}</dd>
      </div>
      <div>
        <dt class="font-semibold text-slate-500">Periode keuangan</dt>
        <dd class="mt-0.5 font-mono text-slate-800">{{ financialPeriod || unavailable }}</dd>
      </div>
      <div>
        <dt class="font-semibold text-slate-500">Harga per tanggal</dt>
        <dd class="mt-0.5 font-mono text-slate-800">{{ priceAsOf || unavailable }}</dd>
      </div>
      <div class="border-t border-slate-200 pt-2 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <dt class="font-semibold text-slate-500">Laporan dibuat</dt>
        <dd class="mt-0.5 font-mono text-slate-800">{{ generatedAt || unavailable }}</dd>
      </div>
    </dl>
  </aside>
</template>
