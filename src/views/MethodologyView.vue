<script setup lang="ts">
import { useResearchStore } from '../stores/researchStore'
import { 
  Calculator, 
  ShieldCheck, 
  Award, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  FileText,
  HelpCircle,
  Database,
  SlidersHorizontal,
  BarChart3
} from '@lucide/vue'

const store = useResearchStore()
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- View Header -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
         <span class="section-kicker">Metodologi</span>
        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
           Transparansi skor
        </span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
         Cara skor dihitung
      </h1>
      <p class="text-sm text-slate-600 mt-1 max-w-3xl">
         Pahami lima faktor penilaian, cara membaca hasil, dan batas penggunaan skor dalam proses riset.
      </p>
    </div>

    <!-- The 5 Pillars Diagram & Architecture Card -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
       <h2 class="text-lg font-bold text-slate-900">1. Cara riset disusun</h2>
      <p class="text-xs text-slate-600 leading-relaxed max-w-3xl">
         Setiap tujuan melewati lima tahap agar proses penyaringan dan hasil akhirnya dapat ditinjau kembali.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-xs">
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-[#407EC9] font-bold mb-1">PILLAR 1</div>
          <div class="font-bold text-slate-900 font-sans">Menyusun rencana</div>
          <div class="text-xs text-slate-500 font-sans mt-1">Mengubah tujuan menjadi ruang lingkup dan langkah riset</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-[#407EC9] font-bold mb-1">PILLAR 2</div>
          <div class="font-bold text-slate-900 font-sans">Menyaring perusahaan</div>
          <div class="text-xs text-slate-500 font-sans mt-1">Mempersempit daftar secara bertahap (914 -> 284 -> 68 -> 18 -> 5)</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-[#407EC9] font-bold mb-1">PILLAR 3</div>
          <div class="font-bold text-slate-900 font-sans">Menganalisis kandidat</div>
          <div class="text-xs text-slate-500 font-sans mt-1">Analisis DuPont, neraca, dan perbandingan perusahaan sejenis</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-[#407EC9] font-bold mb-1">PILLAR 4</div>
          <div class="font-bold text-slate-900 font-sans">Mencatat aktivitas</div>
          <div class="text-xs text-slate-500 font-sans mt-1">Menyimpan status dan riwayat operasi pada sesi</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-[#407EC9] font-bold mb-1">PILLAR 5</div>
          <div class="font-bold text-slate-900 font-sans">Menyusun laporan</div>
          <div class="text-xs text-slate-500 font-sans mt-1">Merangkum skor, bukti, risiko, dan keterbatasan</div>
        </div>
      </div>
    </div>

    <!-- Scoring Formula Details -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
       <h2 class="text-lg font-bold text-slate-900">2. Lima faktor penilaian</h2>
      <p class="text-xs text-slate-600 leading-relaxed">
         Skor kualitas merangkum profitabilitas, pertumbuhan, solvabilitas, valuasi, dan konsistensi pada skala 0 sampai 100.
      </p>

      <div class="p-4 rounded-xl bg-[#407EC9]/5 border border-[#407EC9]/20 font-mono text-xs text-slate-800 space-y-2">
        <div class="font-bold text-[#407EC9] text-sm">
          Quality Score = (0.25 × P) + (0.25 × G) + (0.20 × S) + (0.20 × V) + (0.10 × C)
        </div>
        <div class="text-[11px] text-slate-600 pt-2 border-t border-[#407EC9]/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-sans">
          <div>
            <strong class="text-slate-900 block">Profitability (25%)</strong>
            ROE, ROA, Gross & Operating Margins vs Sector.
          </div>
          <div>
            <strong class="text-slate-900 block">Growth (25%)</strong>
            3Y Revenue CAGR & 3Y Net Income expansion.
          </div>
          <div>
            <strong class="text-slate-900 block">Solvency (20%)</strong>
            Debt/Equity, Current Ratio & Cash runway.
          </div>
          <div>
            <strong class="text-slate-900 block">Valuation (20%)</strong>
            P/E, P/BV & EV/EBITDA relative discount.
          </div>
          <div>
            <strong class="text-slate-900 block">Consistency (10%)</strong>
            Consecutive positive earnings & dividend stability.
          </div>
        </div>
      </div>
    </div>

    <!-- DuPont Model Deconstruction -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
      <h2 class="text-lg font-bold text-slate-900">3. 3-Stage DuPont ROE Decomposition</h2>
      <p class="text-xs text-slate-600 leading-relaxed">
        To isolate whether a company's high Return on Equity is driven by high pricing power, asset velocity, or financial leverage:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h4 class="text-xs font-bold text-slate-900 uppercase font-mono">1. Operating Profit Margin</h4>
          <p class="text-xs text-slate-500 mt-1">Net Income ÷ Revenue. Measures pricing power and cost efficiency.</p>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h4 class="text-xs font-bold text-slate-900 uppercase font-mono">2. Asset Turnover Ratio</h4>
          <p class="text-xs text-slate-500 mt-1">Revenue ÷ Total Assets. Measures operational speed and inventory turnover.</p>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h4 class="text-xs font-bold text-slate-900 uppercase font-mono">3. Financial Leverage</h4>
          <p class="text-xs text-slate-500 mt-1">Total Assets ÷ Shareholder Equity. Identifies reliance on debt vs equity capital.</p>
        </div>
      </div>
    </div>
  </div>
</template>
