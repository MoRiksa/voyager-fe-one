import assert from 'node:assert/strict'
import { localRuntime } from './local-test-runtime.mjs'
const r = await localRuntime({ browser: true })
try {
  const created = await r.create(); await r.start(created); await r.finish(created.id)
  const checks = [
    ['/', 'Temukan kandidat untuk diteliti lebih lanjut'],
    ['/research', 'Temukan dan lanjutkan riset Anda'],
    ['/research/new', 'Pilih tujuan secara eksplisit'],
    [`/research/${created.id}`, 'Cakupan dan aturan yang diperiksa'],
    [`/research/${created.id}/screener`, 'Proses penyaringan'],
    [`/research/${created.id}/peers`, 'Benchmark peer sektor belum didukung'],
    [`/research/${created.id}/report`, 'Tujuan terjawab pada cakupan terbatas'],
    [`/research/${created.id}/company/TEST`, 'TEST — TEST synthetic test input'],
    ['/company/TEST', 'Profil global bukan hasil screening'],
    ['/methodology', 'Cara skor dihitung'],
    ['/glossary', 'Kamus Istilah Finansial'],
    [`/research/${created.id}/activity`, 'Cakupan dan aturan yang diperiksa'],
    [`/research/${created.id}/trace`, 'Cakupan dan aturan yang diperiksa'],
    ['/activity', 'Temukan dan lanjutkan riset Anda'],
    ['/trace', 'Temukan dan lanjutkan riset Anda'],
    ['/schedules', 'Temukan dan lanjutkan riset Anda'],
    ['/screener', 'Tahap seleksi belum tersedia'],
    ['/peers', 'Menunggu kandidat akhir'],
    ['/report', 'Laporan belum tersedia'],
    ['/does-not-exist', 'Halaman tidak ditemukan'],
    ['/research/UNKNOWN/report', 'Halaman tidak ditemukan']
  ]
  for (const [path, text] of checks) { await r.navigate(path); await r.text(text) }
  assert.deepEqual(r.exceptions, [])
  console.log(`LOCAL smoke: ${checks.length} routes rendered in Chromium against new backend; no runtime exceptions.`)
} finally { await r.close() }
