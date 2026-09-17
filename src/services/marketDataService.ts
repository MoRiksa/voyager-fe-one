/**
 * Market Data Service for Voyager One
 * 
 * Provides granular intraday (1m, 5m, 15m, 1h) and multi-day (1D, 1W, 1M)
 * historical OHLCV candlestick data for technical analysis.
 * Features an API-first adapter: queries the backend endpoint if available,
 * with automatic fallback to high-fidelity, deterministic synthetic OHLCV
 * data anchored to the company's actual fundamental price and sector volatility.
 */

export interface OhlcvBar {
  time: string | number // 'YYYY-MM-DD' or UNIX epoch seconds
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Granular Intervals (like TradingView)
export type ChartInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1D' | '1W' | '1M'

export interface IntervalOption {
  key: ChartInterval
  label: string
  shortLabel: string
  category: 'menit' | 'jam' | 'hari'
  seconds: number
  isIntraday: boolean
}

export const INTERVALS: IntervalOption[] = [
  { key: '1m', label: '1 Menit', shortLabel: '1m', category: 'menit', seconds: 60, isIntraday: true },
  { key: '5m', label: '5 Menit', shortLabel: '5m', category: 'menit', seconds: 300, isIntraday: true },
  { key: '15m', label: '15 Menit', shortLabel: '15m', category: 'menit', seconds: 900, isIntraday: true },
  { key: '30m', label: '30 Menit', shortLabel: '30m', category: 'menit', seconds: 1800, isIntraday: true },
  { key: '1h', label: '1 Jam', shortLabel: '1h', category: 'jam', seconds: 3600, isIntraday: true },
  { key: '4h', label: '4 Jam', shortLabel: '4h', category: 'jam', seconds: 14400, isIntraday: true },
  { key: '1D', label: '1 Hari', shortLabel: '1D', category: 'hari', seconds: 86400, isIntraday: false },
  { key: '1W', label: '1 Minggu', shortLabel: '1W', category: 'hari', seconds: 604800, isIntraday: false },
  { key: '1M', label: '1 Bulan', shortLabel: '1M', category: 'hari', seconds: 2592000, isIntraday: false }
]

// Quick Date Range Presets (Bottom Bar)
export type RangeKey = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'ALL'

export interface RangeOption {
  key: RangeKey
  label: string
  days: number
  recommendedInterval: ChartInterval
}

export const RANGES: RangeOption[] = [
  { key: '1D', label: '1D', days: 1, recommendedInterval: '5m' },
  { key: '5D', label: '5D', days: 5, recommendedInterval: '15m' },
  { key: '1M', label: '1M', days: 30, recommendedInterval: '1h' },
  { key: '3M', label: '3M', days: 90, recommendedInterval: '1D' },
  { key: '6M', label: '6M', days: 180, recommendedInterval: '1D' },
  { key: 'YTD', label: 'YTD', days: 240, recommendedInterval: '1D' },
  { key: '1Y', label: '1Y', days: 365, recommendedInterval: '1D' },
  { key: '5Y', label: '5Y', days: 1825, recommendedInterval: '1W' },
  { key: 'ALL', label: 'ALL', days: 3650, recommendedInterval: '1M' }
]

// Backward compatibility with previous simple timeframes
export type TimeframeKey = '1B' | '3B' | '6B' | '1T'
export const TIMEFRAMES: { key: TimeframeKey; label: string; days: number }[] = [
  { key: '1B', label: '1 Bulan', days: 30 },
  { key: '3B', label: '3 Bulan', days: 90 },
  { key: '6B', label: '6 Bulan', days: 180 },
  { key: '1T', label: '1 Tahun', days: 365 }
]

// Simple seeded pseudo-random generator for deterministic, repeatable candle history
const createPrng = (seedStr: string) => {
  let h = 0x811c9dc5
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

/**
 * Generates deterministic daily historical OHLCV candles
 * anchored to the candidate's actual current price (e.g. 5,450 for BBNI).
 */
export const generateDeterministicCandles = (
  symbol: string,
  currentPrice: number,
  daysBack: number = 365,
  asOfDate: Date = new Date(),
  interval: ChartInterval = '1D'
): OhlcvBar[] => {
  const prng = createPrng(`${symbol}-${daysBack}-${interval}`)
  const bars: OhlcvBar[] = []
  
  // Safe base price fallback if priceIdr is missing or invalid
  const basePrice = Number.isFinite(currentPrice) && currentPrice > 0 ? currentPrice : 5000
  const dailyVolatility = 0.016

  const intervalConfig = INTERVALS.find(i => i.key === interval) || INTERVALS[6]
  const isIntraday = intervalConfig.isIntraday

  if (isIntraday) {
    // Intraday generation: trading session 09:00 - 16:00 WIB (7 hours = 420 mins)
    const intervalMins = Math.max(1, Math.round(intervalConfig.seconds / 60))
    const barsPerDay = Math.floor(420 / intervalMins)
    const totalBarsNeeded = Math.min(500, Math.max(80, daysBack * barsPerDay))
    const totalDays = Math.ceil(totalBarsNeeded / barsPerDay)

    let currentPriceWalk = basePrice * (0.96 + prng() * 0.08)
    const baseDate = new Date(asOfDate)

    // Collect trading days
    const tradingDates: Date[] = []
    let cursorDate = new Date(baseDate)
    while (tradingDates.length < totalDays) {
      const day = cursorDate.getDay()
      if (day !== 0 && day !== 6) {
        tradingDates.unshift(new Date(cursorDate))
      }
      cursorDate.setDate(cursorDate.getDate() - 1)
    }

    for (const d of tradingDates) {
      // 09:00 WIB to 16:00 WIB
      const sessionStart = new Date(d)
      sessionStart.setHours(9, 0, 0, 0)

      for (let bar = 0; bar < barsPerDay; bar++) {
        if (bars.length >= totalBarsNeeded) break
        const barTime = new Date(sessionStart.getTime() + bar * intervalMins * 60 * 1000)
        
        const open = Math.round(currentPriceWalk / 25) * 25
        const shock = (prng() - 0.49) * 0.005 * Math.sqrt(intervalMins)
        const close = Math.round(Math.max(basePrice * 0.5, open * (1 + shock)) / 25) * 25
        const spread = Math.max(25, Math.abs(close - open) + (open * 0.002 * prng()))
        const high = Math.round((Math.max(open, close) + spread * prng()) / 25) * 25
        const low = Math.round((Math.max(25, Math.min(open, close) - spread * prng())) / 25) * 25
        
        const isSpike = prng() < 0.06
        const baseVol = Math.floor(100_000 * Math.sqrt(intervalMins) * (0.5 + prng()))
        const volume = isSpike ? baseVol * 4 : baseVol

        // UNIX epoch seconds for intraday time scale in Lightweight Charts
        const timeSec = Math.floor(barTime.getTime() / 1000)
        bars.push({
          time: timeSec,
          open,
          high,
          low,
          close,
          volume
        })
        currentPriceWalk = close
      }
    }
    return bars
  }

  // Daily / Weekly / Monthly generation
  // Pre-generate raw price walk in reverse
  const prices: number[] = [basePrice]
  for (let i = 1; i < daysBack; i++) {
    const prev = prices[i - 1]
    const shock = (prng() - 0.49) * 2
    const change = prev * dailyVolatility * shock
    const next = Math.max(basePrice * 0.5, Math.min(basePrice * 1.6, prev - change))
    prices.push(Math.round(next / 25) * 25)
  }
  prices.reverse()

  let currentDate = new Date(asOfDate)
  currentDate.setDate(currentDate.getDate() - Math.floor(daysBack * 1.4))

  let priceIdx = 0
  while (bars.length < daysBack && priceIdx < prices.length) {
    const dayOfWeek = currentDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const close = prices[priceIdx]
      const prevClose = priceIdx > 0 ? prices[priceIdx - 1] : close
      const open = prevClose

      const spread = Math.abs(close - open) + (close * 0.008 * prng())
      const high = Math.round(Math.max(open, close) + spread * prng())
      const low = Math.round(Math.max(25, Math.min(open, close) - spread * prng()))

      const isVolumeSpike = prng() < 0.08
      const baseVol = 15_000_000 + Math.floor(prng() * 25_000_000)
      const volume = isVolumeSpike ? Math.floor(baseVol * (2.8 + prng() * 2.2)) : baseVol

      const dateStr = currentDate.toISOString().split('T')[0]
      bars.push({
        time: dateStr,
        open,
        high,
        low,
        close,
        volume
      })
      priceIdx++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return bars
}

/**
 * Fetches OHLCV candles for a company symbol with specified interval or range
 */
export const getCompanyCandles = async (
  symbol: string,
  currentPrice: number,
  timeframeOrInterval: TimeframeKey | ChartInterval = '1D',
  rangeKey: RangeKey = '6M'
): Promise<OhlcvBar[]> => {
  const rangeConfig = RANGES.find(r => r.key === rangeKey) || RANGES[4]
  const days = rangeConfig.days

  const interval: ChartInterval = (['1m','5m','15m','30m','1h','4h','1D','1W','1M'].includes(timeframeOrInterval))
    ? (timeframeOrInterval as ChartInterval)
    : rangeConfig.recommendedInterval

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '')
  if (backendUrl) {
    try {
      const response = await fetch(
        `${backendUrl}/api/v1/companies/${encodeURIComponent(symbol)}/candles?interval=${interval}&days=${days}`
      )
      if (response.ok) {
        const payload = await response.json()
        if (Array.isArray(payload.candles) && payload.candles.length > 0) {
          return payload.candles
        }
      }
    } catch {
      // Gracefully fall back to deterministic generator
    }
  }

  return generateDeterministicCandles(symbol, currentPrice, days, new Date(), interval)
}
