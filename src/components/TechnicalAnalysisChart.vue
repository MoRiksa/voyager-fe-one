<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import {
  createChart,
  CandlestickSeries,
  BarSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  ColorType,
  LineStyle,
  CrosshairMode,
  PriceScaleMode,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type IPriceLine
} from 'lightweight-charts'
import {
  getCompanyCandles,
  INTERVALS,
  type OhlcvBar,
  type ChartInterval,
  type RangeKey
} from '../services/marketDataService'
import {
  detectOrderBlocks,
  type OrderBlockResult
} from '../utils/orderBlockDetector'
import {
  Activity,
  Maximize2,
  Minimize2,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  RotateCcw,
  MousePointer,
  Minus,
  Square,
  Ruler,
  Magnet,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  X,
  Check,
  TrendingUp,
  Sliders,
  Type,
  ArrowDownToLine,
  Layers
} from '@lucide/vue'

const props = defineProps<{
  symbol: string
  currentPrice: number
}>()

// Root container & chart references
const chartWrapper = ref<HTMLDivElement | null>(null)
const chartContainer = ref<HTMLDivElement | null>(null)
let chart: IChartApi | null = null
let mainSeries: ISeriesApi<any> | null = null
let volumeSeries: ISeriesApi<'Histogram'> | null = null
let ma20Series: ISeriesApi<'Line'> | null = null
let ma50Series: ISeriesApi<'Line'> | null = null
let priceLines: IPriceLine[] = []
let resizeObserver: ResizeObserver | null = null

// Viewport state
const isFullscreen = ref(false)
const chartType = ref<'candlestick' | 'bar' | 'line' | 'area'>('candlestick')
const selectedInterval = ref<ChartInterval>('1D')
const selectedRange = ref<RangeKey>('6M')
const scaleMode = ref<'normal' | 'log' | 'percentage'>('normal')
const isIntervalDropdownOpen = ref(false)
const isChartTypeDropdownOpen = ref(false)
const isIndicatorModalOpen = ref(false)
const isLoading = ref(false)

// Indicators visibility & parameters
const showOrderBlocks = ref(false)
const showCandleObText = ref(false)
const showBearishTopGuide = ref(false)
const showMovingAverages = ref(true)
const showVolume = ref(true)
const obLength = ref(5)
const obMitigation = ref<'Wick' | 'Close'>('Wick')
const obMaxBull = ref(3)
const obMaxBear = ref(3)

// Drawing Tools State
type DrawingTool = 'cursor' | 'trendline' | 'horizontal' | 'rectangle' | 'ruler'
const activeTool = ref<DrawingTool>('cursor')
const magnetMode = ref(false)

// User Drawings Data Structures
interface UserDrawing {
  id: string
  tool: DrawingTool
  x1: number
  y1: number
  x2: number
  y2: number
  price1?: number
  price2?: number
  text?: string
}

const drawings = ref<UserDrawing[]>([])
const currentDrawing = ref<UserDrawing | null>(null)
const isDrawing = ref(false)

// Hover Candle state for legend
const hoverBar = ref<OhlcvBar | null>(null)
const candleData = ref<OhlcvBar[]>([])
const obAnalysis = ref<OrderBlockResult | null>(null)

// Formatters
const formatPrice = (val: number) => Math.round(val).toLocaleString('id-ID')
const formatVolume = (val: number) => {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(2)}B`
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`
  return `${val}`
}

const MONTH_NAMES_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const parseChartTimeToDate = (time: any): Date => {
  if (typeof time === 'number') {
    return new Date(time * 1000)
  }
  if (typeof time === 'string') {
    const parts = time.split('-')
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    }
    return new Date(time)
  }
  if (time && typeof time === 'object' && 'year' in time) {
    return new Date(time.year, time.month - 1, time.day)
  }
  return new Date()
}

const isIntradayInterval = (interval: ChartInterval): boolean => {
  return ['1m', '5m', '15m', '30m', '1h', '4h'].includes(interval)
}

const formatTimeScaleTick = (time: any, tickMarkType: number, interval: ChartInterval): string => {
  const d = parseChartTimeToDate(time)
  const monthName = MONTH_NAMES_ID[d.getMonth()]
  const day = d.getDate()
  const year = d.getFullYear()

  // 1. Weekly interval: dynamically show week (W1, W2, etc.)
  if (interval === '1W') {
    const weekNum = Math.ceil(day / 7)
    if (weekNum === 1 || tickMarkType === 0 || tickMarkType === 1) {
      return `W1 ${monthName}`
    }
    return `W${weekNum} ${monthName}`
  }

  // 2. Daily interval: dynamically show day number and month (e.g. 10 Mar, 11 Mar)
  if (interval === '1D') {
    if (tickMarkType === 0) {
      return `${monthName} '${String(year).slice(-2)}`
    }
    return `${day} ${monthName}`
  }

  // 3. Monthly interval: show Month and Year
  if (interval === '1M') {
    if (tickMarkType === 0) {
      return `${year}`
    }
    return `${monthName} '${String(year).slice(-2)}`
  }

  // 4. Intraday intervals (1m, 5m, 15m, 30m, 1h, 4h):
  if (tickMarkType === 0 || tickMarkType === 1 || tickMarkType === 2) {
    return `${day} ${monthName}`
  }
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

const formatActiveCandleDate = (time: any, interval: ChartInterval): string => {
  if (!time) return ''
  const d = parseChartTimeToDate(time)
  const monthName = MONTH_NAMES_ID[d.getMonth()]
  const day = d.getDate()
  const year = d.getFullYear()

  if (interval === '1W') {
    const weekNum = Math.ceil(day / 7)
    return `W${weekNum} ${monthName} ${year}`
  }
  if (interval === '1M') {
    return `${monthName} ${year}`
  }
  if (isIntradayInterval(interval)) {
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${day} ${monthName} ${year} ${hh}:${mm}`
  }
  return `${day} ${monthName} ${year}`
}

const activeCandle = computed(() => {
  if (hoverBar.value) return hoverBar.value
  if (candleData.value.length > 0) return candleData.value[candleData.value.length - 1]
  return null
})

const priceChange = computed(() => {
  if (!activeCandle.value) return { diff: 0, percent: 0 }
  const diff = activeCandle.value.close - activeCandle.value.open
  const percent = (diff / activeCandle.value.open) * 100
  return { diff, percent }
})

// Calculate Moving Averages
const calculateMaSeries = (data: OhlcvBar[], period: number) => {
  const result: { time: any; value: number }[] = []
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close
    }
    result.push({
      time: data[i].time,
      value: Math.round(sum / period)
    })
  }
  return result
}

// Clear all active price lines (Order Blocks)
const clearPriceLines = () => {
  if (mainSeries) {
    priceLines.forEach(line => {
      try {
        mainSeries?.removePriceLine(line)
      } catch {
        // ignore
      }
    })
  }
  priceLines = []
}

// Render Order Block levels
const renderOrderBlocks = () => {
  clearPriceLines()
  if (!mainSeries) return

  // If none of the order block features are active, clear all markers and return immediately (clean chart)
  if ((!showOrderBlocks.value && !showBearishTopGuide.value && !showCandleObText.value) || !obAnalysis.value) {
    try { createSeriesMarkers(mainSeries, []) } catch {}
    return
  }

  const { activeBullish, activeBearish, pivotMarkers } = obAnalysis.value

  // Bullish OBs (Demand Zones) - only if showOrderBlocks is explicitly enabled
  if (showOrderBlocks.value) {
    activeBullish.forEach(ob => {
      if (!mainSeries) return
      const topLine = mainSeries.createPriceLine({
        price: ob.top,
        color: '#10B981',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Bullish OB Top'
      })
      const btmLine = mainSeries.createPriceLine({
        price: ob.bottom,
        color: '#10B981',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: 'Bullish OB Btm'
      })
      const midLine = mainSeries.createPriceLine({
        price: ob.avg,
        color: '#059669',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: false,
        title: 'Mid'
      })
      priceLines.push(topLine, btmLine, midLine)
    })
  }

  // Bearish OBs (Supply Zones)
  activeBearish.forEach(ob => {
    if (!mainSeries) return
    // Bearish Top Guide: controlled by showBearishTopGuide toggle
    if (showBearishTopGuide.value) {
      const topLine = mainSeries.createPriceLine({
        price: ob.top,
        color: '#F43F5E',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: 'Bearish OB Top'
      })
      priceLines.push(topLine)
    }
    // Bearish Bottom and Mid: only if showOrderBlocks is explicitly enabled
    if (showOrderBlocks.value) {
      const btmLine = mainSeries.createPriceLine({
        price: ob.bottom,
        color: '#F43F5E',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Bearish OB Btm'
      })
      const midLine = mainSeries.createPriceLine({
        price: ob.avg,
        color: '#E11D48',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: false,
        title: 'Mid'
      })
      priceLines.push(btmLine, midLine)
    }
  })

  // Pivot markers on candles (hidden by default to avoid visual clutter)
  try {
    if (showCandleObText.value) {
      const markers = pivotMarkers.map(m => ({
        time: m.time as any,
        position: m.type === 'bullish_ob' ? ('belowBar' as const) : ('aboveBar' as const),
        color: m.type === 'bullish_ob' ? '#10B981' : '#F43F5E',
        shape: m.type === 'bullish_ob' ? ('arrowUp' as const) : ('arrowDown' as const),
        text: m.type === 'bullish_ob' ? 'Bullish OB' : 'Bearish OB'
      }))
      createSeriesMarkers(mainSeries, markers)
    } else {
      createSeriesMarkers(mainSeries, [])
    }
  } catch {
    // markers non-critical
  }
}

// Rebuild primary series when chartType changes
const setupMainSeries = () => {
  if (!chart) return
  if (mainSeries) {
    chart.removeSeries(mainSeries)
    mainSeries = null
  }

  if (chartType.value === 'candlestick') {
    mainSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#F43F5E',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#F43F5E'
    })
  } else if (chartType.value === 'bar') {
    mainSeries = chart.addSeries(BarSeries, {
      upColor: '#10B981',
      downColor: '#F43F5E'
    })
  } else if (chartType.value === 'line') {
    mainSeries = chart.addSeries(LineSeries, {
      color: '#2F64A8',
      lineWidth: 2
    })
  } else if (chartType.value === 'area') {
    mainSeries = chart.addSeries(AreaSeries, {
      topColor: 'rgba(47, 100, 168, 0.4)',
      bottomColor: 'rgba(47, 100, 168, 0.02)',
      lineColor: '#2F64A8',
      lineWidth: 2
    })
  }

  if (candleData.value.length > 0) {
    if (chartType.value === 'line' || chartType.value === 'area') {
      mainSeries?.setData(candleData.value.map(c => ({ time: c.time as any, value: c.close })))
    } else {
      mainSeries?.setData(candleData.value as any)
    }
  }

  renderOrderBlocks()
}

// Load data based on interval / range
const loadData = async () => {
  if (!chartContainer.value) return
  isLoading.value = true

  try {
    const bars = await getCompanyCandles(
      props.symbol,
      props.currentPrice,
      selectedInterval.value,
      selectedRange.value
    )
    candleData.value = bars

    // Run Order Block detection (script.lua port)
    obAnalysis.value = detectOrderBlocks(bars, {
      length: obLength.value,
      mitigation: obMitigation.value,
      maxBullish: obMaxBull.value,
      maxBearish: obMaxBear.value
    })

    if (mainSeries && volumeSeries && ma20Series && ma50Series) {
      if (chartType.value === 'line' || chartType.value === 'area') {
        mainSeries.setData(bars.map(c => ({ time: c.time as any, value: c.close })))
      } else {
        mainSeries.setData(bars as any)
      }

      // Volume histogram
      const volumeData = bars.map(b => ({
        time: b.time as any,
        value: b.volume,
        color: b.close >= b.open ? 'rgba(16, 185, 129, 0.45)' : 'rgba(244, 63, 94, 0.45)'
      }))
      volumeSeries.setData(volumeData)

      // Moving Averages
      const ma20 = calculateMaSeries(bars, 20)
      const ma50 = calculateMaSeries(bars, 50)
      ma20Series.setData(ma20 as any)
      ma50Series.setData(ma50 as any)

      renderOrderBlocks()
      chart?.timeScale().fitContent()
    }
  } finally {
    isLoading.value = false
  }
}

// Apply scale mode
const applyScaleMode = (mode: 'normal' | 'log' | 'percentage') => {
  scaleMode.value = mode
  if (!chart) return
  const rightScale = chart.priceScale('right')
  if (mode === 'log') {
    rightScale.applyOptions({ mode: PriceScaleMode.Logarithmic })
  } else if (mode === 'percentage') {
    rightScale.applyOptions({ mode: PriceScaleMode.Percentage })
  } else {
    rightScale.applyOptions({ mode: PriceScaleMode.Normal })
  }
}

// Fullscreen toggle
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  setTimeout(() => {
    if (chart && chartContainer.value) {
      chart.applyOptions({
        width: chartContainer.value.clientWidth,
        height: isFullscreen.value ? window.innerHeight - 150 : 480
      })
      chart.timeScale().fitContent()
    }
  }, 100)
}

// Screenshot capture
const captureScreenshot = () => {
  if (!chartContainer.value) return
  const canvas = chartContainer.value.querySelector('canvas')
  if (canvas) {
    const link = document.createElement('a')
    link.download = `${props.symbol}-${selectedInterval.value}-chart.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
}

// ----------------------------------------------------
// Horizontal Scrolling & Pan Navigation Controls
// ----------------------------------------------------
const scrollBarPercent = ref(100)
const scrollBarThumbWidth = ref(25)
const isSliderInteracting = ref(false)

const updateScrollBarFromChart = () => {
  if (!chart || candleData.value.length === 0) return
  const logicalRange = chart.timeScale().getVisibleLogicalRange()
  if (!logicalRange) return
  const total = candleData.value.length
  const visibleSpan = Math.max(1, logicalRange.to - logicalRange.from)
  
  const widthPct = Math.max(8, Math.min(100, (visibleSpan / total) * 100))
  scrollBarThumbWidth.value = widthPct

  const posPct = Math.max(0, Math.min(100 - widthPct, (logicalRange.from / total) * 100))
  scrollBarPercent.value = posPct
}

const handleSliderScroll = (event: Event) => {
  if (!chart || candleData.value.length === 0) return
  isSliderInteracting.value = true
  const total = candleData.value.length
  const targetPct = Number((event.target as HTMLInputElement).value)
  const logicalRange = chart.timeScale().getVisibleLogicalRange()
  const span = logicalRange ? (logicalRange.to - logicalRange.from) : Math.min(60, total)
  
  const newFrom = Math.round((targetPct / 100) * total)
  const newTo = newFrom + span
  chart.timeScale().setVisibleLogicalRange({ from: newFrom, to: newTo })
  scrollBarPercent.value = targetPct
  setTimeout(() => { isSliderInteracting.value = false }, 100)
}

const scrollChart = (direction: 'left' | 'right') => {
  if (!chart) return
  const range = chart.timeScale().getVisibleLogicalRange()
  if (!range) return
  const span = range.to - range.from
  const step = Math.max(5, Math.round(span * 0.25))
  const newFrom = direction === 'left' ? range.from - step : range.from + step
  const newTo = direction === 'left' ? range.to - step : range.to + step
  chart.timeScale().setVisibleLogicalRange({ from: newFrom, to: newTo })
}

const scrollToRealTime = () => {
  if (!chart) return
  chart.timeScale().scrollToRealTime()
}

const resetChartZoom = () => {
  if (!chart) return
  chart.timeScale().fitContent()
}

const handleWheel = (e: WheelEvent) => {
  if (!chart) return
  // If user scrolls horizontally (Shift + Wheel or trackpad deltaX)
  if (Math.abs(e.deltaX) > 2 || e.shiftKey) {
    e.preventDefault()
    const delta = e.shiftKey ? e.deltaY : e.deltaX
    const step = delta > 0 ? 3 : -3
    const range = chart.timeScale().getVisibleLogicalRange()
    if (range) {
      chart.timeScale().setVisibleLogicalRange({
        from: range.from + step,
        to: range.to + step
      })
    }
  }
}

// Handle Drawing Events on SVG overlay
const handleMouseDown = (e: MouseEvent) => {
  if (activeTool.value === 'cursor') return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  isDrawing.value = true

  if (activeTool.value === 'horizontal') {
    drawings.value.push({
      id: `draw-${Date.now()}`,
      tool: 'horizontal',
      x1: 0,
      y1: y,
      x2: rect.width,
      y2: y
    })
    isDrawing.value = false
    activeTool.value = 'cursor'
    return
  }

  currentDrawing.value = {
    id: `draw-${Date.now()}`,
    tool: activeTool.value,
    x1: x,
    y1: y,
    x2: x,
    y2: y
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDrawing.value || !currentDrawing.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  currentDrawing.value.x2 = e.clientX - rect.left
  currentDrawing.value.y2 = e.clientY - rect.top
}

const handleMouseUp = () => {
  if (isDrawing.value && currentDrawing.value) {
    drawings.value.push({ ...currentDrawing.value })
    currentDrawing.value = null
    isDrawing.value = false
    activeTool.value = 'cursor'
  }
}

const clearDrawings = () => {
  drawings.value = []
  currentDrawing.value = null
  isDrawing.value = false
}

// Keydown listener for Escape (exit fullscreen & drawing)
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (isFullscreen.value) isFullscreen.value = false
    if (activeTool.value !== 'cursor') activeTool.value = 'cursor'
    isIntervalDropdownOpen.value = false
    isChartTypeDropdownOpen.value = false
    isIndicatorModalOpen.value = false
  }
}

// Watchers
watch(chartType, () => {
  setupMainSeries()
})

watch([showOrderBlocks, showCandleObText, showBearishTopGuide], () => {
  renderOrderBlocks()
})

watch(showMovingAverages, val => {
  ma20Series?.applyOptions({ visible: val })
  ma50Series?.applyOptions({ visible: val })
})

watch(showVolume, val => {
  volumeSeries?.applyOptions({ visible: val })
})

watch(selectedInterval, newInterval => {
  if (chart) {
    ;(chart.timeScale() as any).applyOptions({
      timeVisible: isIntradayInterval(newInterval),
      secondsVisible: false,
      tickMarkFormatter: (time: any, tickMarkType: any) => {
        return formatTimeScaleTick(time, tickMarkType as number, newInterval)
      }
    })
  }
  void loadData()
})

watch(selectedRange, () => {
  void loadData()
})

watch(() => props.symbol, () => {
  void loadData()
})

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  if (!chartContainer.value) return

  const container = chartContainer.value
  chart = createChart(container, {
    width: container.clientWidth,
    height: 480,
    layout: {
      background: { type: ColorType.Solid, color: '#FFFFFF' },
      textColor: '#475569',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    },
    grid: {
      vertLines: { color: '#F8FAFC' },
      horzLines: { color: '#F1F5F9' }
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        color: '#94A3B8',
        width: 1,
        style: LineStyle.Dashed
      },
      horzLine: {
        color: '#94A3B8',
        width: 1,
        style: LineStyle.Dashed
      }
    },
    rightPriceScale: {
      borderColor: '#E2E8F0',
      autoScale: true
    },
    timeScale: {
      borderColor: '#E2E8F0',
      timeVisible: isIntradayInterval(selectedInterval.value),
      secondsVisible: false,
      fixLeftEdge: false,
      fixRightEdge: false,
      rightOffset: 10,
      barSpacing: 9,
      minBarSpacing: 0.5,
      tickMarkFormatter: (time: any, tickMarkType: any) => {
        return formatTimeScaleTick(time, tickMarkType as number, selectedInterval.value)
      }
    },
    localization: {
      locale: 'id-ID',
      dateFormat: 'dd MMM yyyy'
    },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: false
    },
    handleScale: {
      mouseWheel: true,
      pinch: true,
      axisPressedMouseMove: true,
      axisDoubleClickReset: true
    }
  })

  // Primary candlestick series
  setupMainSeries()

  // Volume series (bottom 20%)
  volumeSeries = chart.addSeries(HistogramSeries, {
    priceFormat: { type: 'volume' },
    priceScaleId: 'volume'
  })
  chart.priceScale('volume').applyOptions({
    scaleMargins: {
      top: 0.8,
      bottom: 0
    }
  })

  // Moving averages
  ma20Series = chart.addSeries(LineSeries, {
    color: '#F59E0B',
    lineWidth: 2,
    title: 'MA20'
  })

  ma50Series = chart.addSeries(LineSeries, {
    color: '#2F64A8',
    lineWidth: 2,
    title: 'MA50'
  })

  // Crosshair tracker
  chart.subscribeCrosshairMove(param => {
    if (!param.time || !param.seriesData || !mainSeries) {
      hoverBar.value = null
      return
    }
    const candle = param.seriesData.get(mainSeries) as any
    const vol = param.seriesData.get(volumeSeries!) as any
    if (candle) {
      hoverBar.value = {
        time: param.time as any,
        open: candle.open ?? candle.value,
        high: candle.high ?? candle.value,
        low: candle.low ?? candle.value,
        close: candle.close ?? candle.value,
        volume: vol?.value || 0
      }
    }
  })

  // Subscribe to visible range for horizontal scrollbar sync
  chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
    if (!isSliderInteracting.value) {
      updateScrollBarFromChart()
    }
  })

  // Horizontal wheel / trackpad scroll listener on chart container
  container.addEventListener('wheel', handleWheel, { passive: false })

  // ResizeObserver for fluid responsiveness
  resizeObserver = new ResizeObserver(entries => {
    if (!entries || !entries[0] || !chart) return
    const { width } = entries[0].contentRect
    if (width > 0) chart.applyOptions({ width })
  })
  resizeObserver.observe(container)

  // Initial load
  await loadData()
  updateScrollBarFromChart()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (chartContainer.value) {
    chartContainer.value.removeEventListener('wheel', handleWheel)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  clearPriceLines()
  if (chart) {
    chart.remove()
    chart = null
  }
})
</script>

<template>
  <div
    ref="chartWrapper"
    class="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all"
    :class="isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none p-4' : 'p-4 sm:p-5'"
  >
    <!-- 1. TRADINGVIEW TOP PRO TOOLBAR -->
    <header class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/90 pb-3 text-xs select-none">
      <!-- Left: Symbol + Ticker Info -->
      <div class="flex items-center gap-2.5">
        <div class="flex items-center gap-1.5 rounded-lg bg-[#244F87] px-2.5 py-1 font-mono font-bold text-white shadow-2xs">
          <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>IDX:{{ symbol }}</span>
        </div>

        <span class="hidden font-medium text-slate-500 sm:inline truncate max-w-44">
          {{ symbol === 'BBNI' ? 'Bank Negara Indonesia' : symbol }}
        </span>

        <span class="font-mono text-sm font-bold tabular-nums" :class="priceChange.diff >= 0 ? 'text-emerald-600' : 'text-rose-600'">
          Rp {{ formatPrice(activeCandle?.close || currentPrice) }}
        </span>

        <span class="font-mono text-[11px] font-semibold tabular-nums rounded px-1.5 py-0.5" :class="priceChange.diff >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'">
          {{ priceChange.diff >= 0 ? '+' : '' }}{{ priceChange.percent.toFixed(2) }}%
        </span>
      </div>

      <!-- Center / Right: Interval, Chart Style, fx Indicators, Fullscreen & Tools -->
      <div class="flex flex-wrap items-center gap-1.5">
        <!-- Quick Interval Pills -->
        <div class="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            v-for="intKey in ['5m', '15m', '1h', '1D', '1W'] as ChartInterval[]"
            :key="intKey"
            type="button"
            class="rounded px-2 py-1 font-mono text-xs font-semibold transition-colors"
            :class="selectedInterval === intKey ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'"
            @click="selectedInterval = intKey"
          >
            {{ intKey }}
          </button>

          <!-- All Intervals Dropdown Toggle -->
          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-0.5 rounded px-1.5 py-1 text-slate-600 hover:text-slate-900"
              title="Semua interval waktu"
              @click="isIntervalDropdownOpen = !isIntervalDropdownOpen"
            >
              <ChevronDown class="size-3.5" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="isIntervalDropdownOpen"
              class="absolute right-0 top-full z-40 mt-1 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
            >
              <div class="space-y-2 text-xs">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 py-0.5">Menit (Intraday)</span>
                  <button
                    v-for="i in INTERVALS.filter(x => x.category === 'menit')"
                    :key="i.key"
                    type="button"
                    class="w-full text-left px-2 py-1 rounded flex justify-between items-center hover:bg-slate-50"
                    :class="selectedInterval === i.key ? 'font-bold text-[#244F87]' : 'text-slate-700'"
                    @click="selectedInterval = i.key; isIntervalDropdownOpen = false"
                  >
                    <span>{{ i.label }}</span>
                    <span class="font-mono text-[10px] text-slate-400">{{ i.shortLabel }}</span>
                  </button>
                </div>
                <div class="border-t border-slate-100 pt-1">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 py-0.5">Jam</span>
                  <button
                    v-for="i in INTERVALS.filter(x => x.category === 'jam')"
                    :key="i.key"
                    type="button"
                    class="w-full text-left px-2 py-1 rounded flex justify-between items-center hover:bg-slate-50"
                    :class="selectedInterval === i.key ? 'font-bold text-[#244F87]' : 'text-slate-700'"
                    @click="selectedInterval = i.key; isIntervalDropdownOpen = false"
                  >
                    <span>{{ i.label }}</span>
                    <span class="font-mono text-[10px] text-slate-400">{{ i.shortLabel }}</span>
                  </button>
                </div>
                <div class="border-t border-slate-100 pt-1">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 py-0.5">Hari / Minggu</span>
                  <button
                    v-for="i in INTERVALS.filter(x => x.category === 'hari')"
                    :key="i.key"
                    type="button"
                    class="w-full text-left px-2 py-1 rounded flex justify-between items-center hover:bg-slate-50"
                    :class="selectedInterval === i.key ? 'font-bold text-[#244F87]' : 'text-slate-700'"
                    @click="selectedInterval = i.key; isIntervalDropdownOpen = false"
                  >
                    <span>{{ i.label }}</span>
                    <span class="font-mono text-[10px] text-slate-400">{{ i.shortLabel }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart Type Switcher -->
        <div class="relative">
          <button
            type="button"
            class="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50"
            @click="isChartTypeDropdownOpen = !isChartTypeDropdownOpen"
          >
            <span class="capitalize">{{ chartType === 'candlestick' ? 'Candles' : chartType }}</span>
            <ChevronDown class="size-3 text-slate-400" />
          </button>

          <div
            v-if="isChartTypeDropdownOpen"
            class="absolute right-0 top-full z-40 mt-1 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl space-y-0.5 text-xs"
          >
            <button
              v-for="t in ['candlestick', 'bar', 'line', 'area'] as const"
              :key="t"
              type="button"
              class="w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-50 capitalize"
              :class="chartType === t ? 'font-bold text-[#244F87] bg-blue-50/50' : 'text-slate-700'"
              @click="chartType = t; isChartTypeDropdownOpen = false"
            >
              <span>{{ t === 'candlestick' ? 'Candles' : t }}</span>
              <Check v-if="chartType === t" class="size-3.5 text-[#244F87]" />
            </button>
          </div>
        </div>

        <!-- Indicators Manager fx -->
        <button
          type="button"
          class="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50"
          @click="isIndicatorModalOpen = true"
        >
          <span class="font-serif italic font-bold text-[#244F87]">fx</span>
          <span>Indikator</span>
        </button>

        <div class="h-4 w-px bg-slate-200 mx-0.5"></div>

        <!-- Screenshot Button -->
        <button
          type="button"
          class="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          title="Ambil gambar chart"
          @click="captureScreenshot"
        >
          <Camera class="size-3.5" />
        </button>

        <!-- Fullscreen Button -->
        <button
          type="button"
          class="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          :title="isFullscreen ? 'Keluar Fullscreen (Esc)' : 'Tampilan Penuh Fullscreen'"
          @click="toggleFullscreen"
        >
          <Minimize2 v-if="isFullscreen" class="size-3.5" />
          <Maximize2 v-else class="size-3.5" />
        </button>
      </div>
    </header>

    <!-- 2. MAIN WORKSPACE: LEFT TOOLBAR + CHART CANVAS VIEWPORT -->
    <div class="relative flex flex-1 min-h-[480px]">
      <!-- LEFT DRAWING TOOLBOX (Signature TradingView Toolbar) -->
      <aside class="flex flex-col items-center gap-1 border-r border-slate-200/80 pr-2 pt-2 text-slate-600 select-none">
        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-lg transition-colors"
          :class="activeTool === 'cursor' ? 'bg-[#244F87] text-white shadow-2xs' : 'hover:bg-slate-100 hover:text-slate-900'"
          title="Kursor Crosshair"
          @click="activeTool = 'cursor'"
        >
          <MousePointer class="size-4" />
        </button>

        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-lg transition-colors"
          :class="activeTool === 'trendline' ? 'bg-[#244F87] text-white shadow-2xs' : 'hover:bg-slate-100 hover:text-slate-900'"
          title="Garis Tren (Klik & Drag)"
          @click="activeTool = 'trendline'"
        >
          <TrendingUp class="size-4" />
        </button>

        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-lg transition-colors"
          :class="activeTool === 'horizontal' ? 'bg-[#244F87] text-white shadow-2xs' : 'hover:bg-slate-100 hover:text-slate-900'"
          title="Garis Horizontal (Klik level harga)"
          @click="activeTool = 'horizontal'"
        >
          <Minus class="size-4" />
        </button>

        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-lg transition-colors"
          :class="activeTool === 'rectangle' ? 'bg-[#244F87] text-white shadow-2xs' : 'hover:bg-slate-100 hover:text-slate-900'"
          title="Kotak Area / Order Block Manual"
          @click="activeTool = 'rectangle'"
        >
          <Square class="size-4" />
        </button>

        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-lg transition-colors"
          :class="activeTool === 'ruler' ? 'bg-[#244F87] text-white shadow-2xs' : 'hover:bg-slate-100 hover:text-slate-900'"
          title="Penggaris Pengukur Persentase"
          @click="activeTool = 'ruler'"
        >
          <Ruler class="size-4" />
        </button>

        <div class="my-1 h-px w-5 bg-slate-200"></div>

        <!-- Saklar On/Off Garis Panduan OB (Guide Line) -->
        <button
          type="button"
          class="relative flex size-8 items-center justify-center rounded-lg transition-colors"
          :class="showOrderBlocks ? 'bg-[#244F87] text-white shadow-2xs' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'"
          :title="showOrderBlocks ? 'Garis Panduan OB (Guide Line): Aktif (Klik untuk sembunyikan garis panduan)' : 'Garis Panduan OB (Guide Line): Nonaktif (Klik untuk tampilkan garis panduan OB)'"
          aria-label="Saklar Garis Panduan OB"
          @click="showOrderBlocks = !showOrderBlocks"
        >
          <Layers class="size-4" />
          <span
            v-if="showOrderBlocks"
            class="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-400 ring-1 ring-white"
          ></span>
        </button>

        <!-- Opsi Tampilan Teks Label Order Block di Candle (Text Guide) -->
        <button
          type="button"
          class="relative flex size-8 items-center justify-center rounded-lg transition-colors"
          :class="showCandleObText ? 'bg-[#244F87] text-white shadow-2xs' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'"
          :title="showCandleObText ? 'Teks OB di Candle: Aktif (Klik untuk sembunyikan label teks OB)' : 'Teks OB di Candle: Nonaktif (Klik untuk tampilkan label teks OB)'"
          aria-label="Pilihan tampilan teks Order Block di candle"
          @click="showCandleObText = !showCandleObText"
        >
          <Type class="size-4" />
          <span
            v-if="showCandleObText"
            class="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-400 ring-1 ring-white"
          ></span>
        </button>

        <!-- Saklar On/Off Panduan Bearish Top di Sisi Kanan -->
        <button
          type="button"
          class="relative flex size-8 items-center justify-center rounded-lg transition-colors"
          :class="showBearishTopGuide ? 'bg-rose-50 text-rose-600 border border-rose-200/90 shadow-2xs' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'"
          :title="showBearishTopGuide ? 'Panduan Bearish Top Kanan: Aktif (Klik untuk matikan panduan kanan)' : 'Panduan Bearish Top Kanan: Nonaktif (Klik untuk nyalakan panduan kanan)'"
          aria-label="Saklar panduan Bearish Top di sisi kanan"
          @click="showBearishTopGuide = !showBearishTopGuide"
        >
          <ArrowDownToLine class="size-4" />
          <span
            v-if="showBearishTopGuide"
            class="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-rose-500 ring-1 ring-white"
          ></span>
        </button>

        <div class="my-1 h-px w-5 bg-slate-200"></div>

        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-lg transition-colors"
          :class="magnetMode ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-slate-100 text-slate-400'"
          title="Mode Magnet (Snap Candle)"
          @click="magnetMode = !magnetMode"
        >
          <Magnet class="size-4" />
        </button>

        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
          title="Hapus Semua Coretan Gambar"
          @click="clearDrawings"
        >
          <Trash2 class="size-4" />
        </button>
      </aside>

      <!-- CHART CONTAINER & DRAWING OVERLAY -->
      <div class="relative flex-1 overflow-hidden">
        <!-- Background Institutional Watermark -->
        <div class="pointer-events-none absolute inset-0 flex items-center justify-center select-none font-bold text-slate-900/5 text-5xl sm:text-7xl font-mono tracking-wider">
          {{ symbol }} • {{ selectedInterval }} • IDX
        </div>

        <!-- TOP-LEFT INTERACTIVE TRADINGVIEW LEGEND -->
        <div class="absolute left-3 top-3 z-20 space-y-1.5 text-xs select-none">
          <!-- Main Candle OHLCV row -->
          <div class="flex flex-wrap items-center gap-x-2 font-mono text-[11px] bg-white/85 px-2 py-1 rounded-lg backdrop-blur-xs border border-slate-100 shadow-2xs">
            <strong class="font-sans font-bold text-slate-900">{{ symbol }} · {{ selectedInterval }} · IDX</strong>
            <span v-if="activeCandle?.time" class="text-slate-600 font-semibold border-r border-slate-200 pr-1.5">
              {{ formatActiveCandleDate(activeCandle.time, selectedInterval) }}
            </span>
            <span class="text-slate-400">O: <strong class="text-slate-800">{{ formatPrice(activeCandle?.open || 0) }}</strong></span>
            <span class="text-slate-400">H: <strong class="text-emerald-600">{{ formatPrice(activeCandle?.high || 0) }}</strong></span>
            <span class="text-slate-400">L: <strong class="text-rose-600">{{ formatPrice(activeCandle?.low || 0) }}</strong></span>
            <span class="text-slate-400">C: <strong :class="priceChange.diff >= 0 ? 'text-emerald-700' : 'text-rose-700'">{{ formatPrice(activeCandle?.close || 0) }}</strong></span>
            <span :class="priceChange.diff >= 0 ? 'text-emerald-700' : 'text-rose-700'">
              {{ priceChange.diff >= 0 ? '+' : '' }}{{ priceChange.percent.toFixed(2) }}%
            </span>
          </div>

          <!-- Active Indicators Status Rows -->
          <div class="space-y-1 text-[11px]">
            <!-- Order Block Detector Row -->
            <div v-if="showOrderBlocks && obAnalysis" class="flex items-center gap-1.5 bg-white/80 px-2 py-0.5 rounded border border-slate-100/80 backdrop-blur-2xs">
              <span class="size-2 rounded-full bg-emerald-500"></span>
              <span class="font-bold text-slate-800">OB Detector ({{ obLength }}, {{ obMaxBull }}, {{ obMaxBear }})</span>
              <button type="button" class="text-slate-400 hover:text-slate-700 ml-1" @click="showOrderBlocks = false" title="Sembunyikan OB">
                <Eye class="size-3" />
              </button>
              <button type="button" class="text-slate-400 hover:text-slate-700" @click="isIndicatorModalOpen = true" title="Pengaturan OB">
                <Settings class="size-3" />
              </button>
            </div>

            <!-- Moving Average 20 / 50 -->
            <div v-if="showMovingAverages" class="flex items-center gap-2 bg-white/80 px-2 py-0.5 rounded border border-slate-100/80 backdrop-blur-2xs font-mono">
              <span class="text-amber-600 font-bold">MA 20: {{ formatPrice(calculateMaSeries(candleData, 20).slice(-1)[0]?.value || 0) }}</span>
              <span class="text-blue-600 font-bold">MA 50: {{ formatPrice(calculateMaSeries(candleData, 50).slice(-1)[0]?.value || 0) }}</span>
              <button type="button" class="text-slate-400 hover:text-slate-700 ml-1" @click="showMovingAverages = false" title="Sembunyikan MA">
                <Eye class="size-3" />
              </button>
            </div>

            <!-- Volume Row -->
            <div v-if="showVolume" class="flex items-center gap-1.5 bg-white/80 px-2 py-0.5 rounded border border-slate-100/80 backdrop-blur-2xs font-mono">
              <span class="text-slate-500">Vol:</span>
              <strong class="text-slate-800">{{ formatVolume(activeCandle?.volume || 0) }}</strong>
              <button type="button" class="text-slate-400 hover:text-slate-700 ml-1" @click="showVolume = false" title="Sembunyikan Volume">
                <Eye class="size-3" />
              </button>
            </div>
          </div>
        </div>

        <!-- Canvas Chart Mount Point -->
        <div ref="chartContainer" class="w-full h-full min-h-[480px]"></div>

        <!-- Interactive SVG Overlay for User Drawings -->
        <svg
          class="absolute inset-0 size-full"
          :class="activeTool !== 'cursor' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
        >
          <!-- Existing user drawings -->
          <template v-for="d in drawings" :key="d.id">
            <!-- Trendline -->
            <line
              v-if="d.tool === 'trendline'"
              :x1="d.x1"
              :y1="d.y1"
              :x2="d.x2"
              :y2="d.y2"
              stroke="#2563EB"
              stroke-width="2"
            />
            <!-- Horizontal Line -->
            <line
              v-else-if="d.tool === 'horizontal'"
              x1="0"
              :x2="10000"
              :y1="d.y1"
              :y2="d.y1"
              stroke="#2563EB"
              stroke-width="1.5"
              stroke-dasharray="4 4"
            />
            <!-- Rectangle Zone -->
            <rect
              v-else-if="d.tool === 'rectangle'"
              :x="Math.min(d.x1, d.x2)"
              :y="Math.min(d.y1, d.y2)"
              :width="Math.abs(d.x2 - d.x1)"
              :height="Math.abs(d.y2 - d.y1)"
              fill="rgba(37, 99, 235, 0.15)"
              stroke="#2563EB"
              stroke-width="1.5"
            />
            <!-- Ruler Measurement -->
            <g v-else-if="d.tool === 'ruler'">
              <rect
                :x="Math.min(d.x1, d.x2)"
                :y="Math.min(d.y1, d.y2)"
                :width="Math.abs(d.x2 - d.x1)"
                :height="Math.abs(d.y2 - d.y1)"
                fill="rgba(16, 185, 129, 0.12)"
                stroke="#10B981"
                stroke-dasharray="3 3"
              />
              <text
                :x="Math.min(d.x1, d.x2) + 6"
                :y="Math.min(d.y1, d.y2) + 16"
                fill="#0F172A"
                font-size="11"
                font-weight="bold"
                font-family="monospace"
              >
                Area Pengukuran
              </text>
            </g>
          </template>

          <!-- Current active drawing preview -->
          <template v-if="currentDrawing">
            <line
              v-if="currentDrawing.tool === 'trendline'"
              :x1="currentDrawing.x1"
              :y1="currentDrawing.y1"
              :x2="currentDrawing.x2"
              :y2="currentDrawing.y2"
              stroke="#2563EB"
              stroke-width="2"
              stroke-dasharray="4 4"
            />
            <rect
              v-else-if="currentDrawing.tool === 'rectangle' || currentDrawing.tool === 'ruler'"
              :x="Math.min(currentDrawing.x1, currentDrawing.x2)"
              :y="Math.min(currentDrawing.y1, currentDrawing.y2)"
              :width="Math.abs(currentDrawing.x2 - currentDrawing.x1)"
              :height="Math.abs(currentDrawing.y2 - currentDrawing.y1)"
              fill="rgba(37, 99, 235, 0.15)"
              stroke="#2563EB"
              stroke-dasharray="3 3"
            />
          </template>
        </svg>

        <!-- Loading overlay -->
        <div v-if="isLoading" class="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-2xs text-xs font-semibold text-[#244F87]">
          Memuat data chart {{ symbol }}…
        </div>
      </div>
    </div>

    <!-- 2.5. HORIZONTAL SCROLLBAR & TIMELINE PAN CONTROLS -->
    <div class="flex items-center gap-2 border-t border-slate-200/80 bg-slate-50/90 px-3 py-1.5 text-xs select-none">
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="flex size-6 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-colors"
          title="Geser ke Data Lampau (Scroll Left)"
          @click="scrollChart('left')"
        >
          <ChevronLeft class="size-3.5" />
        </button>
        <button
          type="button"
          class="flex size-6 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-colors"
          title="Geser ke Data Terkini (Scroll Right)"
          @click="scrollChart('right')"
        >
          <ChevronRight class="size-3.5" />
        </button>
      </div>

      <!-- Draggable Timeline Scrollbar Slider -->
      <div class="relative flex-1 flex items-center h-4 group">
        <input
          type="range"
          min="0"
          :max="Math.max(1, 100 - scrollBarThumbWidth)"
          step="0.5"
          :value="scrollBarPercent"
          class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-ew-resize accent-[#244F87] hover:bg-slate-300 transition-colors"
          title="Geser Horizontal untuk Menelusuri Riwayat Waktu Grafik"
          @input="handleSliderScroll"
        />
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#244F87] shadow-2xs transition-colors"
          title="Lompat ke Data Terkini (Scroll to Real-Time)"
          @click="scrollToRealTime"
        >
          <ChevronsRight class="size-3 text-[#244F87]" />
          <span>Terkini</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-colors"
          title="Sesuaikan Skala Tampilan (Fit Content)"
          @click="resetChartZoom"
        >
          <RotateCcw class="size-3 text-slate-500" />
          <span>Fit</span>
        </button>
      </div>
    </div>

    <!-- 3. TRADINGVIEW BOTTOM SCALE MODES & TIMEZONE -->
    <footer class="flex items-center justify-end gap-2 border-t border-slate-200/90 pt-3 text-xs select-none">
      <div class="flex items-center gap-2">
        <span class="font-mono text-[11px] text-slate-500">WIB (UTC+7)</span>

        <div class="h-3.5 w-px bg-slate-200"></div>

        <!-- Scale Mode Buttons -->
        <div class="flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 p-0.5 font-mono text-[11px]">
          <button
            type="button"
            class="rounded px-1.5 py-0.5 font-semibold"
            :class="scaleMode === 'percentage' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'"
            title="Skala Persentase (%)"
            @click="applyScaleMode('percentage')"
          >
            %
          </button>
          <button
            type="button"
            class="rounded px-1.5 py-0.5 font-semibold"
            :class="scaleMode === 'log' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'"
            title="Skala Logaritmik (log)"
            @click="applyScaleMode('log')"
          >
            log
          </button>
          <button
            type="button"
            class="rounded px-1.5 py-0.5 font-semibold"
            :class="scaleMode === 'normal' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'"
            title="Skala Otomatis (auto)"
            @click="applyScaleMode('normal')"
          >
            auto
          </button>
        </div>
      </div>
    </footer>

    <!-- 4. INDICATOR MANAGER MODAL (fx Dialog) -->
    <div
      v-if="isIndicatorModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
    >
      <div class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="font-serif italic font-bold text-lg text-[#244F87]">fx</span>
            <h3 class="text-base font-bold text-slate-900">Manajer Indikator & Parameter</h3>
          </div>
          <button type="button" class="text-slate-400 hover:text-slate-600" @click="isIndicatorModalOpen = false">
            <X class="size-5" />
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <!-- 1. Order Block Detector (script.lua) Settings -->
          <div class="rounded-xl border border-slate-200 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-bold text-slate-900">Voyager Order Block Detector</h4>
                <p class="text-[11px] text-slate-500">Porting algoritma Pine Script v5 (script.lua)</p>
              </div>
              <input type="checkbox" v-model="showOrderBlocks" class="size-4 text-[#244F87] rounded" />
            </div>

            <div v-if="showOrderBlocks" class="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Volume Pivot Length</label>
                <input
                  v-model.number="obLength"
                  type="number"
                  min="2"
                  max="20"
                  class="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-xs"
                />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Metode Mitigasi</label>
                <select v-model="obMitigation" class="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold">
                  <option value="Wick">Wick (Ekor Candle)</option>
                  <option value="Close">Close (Harga Penutupan)</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Maksimal Bullish OB</label>
                <input
                  v-model.number="obMaxBull"
                  type="number"
                  min="1"
                  max="10"
                  class="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-xs"
                />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Maksimal Bearish OB</label>
                <input
                  v-model.number="obMaxBear"
                  type="number"
                  min="1"
                  max="10"
                  class="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-xs"
                />
              </div>
            </div>

            <!-- Toggles for Candle text and Bearish Top Guide -->
            <div v-if="showOrderBlocks" class="space-y-2 pt-2 border-t border-slate-100">
              <label class="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input type="checkbox" v-model="showCandleObText" class="size-4 text-[#244F87] rounded" />
                <span>Tampilkan teks label OB di candle (Bullish / Bearish OB)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input type="checkbox" v-model="showBearishTopGuide" class="size-4 text-[#244F87] rounded" />
                <span>Tampilkan garis panduan Bearish Top di sisi kanan</span>
              </label>
            </div>
          </div>

          <!-- 2. Moving Averages -->
          <div class="rounded-xl border border-slate-200 p-4 flex items-center justify-between">
            <div>
              <h4 class="font-bold text-slate-900">Moving Average Ganda (MA20 & MA50)</h4>
              <p class="text-[11px] text-slate-500">Indikator tren harga jangka pendek dan menengah</p>
            </div>
            <input type="checkbox" v-model="showMovingAverages" class="size-4 text-[#244F87] rounded" />
          </div>

          <!-- 3. Volume Sub-pane -->
          <div class="rounded-xl border border-slate-200 p-4 flex items-center justify-between">
            <div>
              <h4 class="font-bold text-slate-900">Histogram Volume Transaksi</h4>
              <p class="text-[11px] text-slate-500">Volume harian dengan pewarnaan arah candle</p>
            </div>
            <input type="checkbox" v-model="showVolume" class="size-4 text-[#244F87] rounded" />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            class="button-primary px-4 py-2 text-xs font-bold"
            @click="loadData(); isIndicatorModalOpen = false"
          >
            Terapkan Indikator
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
