<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  CalendarDays,
  ArrowLeft,
  ChevronRight,
  Globe,
  Tag,
  Building2,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles
} from '@lucide/vue'
import { getEconomicEvents, type EconomicEvent } from '../../services/researchApi'

interface TradingEconomicEvent extends EconomicEvent {
  country?: string
  countryCode?: string
  actual?: string | number | null
  forecast?: string | number | null
  previous?: string | number | null
  unit?: string
}

const route = useRoute()
const router = useRouter()

const targetDateStr = computed(() => {
  return typeof route.query.date === 'string' && route.query.date ? route.query.date : ''
})

const targetEventId = computed(() => {
  return typeof route.query.id === 'string' && route.query.id ? route.query.id : ''
})

const events = ref<TradingEconomicEvent[]>([])
const loading = ref(true)

// High fidelity mock items (matching EconomicDateView dataset)
const MOCK_DETAIL_EVENTS: TradingEconomicEvent[] = [
  {
    id: 'mock-15-1',
    title: 'Keputusan Suku Bunga Acuan BI-Rate',
    category: 'Kebijakan Moneter',
    country: 'Indonesia',
    countryCode: 'ID',
    importance: 'high',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 2).toISOString(),
    actual: '-',
    forecast: '6.00%',
    previous: '6.25%',
    source: 'Bank Indonesia (BI)'
  },
  {
    id: 'mock-15-2',
    title: 'Konferensi Pers & Outlook Ekonomi Dewan Gubernur BI',
    category: 'Kebijakan Moneter',
    country: 'Indonesia',
    countryCode: 'ID',
    importance: 'high',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 3).toISOString(),
    actual: '-',
    forecast: '-',
    previous: '-',
    source: 'Bank Indonesia'
  },
  {
    id: 'mock-15-3',
    title: 'Neraca Perdagangan Ekspor & Impor Barang (USD)',
    category: 'Neraca Eksternal',
    country: 'Indonesia',
    countryCode: 'ID',
    importance: 'high',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 4).toISOString(),
    actual: '-',
    forecast: '$2.85 B',
    previous: '$2.90 B',
    source: 'Badan Pusat Statistik (BPS)'
  },
  {
    id: 'mock-15-4',
    title: 'Statistik Utang Luar Negeri (ULN) Indonesia',
    category: 'Neraca Eksternal',
    country: 'Indonesia',
    countryCode: 'ID',
    importance: 'medium',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 5).toISOString(),
    actual: '-',
    forecast: '$408.5 B',
    previous: '$407.2 B',
    source: 'Bank Indonesia'
  },
  {
    id: 'mock-15-5',
    title: 'Posisi Cadangan Devisa Resmi RI',
    category: 'Likuiditas Valas',
    country: 'Indonesia',
    countryCode: 'ID',
    importance: 'medium',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 6).toISOString(),
    actual: '-',
    forecast: '$150.2 B',
    previous: '$149.8 B',
    source: 'Bank Indonesia'
  },
  {
    id: 'mock-15-6',
    title: 'UK Manufacturing & Industrial Production MoM',
    category: 'Manufaktur & Bisnis',
    country: 'Inggris',
    countryCode: 'GB',
    importance: 'medium',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 7).toISOString(),
    actual: '-',
    forecast: '0.2%',
    previous: '-0.8%',
    source: 'Office for National Statistics'
  },
  {
    id: 'mock-15-7',
    title: 'ECB Main Refinancing Rate Decision',
    category: 'Kebijakan Moneter Global',
    country: 'Zona Euro',
    countryCode: 'EU',
    importance: 'high',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 8).toISOString(),
    actual: '-',
    forecast: '3.40%',
    previous: '3.65%',
    source: 'European Central Bank'
  },
  {
    id: 'mock-15-8',
    title: 'ECB Monetary Policy Statement & Press Briefing',
    category: 'Kebijakan Moneter Global',
    country: 'Zona Euro',
    countryCode: 'EU',
    importance: 'high',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 9).toISOString(),
    actual: '-',
    forecast: '-',
    previous: '-',
    source: 'European Central Bank'
  },
  {
    id: 'mock-15-9',
    title: 'US Initial Jobless Claims Mingguan',
    category: 'Ketenagakerjaan Global',
    country: 'Amerika Serikat',
    countryCode: 'US',
    importance: 'high',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 10).toISOString(),
    actual: '-',
    forecast: '215K',
    previous: '219K',
    source: 'U.S. Department of Labor'
  },
  {
    id: 'mock-15-10',
    title: 'US Philadelphia Fed Manufacturing Index',
    category: 'Manufaktur & Bisnis',
    country: 'Amerika Serikat',
    countryCode: 'US',
    importance: 'medium',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 11).toISOString(),
    actual: '-',
    forecast: '4.2',
    previous: '1.7',
    source: 'Federal Reserve of Philadelphia'
  },
  {
    id: 'mock-15-11',
    title: 'US EIA Natural Gas Storage Change',
    category: 'Manufaktur & Bisnis',
    country: 'Amerika Serikat',
    countryCode: 'US',
    importance: 'low',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 12).toISOString(),
    actual: '-',
    forecast: '78 Bcf',
    previous: '82 Bcf',
    source: 'Energy Information Administration'
  },
  {
    id: 'mock-21-1',
    title: 'Perkembangan Uang Beredar (M2) Bank Indonesia',
    category: 'Kebijakan Moneter',
    country: 'Indonesia',
    countryCode: 'ID',
    importance: 'medium',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9 + 1000 * 60 * 60 * 2).toISOString(),
    actual: '-',
    forecast: '7.2%',
    previous: '6.8%',
    source: 'Bank Indonesia'
  },
  {
    id: 'mock-21-2',
    title: 'China People Bank Loan Prime Rate 1-Year & 5-Year',
    category: 'Kebijakan Moneter Global',
    country: 'Tiongkok',
    countryCode: 'CN',
    importance: 'high',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9 + 1000 * 60 * 60 * 3).toISOString(),
    actual: '-',
    forecast: '3.10%',
    previous: '3.35%',
    source: "People's Bank of China (PBOC)"
  },
  {
    id: 'mock-23-1',
    title: 'Survei Kegiatan Dunia Usaha (SKDU) Bank Indonesia',
    category: 'Aktivitas Ekonomi',
    country: 'Indonesia',
    countryCode: 'ID',
    importance: 'medium',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 11 + 1000 * 60 * 60 * 2).toISOString(),
    actual: '-',
    forecast: '14.5%',
    previous: '13.8%',
    source: 'Bank Indonesia'
  },
  {
    id: 'mock-today-1',
    title: 'Indeks Keyakinan Konsumen (IKK) Bank Indonesia',
    category: 'Sentimen Konsumen',
    country: 'Indonesia',
    countryCode: 'ID',
    importance: 'high',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    actual: '124.4',
    forecast: '123.8',
    previous: '123.5',
    source: 'Bank Indonesia (BI)'
  }
]

onMounted(async () => {
  try {
    const data = await getEconomicEvents()
    if (data && data.length > 0) {
      events.value = data as TradingEconomicEvent[]
    } else {
      events.value = MOCK_DETAIL_EVENTS
    }
  } catch {
    events.value = MOCK_DETAIL_EVENTS
  } finally {
    loading.value = false
  }
})

const displayEvents = computed(() => {
  if (targetEventId.value) {
    const exact = events.value.filter(e => e.id === targetEventId.value)
    if (exact.length) return exact
  }
  if (targetDateStr.value) {
    return events.value.filter(e => e.startsAt.slice(0, 10) === targetDateStr.value)
  }
  return events.value
})

const formattedDateTitle = computed(() => {
  if (!targetDateStr.value) {
    return 'Semua Rincian Agenda Ekonomi'
  }
  try {
    const parts = targetDateStr.value.split('-').map(Number)
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2])
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return targetDateStr.value
  }
})

const significanceLabel = (level?: EconomicEvent['importance']) =>
  level === 'high' ? 'Prioritas Tinggi' : level === 'medium' ? 'Prioritas Sedang' : 'Prioritas Standar'

const significanceColor = (level?: EconomicEvent['importance']) =>
  level === 'high'
    ? 'text-rose-700 bg-rose-50 border-rose-200'
    : level === 'medium'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-slate-600 bg-slate-100 border-slate-200'
</script>

<template>
  <div class="page-shell space-y-6">
    <!-- Top Action & Navigation Bar -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#244F87] hover:text-[#244F87] shadow-2xs"
          aria-label="Kembali ke kalender ekonomi"
          @click="router.push('/economic-calendar')"
        >
          <ArrowLeft class="size-4" />
        </button>
        <div>
          <div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <router-link to="/economic-calendar" class="hover:underline hover:text-[#244F87]">
              Kalender Ekonomi
            </router-link>
            <ChevronRight class="size-3" />
            <span>Rincian Penuh</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            {{ formattedDateTitle }}
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="rounded-full bg-blue-50 px-3 py-1 font-mono text-xs font-bold text-[#1E4270] border border-blue-200">
          {{ displayEvents.length }} Agenda Ditemukan
        </span>
      </div>
    </div>

    <!-- Content State: Loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
    </div>

    <!-- Content State: Detailed Events List -->
    <div v-else-if="displayEvents.length" class="space-y-4">
      <article
        v-for="item in displayEvents"
        :key="item.id"
        class="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition-all"
      >
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <!-- Main Left Details -->
          <div class="space-y-2 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
                {{ item.countryCode || 'ID' }} · {{ item.country || 'Indonesia' }}
              </span>
              <span
                class="rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                :class="significanceColor(item.importance)"
              >
                {{ significanceLabel(item.importance) }}
              </span>
              <span class="rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {{ item.category }}
              </span>
            </div>

            <h2 class="text-lg font-bold text-slate-900">
              {{ item.title }}
            </h2>

            <p class="text-xs text-slate-500 leading-relaxed max-w-3xl">
              Agenda indikator ekonomi makro resmi yang dirilis secara berkala untuk analisis moneter, likuiditas pasar, dan sentimen proyeksi bisnis.
            </p>

            <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <div class="flex items-center gap-1.5 font-mono">
                <Clock class="size-3.5 text-slate-400" />
                <span>{{ new Date(item.startsAt).toLocaleString('id-ID') }}</span>
              </div>
              <div v-if="item.source" class="flex items-center gap-1.5">
                <Building2 class="size-3.5 text-slate-400" />
                <span>Sumber: {{ item.source }}</span>
              </div>
            </div>
          </div>

          <!-- Right Metrics Box -->
          <div class="shrink-0 rounded-xl border border-slate-100 bg-slate-50/80 p-4 min-w-[240px]">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-200/80 mb-3">
              Indikator & Konsensus
            </div>

            <div class="grid grid-cols-3 gap-3 text-center font-mono">
              <div class="rounded-lg bg-white p-2 border border-slate-200/70 shadow-2xs">
                <span class="block text-[9px] uppercase font-sans font-bold text-slate-400">Aktual</span>
                <span class="font-bold text-sm" :class="item.actual && item.actual !== '-' ? 'text-emerald-700' : 'text-slate-400'">
                  {{ item.actual || '-' }}
                </span>
              </div>
              <div class="rounded-lg bg-white p-2 border border-slate-200/70 shadow-2xs">
                <span class="block text-[9px] uppercase font-sans font-bold text-slate-400">Konsensus</span>
                <span class="font-bold text-sm text-slate-800">
                  {{ item.forecast || '-' }}
                </span>
              </div>
              <div class="rounded-lg bg-white p-2 border border-slate-200/70 shadow-2xs">
                <span class="block text-[9px] uppercase font-sans font-bold text-slate-400">Sebelum</span>
                <span class="font-bold text-sm text-slate-500">
                  {{ item.previous || '-' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- Empty State -->
    <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <CalendarDays class="mx-auto size-8 text-slate-400" />
      <h3 class="mt-3 text-base font-bold text-slate-900">Agenda Tidak Ditemukan</h3>
      <p class="mt-1 text-xs text-slate-500">
        Tidak ada agenda rilis yang sesuai dengan parameter rincian yang dipilih.
      </p>
      <button
        type="button"
        class="button-secondary mt-4"
        @click="router.push('/economic-calendar')"
      >
        Kembali ke Kalender Ekonomi
      </button>
    </div>
  </div>
</template>
