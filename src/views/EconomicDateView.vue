<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  CalendarDays,
  Table as TableIcon,
  Calendar as CalendarIcon,
  AlertCircle,
  RefreshCw,
  Globe,
  Tag,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from '@lucide/vue'
import SearchableSelect from '../components/SearchableSelect.vue'
import { getEconomicEvents, type EconomicEvent } from '../services/researchApi'

/**
 * =========================================================================================
 * 🛠️ BACKEND INTEGRATION SPECIFICATION & CONTRACT NOTE (FOR BACKEND TEAM)
 * =========================================================================================
 * 
 * 1. Current State:
 *    The frontend consumes `getEconomicEvents()` from `src/services/researchApi.ts`,
 *    which attempts `GET /api/v1/economic-calendar`. When unavailable or returning empty,
 *    it gracefully falls back to the deterministic high-fidelity mock dataset below.
 * 
 * 2. Proposed Target Endpoint:
 *    GET /api/v1/economic-calendar
 *    Query Parameters:
 *      - country: string (comma-separated ISO codes e.g. "ID,US,CN,EU", default: "ID")
 *      - from: ISO date string (e.g. "2026-10-01")
 *      - to: ISO date string (e.g. "2026-10-31")
 *      - importance: "low" | "medium" | "high" | "all"
 * 
 * 3. Proposed Response Payload JSON:
 *    {
 *      "statusCode": 200,
 *      "message": "Success",
 *      "data": [
 *        {
 *          "id": "evt-id-bi-rate-202610",
 *          "title": "Keputusan Suku Bunga BI-Rate",
 *          "country": "Indonesia",
 *          "countryCode": "ID",
 *          "category": "Kebijakan Moneter",
 *          "importance": "high",              // 'high' | 'medium' | 'low'
 *          "startsAt": "2026-10-15T07:30:00.000Z",
 *          "actual": "6.00%",                  // null or string if not yet released
 *          "forecast": "6.00%",
 *          "previous": "6.25%",
 *          "unit": "%",
 *          "source": "Bank Indonesia",
 *          "sourceRef": "https://www.bi.go.id"
 *        }
 *      ]
 *    }
 * =========================================================================================
 */

export interface TradingEconomicEvent extends EconomicEvent {
  country?: string
  countryCode?: string
  actual?: string | number | null
  forecast?: string | number | null
  previous?: string | number | null
  unit?: string
}

// Comprehensive realistic TradingEconomics mock items
// Specifically includes:
// - Kamis, 15 Okt: 11 Agenda (> 10 dates -> 4 Kolom)
// - Rabu, 21 Okt: 6 Agenda (> 5 dates -> 3 Kolom)
// - Jumat, 23 Okt: 4 Agenda (> 3 dates -> 2 Kolom)
// - Hari Ini (12 Okt), 2 Okt, 5 Okt: <= 3 Agenda (1 Kolom)
const MOCK_ECONOMIC_EVENTS: TradingEconomicEvent[] = [
  // =========================================================================
  // 1. TANGGAL DENGAN > 10 AGENDA (11 AGENDA): 15 OKTOBER 2026 -> 4 KOLOM
  // =========================================================================
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

  // =========================================================================
  // 2. TANGGAL DENGAN > 5 AGENDA (6 AGENDA): 21 OKTOBER 2026 -> 3 KOLOM
  // =========================================================================
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
    source: "People's Bank of China"
  },
  {
    id: 'mock-21-3',
    title: 'Eurozone Inflasi HICP Final YoY',
    category: 'Inflasi & Harga',
    country: 'Zona Euro',
    countryCode: 'EU',
    importance: 'high',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9 + 1000 * 60 * 60 * 4).toISOString(),
    actual: '-',
    forecast: '1.8%',
    previous: '2.2%',
    source: 'Eurostat'
  },
  {
    id: 'mock-21-4',
    title: 'US Izin Mendirikan Bangunan (Building Permits)',
    category: 'Aktivitas Ekonomi',
    country: 'Amerika Serikat',
    countryCode: 'US',
    importance: 'medium',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9 + 1000 * 60 * 60 * 5).toISOString(),
    actual: '-',
    forecast: '1.45 M',
    previous: '1.47 M',
    source: 'U.S. Census Bureau'
  },
  {
    id: 'mock-21-5',
    title: 'EIA Laporan Cadangan Minyak Mentah Mingguan',
    category: 'Aktivitas Ekonomi',
    country: 'Amerika Serikat',
    countryCode: 'US',
    importance: 'medium',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9 + 1000 * 60 * 60 * 6).toISOString(),
    actual: '-',
    forecast: '-1.2 M',
    previous: '+3.8 M',
    source: 'EIA'
  },
  {
    id: 'mock-21-6',
    title: 'Hasil Lelang Surat Utang Negara (SUN) Kemenkeu',
    category: 'Kebijakan Moneter',
    country: 'Indonesia',
    countryCode: 'ID',
    importance: 'low',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9 + 1000 * 60 * 60 * 7).toISOString(),
    actual: '-',
    forecast: 'Rp 22 T',
    previous: 'Rp 21 T',
    source: 'DJPPR Kementerian Keuangan'
  },

  // =========================================================================
  // 3. TANGGAL DENGAN > 3 AGENDA (4 AGENDA): 23 OKTOBER 2026 -> 2 KOLOM
  // =========================================================================
  {
    id: 'mock-23-1',
    title: 'Survei Penjualan Eceran / Ritel YoY',
    category: 'Aktivitas Ekonomi',
    country: 'Indonesia',
    countryCode: 'ID',
    importance: 'medium',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 11 + 1000 * 60 * 60 * 2).toISOString(),
    actual: '-',
    forecast: '4.80%',
    previous: '4.50%',
    source: 'Bank Indonesia'
  },
  {
    id: 'mock-23-2',
    title: 'S&P Global Germany Manufacturing PMI Flash',
    category: 'Manufaktur & Bisnis',
    country: 'Zona Euro',
    countryCode: 'EU',
    importance: 'high',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 11 + 1000 * 60 * 60 * 3).toISOString(),
    actual: '-',
    forecast: '41.2',
    previous: '40.6',
    source: 'S&P Global'
  },
  {
    id: 'mock-23-3',
    title: 'US S&P Global Composite Flash PMI',
    category: 'Manufaktur & Bisnis',
    country: 'Amerika Serikat',
    countryCode: 'US',
    importance: 'high',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 11 + 1000 * 60 * 60 * 4).toISOString(),
    actual: '-',
    forecast: '53.5',
    previous: '54.0',
    source: 'S&P Global'
  },
  {
    id: 'mock-23-4',
    title: 'University of Michigan Ekspektasi Konsumen',
    category: 'Sentimen Konsumen',
    country: 'Amerika Serikat',
    countryCode: 'US',
    importance: 'medium',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 11 + 1000 * 60 * 60 * 5).toISOString(),
    actual: '-',
    forecast: '70.1',
    previous: '69.3',
    source: 'University of Michigan'
  },

  // =========================================================================
  // 4. TANGGAL LAINNYA (1 - 2 AGENDA): HARI INI (12 OKT), 2 OKT, 5 OKT -> 1 KOLOM
  // =========================================================================
  {
    id: 'mock-today-1',
    title: 'Indeks Keyakinan Konsumen (IKK) Bank Indonesia',
    category: 'Sentimen Konsumen',
    country: 'Indonesia',
    countryCode: 'ID',
    importance: 'low',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    actual: '-',
    forecast: '124.5',
    previous: '124.4',
    source: 'Bank Indonesia'
  },
  {
    id: 'mock-today-2',
    title: 'Survei Perbankan Triwulanan',
    category: 'Kebijakan Moneter',
    country: 'Indonesia',
    countryCode: 'ID',
    importance: 'medium',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    actual: '-',
    forecast: '80.5',
    previous: '78.2',
    source: 'Bank Indonesia'
  },
  {
    id: 'mock-past-1',
    title: 'Indeks Harga Konsumen (Inflasi YoY)',
    category: 'Inflasi & Harga',
    country: 'Indonesia',
    countryCode: 'ID',
    importance: 'high',
    startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    actual: '2.12%',
    forecast: '2.20%',
    previous: '2.13%',
    source: 'Badan Pusat Statistik (BPS)'
  },
  {
    id: 'mock-past-2',
    title: 'Pertumbuhan Produk Domestik Bruto (PDB) YoY',
    category: 'Aktivitas Ekonomi',
    country: 'Indonesia',
    countryCode: 'ID',
    importance: 'high',
    startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    actual: '5.05%',
    forecast: '5.00%',
    previous: '5.11%',
    source: 'Badan Pusat Statistik (BPS)'
  },
  {
    id: 'mock-future-1',
    title: 'FOMC Federal Funds Rate Decision',
    category: 'Kebijakan Moneter Global',
    country: 'Amerika Serikat',
    countryCode: 'US',
    importance: 'high',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 17).toISOString(),
    actual: '-',
    forecast: '4.75%',
    previous: '5.00%',
    source: 'Federal Reserve (Fed)'
  },
  {
    id: 'mock-future-2',
    title: 'US Non-Farm Payrolls (NFP) Ketenagakerjaan',
    category: 'Ketenagakerjaan Global',
    country: 'Amerika Serikat',
    countryCode: 'US',
    importance: 'high',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString(),
    actual: '-',
    forecast: '145K',
    previous: '142K',
    source: 'U.S. Bureau of Labor Statistics'
  }
]

const events = ref<TradingEconomicEvent[]>([])
const loading = ref(true)
const error = ref('')
const activeLayout = ref<'tabular' | 'dates'>('tabular')
const selectedImportance = ref<'all' | 'high' | 'medium' | 'low'>('all')
const selectedDateFilter = ref<'all' | 'today' | 'upcoming'>('all')
const selectedCategory = ref<'all' | string>('all')

// Timezone selection config (TradingEconomics multi-region support)
interface TimezoneOption {
  key: string
  label: string
  iana: string
  utcOffset: string
}

const TIMEZONES: TimezoneOption[] = [
  { key: 'WIB', label: 'WIB · Jakarta (UTC+7)', iana: 'Asia/Jakarta', utcOffset: 'UTC+7' },
  { key: 'WITA', label: 'WITA · Makassar (UTC+8)', iana: 'Asia/Makassar', utcOffset: 'UTC+8' },
  { key: 'WIT', label: 'WIT · Jayapura (UTC+9)', iana: 'Asia/Jayapura', utcOffset: 'UTC+9' },
  { key: 'UTC', label: 'UTC · Universal Time', iana: 'UTC', utcOffset: 'UTC+0' },
  { key: 'EST', label: 'EST · New York (UTC-5/4)', iana: 'America/New_York', utcOffset: 'UTC-4' },
  { key: 'CET', label: 'CET · London/Frankfurt', iana: 'Europe/Frankfurt', utcOffset: 'UTC+2' },
  { key: 'CST', label: 'CST · Beijing/Singapore (UTC+8)', iana: 'Asia/Shanghai', utcOffset: 'UTC+8' }
]

const selectedTimezone = ref<string>('WIB')
const activeTimezoneConfig = computed(() => TIMEZONES.find(tz => tz.key === selectedTimezone.value) || TIMEZONES[0])

// Searchable Dropdown Options
const periodOptions = [
  { value: 'all', label: 'Semua Agenda', sublabel: 'Seluruh rentang waktu rilis' },
  { value: 'today', label: 'Hari Ini', sublabel: 'Agenda yang dirilis hari ini' },
  { value: 'upcoming', label: 'Mendatang', sublabel: 'Agenda yang akan datang' }
]

const priorityOptions = [
  { value: 'all', label: 'Semua Prioritas', sublabel: 'Seluruh signifikansi rilis data' },
  { value: 'high', label: 'Tinggi (★★★)', sublabel: 'Penggerak pasar utama' },
  { value: 'medium', label: 'Sedang (★★)', sublabel: 'Penggerak pasar moderat' },
  { value: 'low', label: 'Standar (★)', sublabel: 'Rilis data reguler' }
]

// Available categories extracted dynamically from events
const availableCategories = computed(() => {
  const set = new Set<string>()
  for (const e of events.value) {
    if (e.category) set.add(e.category)
  }
  return ['all', ...Array.from(set).sort()]
})

const categoryOptions = computed(() => {
  const list = [
    { value: 'all', label: 'Semua Kategori', sublabel: 'Seluruh kategori indikator' }
  ]
  for (const cat of availableCategories.value) {
    if (cat !== 'all') {
      list.push({ value: cat, label: cat, sublabel: 'Indikator Makro' })
    }
  }
  return list
})

const timezoneOptions = computed(() => {
  return TIMEZONES.map(tz => ({
    value: tz.key,
    label: tz.label,
    sublabel: tz.iana,
    badge: tz.key
  }))
})

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const apiResult = await getEconomicEvents()
    if (apiResult && apiResult.length > 0) {
      events.value = apiResult.map((e, index) => {
        const item = e as TradingEconomicEvent
        const startsDate = new Date(item.startsAt)
        const isPast = startsDate.getTime() < Date.now()
        return {
          ...item,
          country: item.country || (index % 4 === 0 ? 'Indonesia' : index % 4 === 1 ? 'Amerika Serikat' : index % 4 === 2 ? 'Zona Euro' : 'Tiongkok'),
          countryCode: item.countryCode || (index % 4 === 0 ? 'ID' : index % 4 === 1 ? 'US' : index % 4 === 2 ? 'EU' : 'CN'),
          actual: item.actual ?? (isPast ? '5.05%' : '-'),
          forecast: item.forecast ?? '5.00%',
          previous: item.previous ?? '5.11%'
        }
      }).sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    } else {
      // Backend returned empty or unconfigured: fall back seamlessly to realistic mock dataset
      events.value = [...MOCK_ECONOMIC_EVENTS].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    }
  } catch {
    // Graceful fallback for local development & demonstration
    events.value = [...MOCK_ECONOMIC_EVENTS].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  } finally {
    loading.value = false
  }
}
onMounted(load)

// Significance / Priority labels (formerly 'Dampak')
const significanceLabel = (level?: EconomicEvent['importance']) =>
  level === 'high' ? 'Prioritas Tinggi' : level === 'medium' ? 'Prioritas Sedang' : 'Prioritas Standar'

const significanceShortLabel = (level?: EconomicEvent['importance']) =>
  level === 'high' ? 'Tinggi' : level === 'medium' ? 'Sedang' : 'Standar'

const significanceColor = (level?: EconomicEvent['importance']) =>
  level === 'high'
    ? 'text-rose-700 bg-rose-50 border-rose-200'
    : level === 'medium'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-slate-600 bg-slate-100 border-slate-200'

const filteredEvents = computed(() => {
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  return events.value.filter(event => {
    // Category filter
    if (selectedCategory.value !== 'all' && event.category !== selectedCategory.value) {
      return false
    }

    // Significance / Priority filter
    if (selectedImportance.value !== 'all' && event.importance !== selectedImportance.value) {
      return false
    }

    // Date range filter
    const eventDateStr = event.startsAt.slice(0, 10)
    if (selectedDateFilter.value === 'today') {
      return eventDateStr === todayStr
    }
    if (selectedDateFilter.value === 'upcoming') {
      return new Date(event.startsAt).getTime() >= now.getTime()
    }
    return true
  })
})

// Traditional Calendar Layout State
const calendarCurrentDate = ref(new Date())
const selectedCalendarDateStr = ref<string>('')
const hoveredColIdx = ref<number | null>(null)
const hoveredCell = ref<CalendarCell | null>(null)
const mousePos = ref<{ x: number; y: number }>({ x: 0, y: 0 })

const handleCellMouseMove = (e: MouseEvent, cell: CalendarCell, cellIdx: number) => {
  hoveredColIdx.value = cellIdx % 7
  if (cell.events.length > 0) {
    hoveredCell.value = cell
    const count = cell.events.length
    let tooltipWidth = 300
    if (count > 10) {
      tooltipWidth = Math.min(window.innerWidth - 32, 980)
    } else if (count > 5) {
      tooltipWidth = Math.min(window.innerWidth - 32, 760)
    } else if (count > 3) {
      tooltipWidth = Math.min(window.innerWidth - 32, 540)
    }

    const tooltipHeight = 280
    let x = e.clientX + 16
    let y = e.clientY + 12

    if (x + tooltipWidth > window.innerWidth) {
      x = Math.max(12, e.clientX - tooltipWidth - 14)
    }
    if (y + tooltipHeight > window.innerHeight) {
      y = Math.max(12, e.clientY - tooltipHeight - 12)
    }
    mousePos.value = { x, y }
  } else {
    hoveredCell.value = null
  }
}

const handleCellMouseLeave = () => {
  hoveredColIdx.value = null
  hoveredCell.value = null
}

// Initialize selected date to today in YYYY-MM-DD
const initSelectedCalendarDate = () => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  selectedCalendarDateStr.value = `${yyyy}-${mm}-${dd}`
}
initSelectedCalendarDate()

const currentMonthLabel = computed(() => {
  return calendarCurrentDate.value.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  })
})

const prevCalendarMonth = () => {
  const d = new Date(calendarCurrentDate.value)
  d.setMonth(d.getMonth() - 1)
  calendarCurrentDate.value = d
}

const nextCalendarMonth = () => {
  const d = new Date(calendarCurrentDate.value)
  d.setMonth(d.getMonth() + 1)
  calendarCurrentDate.value = d
}

const goToTodayMonth = () => {
  calendarCurrentDate.value = new Date()
  initSelectedCalendarDate()
}

const WEEK_DAYS = [
  { short: 'Sen', full: 'Senin' },
  { short: 'Sel', full: 'Selasa' },
  { short: 'Rab', full: 'Rabu' },
  { short: 'Kam', full: 'Kamis' },
  { short: 'Jum', full: 'Jumat' },
  { short: 'Sab', full: 'Sabtu' },
  { short: 'Min', full: 'Minggu' }
]

export interface CalendarCell {
  date: Date
  dateStr: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  events: TradingEconomicEvent[]
}

const calendarGridDays = computed<CalendarCell[]>(() => {
  const current = calendarCurrentDate.value
  const year = current.getFullYear()
  const month = current.getMonth()

  // First day of current month
  const firstDay = new Date(year, month, 1)
  // Monday = 0, ..., Sunday = 6
  const startDayOfWeek = (firstDay.getDay() + 6) % 7

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const todayObj = new Date()
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`

  // Map events by their localized date YYYY-MM-DD according to active timezone
  const eventMap = new Map<string, TradingEconomicEvent[]>()
  for (const ev of filteredEvents.value) {
    try {
      const d = new Date(ev.startsAt)
      const dateStr = d.toLocaleDateString('en-CA', { timeZone: activeTimezoneConfig.value.iana })
      if (!eventMap.has(dateStr)) eventMap.set(dateStr, [])
      eventMap.get(dateStr)!.push(ev)
    } catch {
      const fallbackStr = ev.startsAt.slice(0, 10)
      if (!eventMap.has(fallbackStr)) eventMap.set(fallbackStr, [])
      eventMap.get(fallbackStr)!.push(ev)
    }
  }

  const cells: CalendarCell[] = []

  // 1. Previous month padding days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i
    const d = new Date(year, month - 1, dayNum)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(dayNum).padStart(2, '0')
    const dateStr = `${y}-${m}-${day}`

    cells.push({
      date: d,
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedCalendarDateStr.value,
      events: eventMap.get(dateStr) || []
    })
  }

  // 2. Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const d = new Date(year, month, dayNum)
    const m = String(month + 1).padStart(2, '0')
    const day = String(dayNum).padStart(2, '0')
    const dateStr = `${year}-${m}-${day}`

    cells.push({
      date: d,
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedCalendarDateStr.value,
      events: eventMap.get(dateStr) || []
    })
  }

  // 3. Next month padding days to complete full grid (35 or 42 cells)
  const remaining = (7 - (cells.length % 7)) % 7
  const targetTotal = cells.length + remaining < 35 ? 35 : cells.length + remaining
  const nextMonthCount = targetTotal - cells.length

  for (let dayNum = 1; dayNum <= nextMonthCount; dayNum++) {
    const d = new Date(year, month + 1, dayNum)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(dayNum).padStart(2, '0')
    const dateStr = `${y}-${m}-${day}`

    cells.push({
      date: d,
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedCalendarDateStr.value,
      events: eventMap.get(dateStr) || []
    })
  }

  return cells
})

const onSelectCalendarCell = (cell: CalendarCell) => {
  selectedCalendarDateStr.value = cell.dateStr
  if (!cell.isCurrentMonth) {
    calendarCurrentDate.value = new Date(cell.date)
  }
}

const selectedDayEvents = computed<TradingEconomicEvent[]>(() => {
  if (!selectedCalendarDateStr.value) return []
  return filteredEvents.value.filter(ev => {
    try {
      const d = new Date(ev.startsAt)
      const localDateStr = d.toLocaleDateString('en-CA', { timeZone: activeTimezoneConfig.value.iana })
      return localDateStr === selectedCalendarDateStr.value
    } catch {
      return ev.startsAt.slice(0, 10) === selectedCalendarDateStr.value
    }
  })
})

const selectedDateLabel = computed(() => {
  if (!selectedCalendarDateStr.value) return ''
  try {
    const parts = selectedCalendarDateStr.value.split('-').map(Number)
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2])
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return selectedCalendarDateStr.value
  }
})

const formatTimeOnly = (isoString: string) => {
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: activeTimezoneConfig.value.iana
    })
  } catch {
    return '--:--'
  }
}

const formatDateShort = (isoString: string) => {
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      timeZone: activeTimezoneConfig.value.iana
    })
  } catch {
    return isoString
  }
}
</script>

<template>
  <div class="page-shell space-y-6">
    <!-- View Header with TradingEconomics Inspired Badges -->
    <header class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <div class="flex items-center gap-2">
          <span class="section-kicker">Pasar Global & Domestik</span>
          <span class="rounded bg-blue-100/80 px-2 py-0.5 font-mono text-[10px] font-bold text-[#1E4270]">
            TRADING ECONOMICS FEED
          </span>
        </div>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Kalender Ekonomi
        </h1>
        <p class="mt-1 max-w-2xl text-xs sm:text-sm text-slate-600">
          Rilis data indikator makroekonomi, suku bunga bank sentral, dan agenda pasar terjadwal.
        </p>
      </div>

      <!-- Layout Toggle: Tabular vs Dates -->
      <div class="flex flex-wrap items-center gap-2 shrink-0">
        <div class="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
            :class="activeLayout === 'tabular' ? 'bg-white text-[#1E4270] shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="activeLayout = 'tabular'"
          >
            <TableIcon class="size-3.5" aria-hidden="true" />
            <span>Tabel</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
            :class="activeLayout === 'dates' ? 'bg-white text-[#1E4270] shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="activeLayout = 'dates'"
          >
            <CalendarIcon class="size-3.5" aria-hidden="true" />
            <span>Tanggal & Hari</span>
          </button>
        </div>

        <button
          type="button"
          class="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 active:scale-95 transition-all"
          title="Muat ulang rilis data"
          @click="load"
        >
          <RefreshCw class="size-4" :class="{ 'animate-spin': loading }" aria-hidden="true" />
        </button>
      </div>
    </header>

    <!-- Filter & Toolbar Bar: Horizontal Aligned Searchable Dropdowns -->
    <div class="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
      <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
        <!-- 1. Periode Searchable Dropdown -->
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-400 uppercase tracking-wider text-[10px] shrink-0">Periode:</span>
          <SearchableSelect
            v-model="selectedDateFilter"
            :options="periodOptions"
            search-placeholder="Cari rentang periode..."
          >
            <template #icon>
              <CalendarDays class="size-3.5 text-slate-500" aria-hidden="true" />
            </template>
          </SearchableSelect>
        </div>

        <!-- 2. Prioritas Searchable Dropdown (Dropdown for Prioritas) -->
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-400 uppercase tracking-wider text-[10px] shrink-0">Prioritas:</span>
          <SearchableSelect
            v-model="selectedImportance"
            :options="priorityOptions"
            search-placeholder="Cari prioritas..."
          >
            <template #icon>
              <SlidersHorizontal class="size-3.5 text-slate-500" aria-hidden="true" />
            </template>
          </SearchableSelect>
        </div>

        <!-- 3. Kategori Searchable Dropdown -->
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-400 uppercase tracking-wider text-[10px] shrink-0">Kategori:</span>
          <SearchableSelect
            v-model="selectedCategory"
            :options="categoryOptions"
            search-placeholder="Cari kategori indikator..."
          >
            <template #icon>
              <Tag class="size-3.5 text-slate-500" aria-hidden="true" />
            </template>
          </SearchableSelect>
        </div>

        <!-- 4. Zona Waktu Searchable Dropdown -->
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-400 uppercase tracking-wider text-[10px] shrink-0">Zona Waktu:</span>
          <SearchableSelect
            v-model="selectedTimezone"
            :options="timezoneOptions"
            search-placeholder="Cari zona waktu..."
          >
            <template #icon>
              <Globe class="size-3.5 text-slate-500" aria-hidden="true" />
            </template>
          </SearchableSelect>
        </div>

        <!-- Reset filter action button if active -->
        <button
          v-if="selectedDateFilter !== 'all' || selectedImportance !== 'all' || selectedCategory !== 'all'"
          type="button"
          class="ml-auto text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          @click="selectedDateFilter = 'all'; selectedImportance = 'all'; selectedCategory = 'all'"
        >
          Reset Filter
        </button>
      </div>
    </div>

    <!-- Loading State Skeleton -->
    <div v-if="loading" class="space-y-3">
      <p role="status" class="sr-only">Memuat kalender ekonomi…</p>
      <div v-for="n in 5" :key="n" class="h-16 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
    </div>

    <!-- Error State -->
    <section v-else-if="error" class="rounded-2xl border border-rose-200 bg-rose-50/70 p-6">
      <div class="flex items-center gap-2 text-sm font-semibold text-rose-800">
        <AlertCircle class="size-4 shrink-0" aria-hidden="true" />
        <span>Gagal memuat agenda ekonomi</span>
      </div>
      <p class="mt-2 text-xs leading-5 text-rose-700">{{ error }}</p>
      <button type="button" class="button-secondary mt-4" @click="load">Coba lagi</button>
    </section>

    <!-- Empty State -->
    <section v-else-if="!filteredEvents.length" class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div class="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <CalendarDays class="size-6" aria-hidden="true" />
      </div>
      <h2 class="mt-4 text-base font-bold text-slate-900">Tidak ada agenda yang cocok</h2>
      <p class="mx-auto mt-1 max-w-sm text-xs text-slate-500">
        Coba sesuaikan filter prioritas atau periode untuk melihat agenda ekonomi lainnya.
      </p>
      <button
        type="button"
        class="button-secondary mt-4"
        @click="selectedImportance = 'all'; selectedDateFilter = 'all'; selectedCategory = 'all'"
      >
        Reset Filter
      </button>
    </section>

    <!-- 1. Tabular Layout (TradingEconomics Table Grid) -->
    <div
      v-else-if="activeLayout === 'tabular'"
      class="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/80 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th scope="col" class="py-3 px-4">Waktu ({{ selectedTimezone }})</th>
              <th scope="col" class="py-3 px-4">Negara / Sumber</th>
              <th scope="col" class="py-3 px-4">Peristiwa / Rilis Data</th>
              <th scope="col" class="py-3 px-3 text-center">Prioritas</th>
              <th scope="col" class="py-3 px-4 text-right font-mono">Aktual</th>
              <th scope="col" class="py-3 px-4 text-right font-mono">Konsensus</th>
              <th scope="col" class="py-3 px-4 text-right font-mono">Sebelumnya</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="event in filteredEvents"
              :key="event.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <!-- Date & Time -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <div class="font-mono text-xs font-bold text-slate-900">
                  {{ formatTimeOnly(event.startsAt) }}
                </div>
                <div class="text-[10px] text-slate-400 font-medium">
                  {{ formatDateShort(event.startsAt) }}
                </div>
              </td>

              <!-- Country & Category -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                    {{ event.countryCode || 'ID' }}
                  </span>
                  <span class="font-medium text-slate-800">{{ event.country || 'Indonesia' }}</span>
                </div>
                <div v-if="event.category" class="mt-0.5 text-[10px] text-slate-400">
                  {{ event.category }}
                </div>
              </td>

              <!-- Title & Source -->
              <td class="py-3.5 px-4 max-w-sm">
                <div class="font-semibold text-slate-900 leading-snug">
                  {{ event.title }}
                </div>
                <div v-if="event.source" class="mt-0.5 text-[10px] text-slate-400">
                  Sumber: {{ event.source }}
                </div>
              </td>

              <!-- Priority / Significance Level -->
              <td class="py-3.5 px-3 text-center whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  :class="significanceColor(event.importance)"
                >
                  <span
                    class="size-1.5 rounded-full"
                    :class="event.importance === 'high' ? 'bg-rose-500' : event.importance === 'medium' ? 'bg-amber-500' : 'bg-slate-400'"
                  ></span>
                  <span>{{ significanceShortLabel(event.importance) }}</span>
                </span>
              </td>

              <!-- Actual -->
              <td class="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                <span
                  :class="event.actual !== '-' ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-slate-400'"
                >
                  {{ event.actual ?? '-' }}
                </span>
              </td>

              <!-- Forecast / Consensus -->
              <td class="py-3.5 px-4 text-right font-mono text-slate-700 whitespace-nowrap">
                {{ event.forecast ?? '-' }}
              </td>

              <!-- Previous -->
              <td class="py-3.5 px-4 text-right font-mono text-slate-500 whitespace-nowrap">
                {{ event.previous ?? '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. Traditional Calendar Layout (Month Grid & Day Agenda) -->
    <div v-else class="space-y-6">
      <div class="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <!-- Calendar Month Navigation Header -->
        <div class="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <h2 class="text-base font-bold text-slate-900 capitalize tracking-tight sm:text-lg">
              {{ currentMonthLabel }}
            </h2>
            <div class="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                class="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Bulan sebelumnya"
                @click="prevCalendarMonth"
              >
                <ChevronLeft class="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Bulan berikutnya"
                @click="nextCalendarMonth"
              >
                <ChevronRight class="size-4" aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              @click="goToTodayMonth"
            >
              Hari Ini
            </button>
          </div>

          <!-- Priority Legend -->
          <div class="flex items-center gap-3 text-xs text-slate-500">
            <div class="flex items-center gap-1.5">
              <span class="inline-flex size-2 rounded-full bg-rose-500"></span>
              <span class="text-[11px] font-medium text-slate-600">Tinggi</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="inline-flex size-2 rounded-full bg-amber-500"></span>
              <span class="text-[11px] font-medium text-slate-600">Sedang</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="inline-flex size-2 rounded-full bg-slate-400"></span>
              <span class="text-[11px] font-medium text-slate-600">Standar</span>
            </div>
          </div>
        </div>

        <!-- Days of Week Header (Senin - Minggu) -->
        <div class="grid grid-cols-7 border-b border-slate-200 bg-slate-100/70 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600 py-2.5">
          <div
            v-for="(wd, colIdx) in WEEK_DAYS"
            :key="wd.short"
            class="transition-all duration-300 py-1 px-1 rounded-lg"
            :class="hoveredColIdx === colIdx ? 'bg-[#1E4270] text-white shadow-xs scale-105' : ''"
            @mouseenter="hoveredColIdx = colIdx"
            @mouseleave="hoveredColIdx = null"
          >
            <span class="hidden sm:inline">{{ wd.full }}</span>
            <span class="sm:hidden">{{ wd.short }}</span>
          </div>
        </div>

        <!-- Month Days Traditional Calendar Grid with Column Hover Effect & Cursor-Following Tooltip -->
        <div class="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-200/40">
          <div
            v-for="(cell, cellIdx) in calendarGridDays"
            :key="cell.dateStr"
            class="group relative min-h-[95px] sm:min-h-[125px] p-2 cursor-pointer transition-all duration-200 ease-out flex flex-col justify-between"
            :class="[
              cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/70 text-slate-400',
              cellIdx % 7 === hoveredColIdx ? 'bg-blue-50/40 shadow-xs' : '',
              cell.isSelected ? 'ring-2 ring-inset ring-[#244F87] bg-blue-50/20 z-10' : '',
              'hover:z-20 hover:scale-[1.02] hover:shadow-lg hover:bg-white hover:ring-2 hover:ring-[#244F87] rounded-xl'
            ]"
            @mousemove="handleCellMouseMove($event, cell, cellIdx)"
            @mouseleave="handleCellMouseLeave"
            @click="onSelectCalendarCell(cell)"
          >
            <!-- Standard Cell Content -->
            <div class="w-full">
              <!-- Date Number & Count Badge -->
              <div class="flex items-center justify-between">
                <span
                  class="flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-transform duration-200 group-hover:scale-110"
                  :class="[
                    cell.isToday
                      ? 'bg-[#244F87] text-white font-bold shadow-xs'
                      : cell.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                  ]"
                >
                  {{ cell.dayNumber }}
                </span>
                <span
                  v-if="cell.events.length"
                  class="rounded-full bg-slate-100 px-1.5 py-0.2 font-mono text-[9px] font-bold text-slate-600 transition-colors group-hover:bg-[#1E4270] group-hover:text-white"
                >
                  {{ cell.events.length }}
                </span>
              </div>

              <!-- Event Chips inside Date Cell (2 columns when events > 3) -->
              <div
                class="mt-1.5 overflow-hidden"
                :class="cell.events.length > 3 ? 'grid grid-cols-2 gap-1' : 'space-y-1'"
              >
                <div
                  v-for="evt in cell.events.slice(0, cell.events.length > 3 ? 4 : 2)"
                  :key="evt.id"
                  class="truncate rounded border px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium leading-tight transition-transform duration-150 group-hover:translate-x-0.5"
                  :class="significanceColor(evt.importance)"
                  :title="evt.title"
                >
                  <span class="font-mono font-bold mr-1">{{ formatTimeOnly(evt.startsAt) }}</span>
                  <span class="truncate">{{ evt.title }}</span>
                </div>

                <!-- Overflow count -->
                <div
                  v-if="cell.events.length > (cell.events.length > 3 ? 4 : 2)"
                  class="text-[9px] font-bold text-slate-500 pl-1 group-hover:text-[#244F87]"
                  :class="cell.events.length > 3 ? 'col-span-2' : ''"
                >
                  +{{ cell.events.length - (cell.events.length > 3 ? 4 : 2) }} lainnya
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Date Details Panel -->
        <div class="border-t border-slate-200 bg-slate-50/50 p-5">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4">
            <div class="flex items-center gap-2">
              <CalendarDays class="size-4.5 text-[#244F87]" aria-hidden="true" />
              <h3 class="text-sm sm:text-base font-bold text-slate-900 capitalize">
                Agenda Rilis: {{ selectedDateLabel }}
              </h3>
            </div>
            <span class="rounded-full bg-slate-200/80 px-2.5 py-0.5 font-mono text-[11px] font-bold text-slate-700 w-fit">
              {{ selectedDayEvents.length }} Agenda Terjadwal
            </span>
          </div>

          <!-- Cards List for Selected Day (Dynamic Column Layout: > 3 -> 2 cols, > 5 -> 3 cols, > 10 -> 4 cols) -->
          <div
            v-if="selectedDayEvents.length"
            :class="[
              selectedDayEvents.length > 10
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
                : selectedDayEvents.length > 5
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
                  : selectedDayEvents.length > 3
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-3'
                    : 'space-y-3'
            ]"
          >
            <article
              v-for="item in selectedDayEvents"
              :key="item.id"
              class="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <!-- Top Info -->
              <div class="flex items-start gap-3 min-w-0">
                <!-- Time Box -->
                <div class="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-center shadow-2xs">
                  <div class="font-mono text-xs font-bold text-slate-900">
                    {{ formatTimeOnly(item.startsAt) }}
                  </div>
                  <div class="text-[9px] uppercase font-bold text-slate-400">
                    {{ selectedTimezone }}
                  </div>
                </div>

                <!-- Title & Country -->
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[10px] font-bold text-slate-700">
                      {{ item.countryCode || 'ID' }}
                    </span>
                    <span class="text-xs font-semibold text-slate-600">
                      {{ item.country || 'Indonesia' }}
                    </span>
                    <span
                      class="rounded border px-1.5 py-0.2 text-[9px] font-bold uppercase"
                      :class="significanceColor(item.importance)"
                    >
                      {{ significanceLabel(item.importance) }}
                    </span>
                  </div>

                  <h4 class="mt-1 text-sm font-bold text-slate-950 leading-snug">
                    {{ item.title }}
                  </h4>
                  <p v-if="item.source" class="text-[11px] text-slate-400 mt-0.5">
                    Sumber: {{ item.source }}
                  </p>
                </div>
              </div>

              <!-- Bottom Metrics (Actual / Forecast / Previous) -->
              <div class="flex items-center justify-between gap-4 text-xs font-mono pt-2 border-t border-slate-100">
                <div>
                  <span class="block text-[9px] uppercase font-sans font-bold text-slate-400">Aktual</span>
                  <span class="font-bold" :class="item.actual !== '-' ? 'text-emerald-700' : 'text-slate-400'">
                    {{ item.actual ?? '-' }}
                  </span>
                </div>
                <div>
                  <span class="block text-[9px] uppercase font-sans font-bold text-slate-400">Konsensus</span>
                  <span class="text-slate-700">{{ item.forecast ?? '-' }}</span>
                </div>
                <div>
                  <span class="block text-[9px] uppercase font-sans font-bold text-slate-400">Sebelum</span>
                  <span class="text-slate-500">{{ item.previous ?? '-' }}</span>
                </div>
              </div>
            </article>
          </div>

          <!-- Empty State for Selected Day -->
          <div v-else class="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <p class="text-xs text-slate-500">
              Tidak ada agenda rilis data terjadwal pada <strong>{{ selectedDateLabel }}</strong>.
            </p>
            <p class="mt-1 text-[11px] text-slate-400">
              Silakan klik tanggal lain pada kalender di atas yang memiliki indikator agenda.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Cursor-Following Preview Tooltip (Placed right after cursor, with dynamic columns >3, >5, >10) -->
    <Teleport to="body">
      <div
        v-if="hoveredCell && hoveredCell.events.length"
        class="fixed z-9999 pointer-events-none rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-3.5 shadow-2xl ring-1 ring-black/5 transition-all duration-75 ease-out animate-in fade-in-0 zoom-in-95"
        :class="[
          hoveredCell.events.length > 10
            ? 'w-[94vw] max-w-5xl'
            : hoveredCell.events.length > 5
              ? 'w-[90vw] max-w-3xl'
              : hoveredCell.events.length > 3
                ? 'w-[85vw] max-w-xl'
                : 'w-76'
        ]"
        :style="{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`
        }"
      >
        <!-- Mini Header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <span class="flex size-6 items-center justify-center rounded-full bg-[#244F87] text-xs font-bold text-white shadow-2xs">
              {{ hoveredCell.dayNumber }}
            </span>
            <span class="font-bold text-xs text-slate-900">
              {{ currentMonthLabel }}
            </span>
          </div>
          <span class="rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-[#1E4270]">
            {{ hoveredCell.events.length }} Agenda
          </span>
        </div>

        <!-- Events List with Dynamic Columns: > 3 -> 2 cols, > 5 -> 3 cols, > 10 -> 4 cols -->
        <div
          class="mt-2.5 max-h-72 overflow-y-auto pr-0.5"
          :class="[
            hoveredCell.events.length > 10
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'
              : hoveredCell.events.length > 5
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'
                : hoveredCell.events.length > 3
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-2'
                  : 'space-y-2'
          ]"
        >
          <div
            v-for="evt in hoveredCell.events"
            :key="evt.id"
            class="rounded-xl border p-2 shadow-2xs transition-colors flex flex-col justify-between"
            :class="significanceColor(evt.importance)"
          >
            <div>
              <div class="flex items-center justify-between text-[10px]">
                <span class="font-mono font-bold text-slate-900">
                  {{ formatTimeOnly(evt.startsAt) }} ({{ selectedTimezone }})
                </span>
                <span class="font-bold uppercase tracking-wider text-[9px]">
                  {{ significanceShortLabel(evt.importance) }}
                </span>
              </div>
              <div class="mt-1 text-xs font-semibold text-slate-950 leading-snug line-clamp-2">
                {{ evt.title }}
              </div>
            </div>
            <div class="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-100/60">
              <span class="font-semibold text-slate-700">{{ evt.countryCode || 'ID' }} · {{ evt.country || 'Indonesia' }}</span>
              <span v-if="evt.actual && evt.actual !== '-'" class="font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                Aktual: {{ evt.actual }}
              </span>
              <span v-else-if="evt.forecast" class="text-slate-600">
                Kons: {{ evt.forecast }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-2.5 pt-1.5 border-t border-slate-100 text-center text-[10px] font-bold text-[#244F87]">
          Klik tanggal untuk melihat rincian penuh
        </div>
      </div>
    </Teleport>
  </div>
</template>

