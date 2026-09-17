/**
 * Emiten Fear & Greed Index Engine
 * 
 * Quantifies market and institutional sentiment for a specific emiten stock.
 * Combines 4 quantitative indicators:
 * 1. 14-Day RSI (Momentum)
 * 2. 50-Day Moving Average Deviation (Trend Strength)
 * 3. 20-Day Historical Volatility vs Baseline (Market Panic / Complacency)
 * 4. Accumulation / Distribution Volume Flow Ratio (Institutional Money Flow)
 */

import { generateDeterministicCandles, type OhlcvBar } from '../services/marketDataService'

export type SentimentClassification = 
  | 'Ketakutan Ekstrem' 
  | 'Ketakutan' 
  | 'Netral' 
  | 'Keserakahan' 
  | 'Keserakahan Ekstrem'

export interface SentimentFactor {
  name: string
  label: string
  score: number // 0 - 100
  weight: number
  valueFormatted: string
  interpretation: string
}

export interface HistoricalSentimentPoint {
  time: string | number
  score: number
}

export interface FearGreedAnalysis {
  score: number // 0 - 100
  classification: SentimentClassification
  summary: string
  color: string // Tailwind text/bg hex color
  historicalSeries: HistoricalSentimentPoint[] // last 30 points
  factors: SentimentFactor[]
}

/**
 * Calculates 14-period RSI
 */
const calculateRsi = (closes: number[], period: number = 14): number => {
  if (closes.length <= period) return 50
  
  let gains = 0
  let losses = 0
  
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff >= 0) gains += diff
    else losses -= diff
  }
  
  let avgGain = gains / period
  let avgLoss = losses / period
  
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period
  }
  
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return Math.round(100 - (100 / (1 + rs)))
}

/**
 * Calculates Simple Moving Average
 */
const calculateSma = (values: number[], period: number): number => {
  if (values.length < period) return values[values.length - 1]
  const slice = values.slice(-period)
  return slice.reduce((a, b) => a + b, 0) / period
}

/**
 * Calculates Historical Volatility (standard deviation of daily returns)
 */
const calculateVolatility = (closes: number[], period: number): number => {
  if (closes.length < period + 1) return 0.02
  const returns: number[] = []
  for (let i = closes.length - period; i < closes.length; i++) {
    returns.push((closes[i] - closes[i - 1]) / closes[i - 1])
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
  return Math.sqrt(variance)
}

/**
 * Computes sentiment score for a given bar slice
 */
const computeSingleScore = (bars: OhlcvBar[]): { score: number; factors: SentimentFactor[] } => {
  if (bars.length < 20) {
    return {
      score: 50,
      factors: []
    }
  }

  const closes = bars.map(b => b.close)
  const currentPrice = closes[closes.length - 1]

  // Factor 1: RSI (14) - Weight 35%
  const rsi = calculateRsi(closes, 14)
  const rsiScore = Math.max(0, Math.min(100, rsi))

  // Factor 2: MA50 Deviation - Weight 30%
  // -10% discount -> score 0 (extreme fear), +10% premium -> score 100 (extreme greed)
  const maPeriod = Math.min(50, Math.floor(closes.length * 0.8))
  const ma50 = calculateSma(closes, maPeriod)
  const maDiffPercent = ((currentPrice - ma50) / ma50) * 100
  const maScore = Math.max(0, Math.min(100, Math.round(50 + maDiffPercent * 5)))

  // Factor 3: Volatility Ratio (20D vs Long-term 60D) - Weight 20%
  // Higher volatility spike during downturn indicates panic/fear
  const vol20 = calculateVolatility(closes, Math.min(20, closes.length - 2))
  const vol60 = calculateVolatility(closes, Math.min(60, closes.length - 2))
  const volRatio = vol60 > 0 ? vol20 / vol60 : 1
  // VolRatio > 1.5 = fear (panic), VolRatio < 0.8 = calm/greed
  const volScore = Math.max(0, Math.min(100, Math.round(100 - (volRatio - 0.5) * 60)))

  // Factor 4: Volume Flow Pressure (Up-day vol vs Down-day vol over 14 days) - Weight 15%
  const windowBars = bars.slice(-14)
  let upVol = 0
  let downVol = 0
  for (const bar of windowBars) {
    if (bar.close >= bar.open) upVol += bar.volume
    else downVol += bar.volume
  }
  const totalVol = upVol + downVol
  const volumeRatio = totalVol > 0 ? upVol / totalVol : 0.5
  const volumeScore = Math.max(0, Math.min(100, Math.round(volumeRatio * 100)))

  // Composite Weighted Score
  const rawScore = Math.round(
    rsiScore * 0.35 +
    maScore * 0.30 +
    volScore * 0.20 +
    volumeScore * 0.15
  )
  const compositeScore = Math.max(5, Math.min(95, rawScore))

  const factors: SentimentFactor[] = [
    {
      name: 'rsi',
      label: 'Momentum Harga (RSI-14)',
      score: rsiScore,
      weight: 35,
      valueFormatted: `${rsi.toFixed(1)}`,
      interpretation: rsi > 70 ? 'Overbought (Keserakahan)' : rsi < 30 ? 'Oversold (Ketakutan)' : 'Netral'
    },
    {
      name: 'ma_dev',
      label: 'Deviasi Moving Average (MA50)',
      score: maScore,
      weight: 30,
      valueFormatted: `${maDiffPercent >= 0 ? '+' : ''}${maDiffPercent.toFixed(1)}%`,
      interpretation: maDiffPercent > 3 ? 'Di atas tren rata-rata' : maDiffPercent < -3 ? 'Di bawah tren rata-rata' : 'Seimbang'
    },
    {
      name: 'volatility',
      label: 'Tekanan Volatilitas Pasar',
      score: volScore,
      weight: 20,
      valueFormatted: `${(vol20 * 100).toFixed(1)}% harian`,
      interpretation: volRatio > 1.3 ? 'Lonjakan kepanikan transaksi' : 'Volatilitas stabil terkendali'
    },
    {
      name: 'volume_flow',
      label: 'Arus Akumulasi / Distribusi',
      score: volumeScore,
      weight: 15,
      valueFormatted: `${Math.round(volumeRatio * 100)}% beli`,
      interpretation: volumeRatio > 0.55 ? 'Tekanan beli dominan' : volumeRatio < 0.45 ? 'Tekanan jual dominan' : 'Arus imbang'
    }
  ]

  return { score: compositeScore, factors }
}

/**
 * Evaluates Fear & Greed Index for an emiten given historical daily bars
 */
export const analyzeCompanyFearGreed = (bars: OhlcvBar[]): FearGreedAnalysis => {
  if (!bars || bars.length < 15) {
    return {
      score: 50,
      classification: 'Netral',
      summary: 'Data transaksi belum mencukupi untuk kalkulasi sentimen.',
      color: '#64748B',
      historicalSeries: [],
      factors: []
    }
  }

  // Calculate current score
  const { score, factors } = computeSingleScore(bars)

  // Calculate rolling 30-day historical trend
  const historicalSeries: HistoricalSentimentPoint[] = []
  const daysToTrack = Math.min(30, bars.length - 20)
  for (let i = daysToTrack; i >= 0; i--) {
    const subBars = bars.slice(0, bars.length - i)
    if (subBars.length >= 20) {
      const point = computeSingleScore(subBars)
      historicalSeries.push({
        time: subBars[subBars.length - 1].time,
        score: point.score
      })
    }
  }

  // Classification & color mapping
  let classification: SentimentClassification = 'Netral'
  let color = '#EAB308' // amber-500
  let summary = ''

  if (score < 25) {
    classification = 'Ketakutan Ekstrem'
    color = '#DC2626' // red-600
    summary = 'Kepanikan atau pesimisme berlebihan sedang mendominasi transaksi emiten. Seringkali membuka peluang akumulasi nilai kontrarian.'
  } else if (score < 45) {
    classification = 'Ketakutan'
    color = '#F97316' // orange-500
    summary = 'Sentimen investor cenderung berhati-hati dengan tekanan jual moderat. Momentum teknikal berada di bawah rata-rata historis.'
  } else if (score <= 55) {
    classification = 'Netral'
    color = '#3B82F6' // blue-500
    summary = 'Kekuatan pembeli dan penjual seimbang tanpa adanya euforia ataupun kepanikan yang mencolok.'
  } else if (score <= 75) {
    classification = 'Keserakahan'
    color = '#10B981' // emerald-500
    summary = 'Antusiasme beli dan momentum harga menguat. Tren harga berada di atas rata-rata dengan arus volume yang positif.'
  } else {
    classification = 'Keserakahan Ekstrem'
    color = '#059669' // emerald-600
    summary = 'Euforia pasar sangat tinggi. Harga mungkin mendekati batas jenuh beli (overbought) dengan risiko koreksi teknikal yang meningkat.'
  }

  return {
    score,
    classification,
    summary,
    color,
    historicalSeries,
    factors
  }
}

/**
 * Fast synchronous Fear & Greed calculator using deterministic market bars
 */
export const calculateFearGreed = (symbol: string, currentPrice: number = 5000): FearGreedAnalysis => {
  const bars = generateDeterministicCandles(symbol, currentPrice, 180, new Date(), '1D')
  return analyzeCompanyFearGreed(bars)
}
