<script setup lang="ts">
import { computed } from 'vue'
import type { CandidateCompany } from '../types'
import { useResearchStore } from '../stores/researchStore'
import { evidenceStatusLabel, financialPeriodAge, formatDate, formatDateTime, sourceOriginLabel } from '../utils/presentation'
import { AlertTriangle, ArrowUpRight, ChevronDown } from '@lucide/vue'
import { calculateFearGreed } from '../utils/fearGreedEngine'

const props = defineProps<{ candidate: CandidateCompany }>()
const store = useResearchStore()
const bank = computed(() => props.candidate.formulaVersion === 'bank-evidence-v1')
const fearGreed = computed(() => calculateFearGreed(props.candidate.symbol, props.candidate.priceIdr || 5000))
const metric = (value: number | undefined, suffix = '') => Number.isFinite(value) 
  ? `${value!.toLocaleString('id-ID', { maximumFractionDigits: 2 })}${suffix}` 
  : 'Tidak tersedia'
</script>

<template>
  <article class="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all">
    <div>
      <!-- Company Header -->
      <header class="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center rounded-md bg-[#244F87] px-2.5 py-0.5 font-mono text-xs font-bold text-white shadow-xs">
              #{{ candidate.rank }} · {{ candidate.symbol }}
            </span>
            <span class="text-xs font-medium text-slate-500 truncate">
              {{ candidate.sector }}
            </span>
          </div>
          <h3 class="mt-1.5 text-lg font-bold tracking-tight text-slate-950 truncate">
            {{ candidate.name }}
          </h3>
        </div>
      </header>

      <!-- Bank Evidence Section (Flagship Financial Highlight with Blue Theme) -->
      <div v-if="bank" class="my-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div class="flex items-center justify-between border-b border-[#1E4270] bg-[#244F87] px-3.5 py-2 text-white">
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span class="font-mono text-xs font-bold tracking-wider">BUKTI DATA BANK</span>
          </div>
          <span class="font-mono text-[11px] text-blue-100">Top-8 Cap Provider</span>
        </div>

        <div class="grid grid-cols-2 gap-3 bg-slate-50/70 p-3.5 sm:grid-cols-3 lg:grid-cols-5">
          <div class="min-w-0">
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#2F64A8]">ROE (Penyedia)</span>
            <p class="mt-0.5 font-mono text-lg font-bold tabular-nums text-[#1A375C]">
              {{ metric(candidate.roePercent, '%') }}
            </p>
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#2F64A8]">P/BV Historis</span>
            <p 
              class="mt-0.5 font-mono text-lg font-bold tabular-nums"
              :class="candidate.pbvRatio && candidate.pbvRatio < 0 ? 'text-rose-700' : 'text-[#1A375C]'"
            >
              {{ metric(candidate.pbvRatio, 'x') }}
            </p>
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#2F64A8]">Urutan Cap</span>
            <p class="mt-0.5 font-mono text-lg font-bold tabular-nums text-[#1A375C]">
              #{{ candidate.rank }}
            </p>
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#2F64A8]">Periode FY</span>
            <p class="mt-0.5 font-mono text-sm font-bold tabular-nums text-[#1A375C] truncate">
              {{ candidate.financialPeriod || '—' }}
            </p>
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#2F64A8]">Fear & Greed</span>
            <div class="mt-0.5 flex flex-wrap items-baseline gap-1.5">
              <p class="font-mono text-lg font-bold tabular-nums text-[#1A375C]">
                {{ fearGreed.score }}<span class="text-xs font-normal text-slate-500">/100</span>
              </p>
              <span class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold" :style="{ backgroundColor: `${fearGreed.color}15`, color: fearGreed.color }">
                <span class="size-1.5 rounded-full" :style="{ backgroundColor: fearGreed.color }"></span>
                {{ fearGreed.classification }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Standard Stock Analysis Metric Shelf -->
      <div v-else class="my-4 grid grid-cols-2 gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div class="min-w-0">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#2F64A8]">ROE</span>
          <p class="mt-0.5 font-mono text-base font-bold tabular-nums text-[#1A375C]">{{ metric(candidate.roePercent, '%') }}</p>
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#2F64A8]">P/E</span>
          <p class="mt-0.5 font-mono text-base font-bold tabular-nums text-[#1A375C]">{{ metric(candidate.peRatio, 'x') }}</p>
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#2F64A8]">Debt/Equity</span>
          <p class="mt-0.5 font-mono text-base font-bold tabular-nums text-[#1A375C]">{{ metric(candidate.debtToEquity, 'x') }}</p>
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#2F64A8]">FCF Yield</span>
          <p class="mt-0.5 font-mono text-base font-bold tabular-nums text-[#1A375C]">{{ metric(candidate.freeCashFlowYieldPercent, '%') }}</p>
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#2F64A8]">Fear & Greed</span>
          <div class="mt-0.5 flex flex-wrap items-baseline gap-1.5">
            <p class="font-mono text-base font-bold tabular-nums text-[#1A375C]">
              {{ fearGreed.score }}<span class="text-xs font-normal text-slate-500">/100</span>
            </p>
            <span class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold" :style="{ backgroundColor: `${fearGreed.color}15`, color: fearGreed.color }">
              <span class="size-1.5 rounded-full" :style="{ backgroundColor: fearGreed.color }"></span>
              {{ fearGreed.classification }}
            </span>
          </div>
        </div>
      </div>

      <!-- Why Selected Reason -->
      <section class="mt-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700">
          {{ bank ? 'Mengapa data ini ditampilkan' : 'Mengapa perusahaan ini dipilih' }}
        </h4>
        <p class="mt-1.5 text-sm leading-6 text-slate-700">
          {{ bank ? `Data ${candidate.symbol} tersedia pada ${candidate.financialPeriod || 'periode yang tersedia'} dan diurutkan berdasarkan kapitalisasi pasar dari penyedia data.` : candidate.whySelected }}
        </p>
      </section>

      <!-- Verification Basis Notice -->
      <section class="mt-3 rounded-xl border border-amber-300/80 bg-amber-50/70 p-3.5 text-xs sm:text-sm leading-6 text-amber-950">
        <h4 class="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-amber-900">
          <AlertTriangle class="h-3.5 w-3.5 shrink-0 text-amber-700" />
          <span>Basis yang perlu diverifikasi</span>
        </h4>
        <template v-if="bank">
          <p class="mt-1 text-xs sm:text-sm leading-5 text-amber-950">
            ROE berasal dari earnings / total equity provider yang basisnya dapat tidak cocok. Basis tanggal dan saham P/BV historis provider belum terverifikasi.
          </p>
        </template>
        <ul v-else class="mt-1 list-disc pl-4 text-xs leading-5 text-amber-950 space-y-1">
          <li v-for="risk in candidate.potentialConcerns" :key="risk">{{ risk }}</li>
          <li v-if="!candidate.potentialConcerns.length">Risiko spesifik belum tersedia; bukan berarti tidak ada risiko.</li>
        </ul>
      </section>

      <!-- Data Age Warning -->
      <p v-if="financialPeriodAge(candidate.financialPeriod, store.report.timestamp)" class="mt-3 rounded-lg border border-amber-300 bg-amber-50/90 p-3 text-xs font-medium leading-5 text-amber-950">
        {{ financialPeriodAge(candidate.financialPeriod, store.report.timestamp) }} Periksa laporan yang lebih baru sebelum membandingkan angka.
      </p>

      <!-- Provenance Data DL -->
      <dl class="mt-4 grid grid-cols-2 gap-2.5 rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 text-xs leading-5">
        <div>
          <dt class="text-[11px] font-medium text-slate-500">Periode keuangan</dt>
          <dd class="font-mono font-medium text-slate-900">{{ candidate.financialPeriod || 'Tidak tersedia' }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-medium text-slate-500">Harga per tanggal</dt>
          <dd class="font-mono font-medium text-slate-900">
            <time v-if="candidate.priceAsOf" :datetime="candidate.priceAsOf">{{ formatDate(candidate.priceAsOf) }}</time>
            <template v-else>Tidak tersedia</template>
          </dd>
        </div>
        <div>
          <dt class="text-[11px] font-medium text-slate-500">Asal data</dt>
          <dd class="font-medium text-slate-900">{{ sourceOriginLabel(candidate.sourceOrigin) }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-medium text-slate-500">Diambil</dt>
          <dd class="font-mono font-medium text-slate-900">
            <time v-if="candidate.providerSource?.retrievedAt" :datetime="candidate.providerSource.retrievedAt">{{ formatDateTime(candidate.providerSource.retrievedAt) }}</time>
            <template v-else>Tidak tersedia</template>
          </dd>
        </div>
      </dl>

      <p class="mt-3 text-xs leading-5 text-slate-500">
        {{ evidenceStatusLabel(candidate.evidenceStatus) }}. {{ candidate.narrativeStatus === 'unavailable' ? 'Ringkasan otomatis tidak tersedia.' : 'Status ringkasan tidak tersedia.' }}
      </p>

      <!-- Technical Breakdown Accordion -->
      <details class="group mt-4 border-t border-slate-100 pt-3">
        <summary class="flex min-h-11 cursor-pointer items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors">
          <span>{{ bank ? 'Data ROE dan P/BV · lihat basis' : `Skor pendukung: ${metric(candidate.qualityScore)}/100 · lihat metrik` }}</span>
          <ChevronDown class="h-3.5 w-3.5 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
        </summary>

        <div class="mt-2 space-y-3 pb-2">
          <dl v-if="bank" class="grid grid-cols-2 gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <div>
              <dt class="text-slate-500">ROE dari data penyedia; basis belum diverifikasi</dt>
              <dd class="font-mono font-bold text-slate-900">{{ metric(candidate.roePercent, '%') }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">P/BV historis; basis belum diverifikasi</dt>
              <dd class="font-mono font-bold text-slate-900">{{ metric(candidate.pbvRatio, 'x') }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Periode tahunan yang sama</dt>
              <dd class="font-mono font-bold text-slate-900">{{ candidate.financialPeriod || 'Tidak tersedia' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Urutan data</dt>
              <dd class="font-mono font-bold text-slate-900">#{{ candidate.rank }} berdasarkan kapitalisasi pasar</dd>
            </div>
          </dl>

          <dl v-else class="grid grid-cols-2 gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <div>
              <dt class="text-slate-500">ROE</dt>
              <dd class="font-mono font-bold text-slate-900">{{ metric(candidate.roePercent, '%') }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">P/E</dt>
              <dd class="font-mono font-bold text-slate-900">{{ metric(candidate.peRatio, 'x') }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Debt/Equity</dt>
              <dd class="font-mono font-bold text-slate-900">{{ metric(candidate.debtToEquity, 'x') }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">FCF yield</dt>
              <dd class="font-mono font-bold text-slate-900">{{ metric(candidate.freeCashFlowYieldPercent, '%') }}</dd>
            </div>
          </dl>

          <p data-testid="metric-guide" class="text-xs leading-5 text-slate-500">
            <template v-if="bank">
              Data ditampilkan sesuai urutan kapitalisasi pasar dari penyedia. Nilai ROE dan P/BV tidak menentukan apakah bank ditampilkan. Basis laba, ekuitas, tanggal, dan jumlah saham belum diverifikasi.
            </template>
            <template v-else>
              {{ candidate.formulaVersion || 'Formula tidak tersedia' }}. Skor heuristik tiga faktor, bukan peluang untung atau tingkat keyakinan. FCF bukan faktor skor; FCF negatif tetap dapat memperoleh skor tinggi. FCF yield memakai FCF FY dan kapitalisasi snapshot.
            </template>
          </p>
        </div>
      </details>
    </div>

    <!-- Card Action Buttons -->
    <div class="mt-4 flex flex-wrap items-center gap-2.5 border-t border-slate-100 pt-4 print:hidden">
      <button type="button" class="button-secondary flex-1 sm:flex-initial" @click="store.openCandidateModal(candidate.symbol)">
        Ringkasan
      </button>
      <router-link :to="`/research/${store.report.sessionId}/company/${candidate.symbol}`" class="button-secondary flex-1 sm:flex-initial flex items-center justify-center gap-1.5">
        <span>Analisis lengkap</span>
        <ArrowUpRight class="h-3.5 w-3.5 text-slate-500" />
      </router-link>
    </div>
  </article>
</template>
