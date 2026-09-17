/**
 * Order Block Detector
 * 
 * TypeScript translation of TradingView Pine Script v5 from `script.lua`.
 * Detects institutional order blocks (Bullish & Bearish supply/demand zones)
 * using volume pivot highs, market structure tracking, and wick/close mitigation.
 */

import type { OhlcvBar } from '../services/marketDataService'

export interface OrderBlock {
  id: string
  type: 'bullish' | 'bearish'
  top: number
  bottom: number
  avg: number // midpoint line
  startIndex: number
  startTime: string | number
  isMitigated: boolean
  mitigatedTime?: string | number
}

export interface PivotMarker {
  time: string | number
  type: 'bullish_ob' | 'bearish_ob'
  price: number
  text: string
}

export interface OrderBlockDetectorOptions {
  length?: number // Pivot length (default 5)
  maxBullish?: number // Maximum simultaneous bullish OBs (default 3)
  maxBearish?: number // Maximum simultaneous bearish OBs (default 3)
  mitigation?: 'Wick' | 'Close' // Mitigation detection mode (default 'Wick')
}

export interface OrderBlockResult {
  activeBullish: OrderBlock[]
  activeBearish: OrderBlock[]
  allOrderBlocks: OrderBlock[]
  pivotMarkers: PivotMarker[]
}

/**
 * Computes whether a bar is a volume pivot high (highest volume in window on both sides)
 * Equivalent to Pine Script: ta.pivothigh(volume, length, length)
 */
export const isVolumePivotHigh = (
  bars: OhlcvBar[],
  pivotIndex: number,
  length: number
): boolean => {
  if (pivotIndex < length || pivotIndex + length >= bars.length) {
    return false
  }
  const pivotVol = bars[pivotIndex].volume
  for (let i = pivotIndex - length; i <= pivotIndex + length; i++) {
    if (i !== pivotIndex && bars[i].volume >= pivotVol) {
      return false
    }
  }
  return true
}

/**
 * Executes the Order Block Detector algorithm over a series of daily OHLCV bars
 */
export const detectOrderBlocks = (
  bars: OhlcvBar[],
  options: OrderBlockDetectorOptions = {}
): OrderBlockResult => {
  const length = options.length ?? 5
  const maxBullish = options.maxBullish ?? 3
  const maxBearish = options.maxBearish ?? 3
  const mitigationMode = options.mitigation ?? 'Wick'

  if (bars.length < length * 2 + 1) {
    return { activeBullish: [], activeBearish: [], allOrderBlocks: [], pivotMarkers: [] }
  }

  // Running state
  let os = 0 // 0 = Bearish territory, 1 = Bullish territory
  const allOrderBlocks: OrderBlock[] = []
  const pivotMarkers: PivotMarker[] = []

  // Iterate chronologically through bars
  for (let barIdx = length; barIdx < bars.length; barIdx++) {
    // Current window metrics
    let highestHigh = -Infinity
    let lowestLow = Infinity
    let highestClose = -Infinity
    let lowestClose = Infinity

    for (let k = barIdx - length + 1; k <= barIdx; k++) {
      if (bars[k].high > highestHigh) highestHigh = bars[k].high
      if (bars[k].low < lowestLow) lowestLow = bars[k].low
      if (bars[k].close > highestClose) highestClose = bars[k].close
      if (bars[k].close < lowestClose) lowestClose = bars[k].close
    }

    const pivotBarIdx = barIdx - length
    const pivotBar = bars[pivotBarIdx]

    // Market structure tracker (Pine Script: os := high[length] > upper ? 0 : low[length] < lower ? 1 : os[1])
    if (pivotBar.high > highestHigh) {
      os = 0
    } else if (pivotBar.low < lowestLow) {
      os = 1
    }

    // Volume pivot high check at pivotBar
    const phv = isVolumePivotHigh(bars, pivotBarIdx, length)

    // Midpoint of the pivot bar: hl2 = (high + low) / 2
    const hl2 = (pivotBar.high + pivotBar.low) / 2

    // 1. Bullish Order Block condition: phv and os === 1
    if (phv && os === 1) {
      const top = hl2
      const bottom = pivotBar.low
      const avg = (top + bottom) / 2

      const ob: OrderBlock = {
        id: `bull-ob-${pivotBarIdx}`,
        type: 'bullish',
        top,
        bottom,
        avg,
        startIndex: pivotBarIdx,
        startTime: pivotBar.time,
        isMitigated: false
      }
      allOrderBlocks.push(ob)
      pivotMarkers.push({
        time: pivotBar.time,
        type: 'bullish_ob',
        price: bottom,
        text: 'Bullish OB'
      })
    }

    // 2. Bearish Order Block condition: phv and os === 0
    if (phv && os === 0) {
      const top = pivotBar.high
      const bottom = hl2
      const avg = (top + bottom) / 2

      const ob: OrderBlock = {
        id: `bear-ob-${pivotBarIdx}`,
        type: 'bearish',
        top,
        bottom,
        avg,
        startIndex: pivotBarIdx,
        startTime: pivotBar.time,
        isMitigated: false
      }
      allOrderBlocks.push(ob)
      pivotMarkers.push({
        time: pivotBar.time,
        type: 'bearish_ob',
        price: top,
        text: 'Bearish OB'
      })
    }

    // 3. Check for mitigation on currently active unmitigated OBs
    for (const ob of allOrderBlocks) {
      if (!ob.isMitigated && barIdx > ob.startIndex) {
        if (ob.type === 'bullish') {
          const testVal = mitigationMode === 'Close' ? lowestClose : lowestLow
          if (testVal < ob.bottom) {
            ob.isMitigated = true
            ob.mitigatedTime = bars[barIdx].time
          }
        } else {
          const testVal = mitigationMode === 'Close' ? highestClose : highestHigh
          if (testVal > ob.top) {
            ob.isMitigated = true
            ob.mitigatedTime = bars[barIdx].time
          }
        }
      }
    }
  }

  // Filter most recent unmitigated OBs up to max limits
  const activeBullish = allOrderBlocks
    .filter(ob => ob.type === 'bullish' && !ob.isMitigated)
    .slice(-maxBullish)

  const activeBearish = allOrderBlocks
    .filter(ob => ob.type === 'bearish' && !ob.isMitigated)
    .slice(-maxBearish)

  return {
    activeBullish,
    activeBearish,
    allOrderBlocks,
    pivotMarkers
  }
}
