import { AlertTriangle, Calculator, Download, Printer } from 'lucide-react'
import useAppStore from '../store/useAppStore'

function formatRp(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function sumLines(lines) {
  return lines.reduce((sum, line) => sum + line.qty * line.amount, 0)
}

export default function Rab() {
  const { rab, currentUser, addAuditLog } = useAppStore()
  const gross = rab.income.participants * rab.income.investment
  const dpp = rab.income.dpp || 0
  const ppn = rab.income.ppn || 0
  const institutionalFee = Math.round(gross * ((rab.income.institutionalFee || 0) / 100))
  const actualIncome = gross - dpp - ppn - institutionalFee
  const personnel = sumLines(rab.expenses.personnel)
  const committee = sumLines(rab.expenses.committee)
  const nonPersonnel = sumLines(rab.expenses.nonPersonnel)
  const totalExpense = personnel + committee + nonPersonnel
  const profit = actualIncome - totalExpense
  const margin = actualIncome > 0 ? Math.round((profit / actualIncome) * 100) : 0
  const warnings = [
    profit < 0 && 'RAB rugi: pengeluaran lebih besar dari penerimaan aktual.',
    totalExpense > actualIncome * 0.85 && 'Pengeluaran sudah melewati 85% penerimaan aktual.',
    rab.income.investment <= 0 && 'Nilai investasi belum diisi.',
  ].filter(Boolean)
  const exportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Penerimaan Awal', gross],
      ['DPP', dpp],
      ['PPN', ppn],
      ['Institutional Fee', institutionalFee],
      ['Penerimaan Aktual', actualIncome],
      ['Honor Personel', personnel],
      ['Honor Kepanitiaan', committee],
      ['Biaya Non-Personel', nonPersonnel],
      ['Total Pengeluaran', totalExpense],
      ['Profit/Loss', profit],
      ['Margin', `${margin}%`],
    ]
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'rab-sertifikasi.csv'
    link.click()
    URL.revokeObjectURL(url)
    addAuditLog({ actor: currentUser.id, action: 'Export CSV RAB', target: 'rab-sertifikasi.csv', before: '-', after: formatRp(profit), time: new Date().toLocaleString('id-ID') })
  }
  const printRab = () => {
    addAuditLog({ actor: currentUser.id, action: 'Print RAB', target: 'RAB Sertifikasi', before: '-', after: 'print', time: new Date().toLocaleString('id-ID') })
    window.print()
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">RAB</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Khusus Super Admin/Manager: pemasukan, pengeluaran, profit/loss, export CSV dan print.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={printRab} className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-xl text-sm"><Printer className="w-4 h-4" /> Print</button>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"><p className="text-xl font-bold text-gray-900 dark:text-white">{formatRp(gross)}</p><p className="text-xs text-gray-500 dark:text-gray-400">Total Penerimaan Awal</p></div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"><p className="text-xl font-bold text-primary-600">{formatRp(actualIncome)}</p><p className="text-xs text-gray-500 dark:text-gray-400">Penerimaan Aktual</p></div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"><p className="text-xl font-bold text-red-600">{formatRp(totalExpense)}</p><p className="text-xs text-gray-500 dark:text-gray-400">Total Pengeluaran</p></div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"><p className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatRp(profit)}</p><p className="text-xs text-gray-500 dark:text-gray-400">Profit/Loss · {margin}%</p></div>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-2xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 p-4">
          {warnings.map(warning => <p key={warning} className="text-sm text-orange-700 dark:text-orange-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {warning}</p>)}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {[
          ['Honor Personel', rab.expenses.personnel, personnel],
          ['Honor Kepanitiaan', rab.expenses.committee, committee],
          ['Biaya Non-Personel', rab.expenses.nonPersonnel, nonPersonnel],
        ].map(([title, lines, total]) => (
          <div key={title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2"><Calculator className="w-4 h-4 text-primary-600" /> {title}</h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 mt-3">
              {lines.map(line => <div key={line.name} className="py-2 flex items-center justify-between gap-3 text-sm"><span className="text-gray-600 dark:text-gray-400">{line.name} x{line.qty}</span><span className="font-semibold text-gray-900 dark:text-white">{formatRp(line.qty * line.amount)}</span></div>)}
            </div>
            <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between text-sm font-bold"><span>Total</span><span>{formatRp(total)}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}
