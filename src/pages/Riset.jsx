import { useRef, useState } from 'react'
import { BarChart2, CheckCircle, Clock, Download, Eye, FileSpreadsheet, FlaskConical, Link2, Send, Upload, XCircle } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { can } from '../config/roleConfig'
import { downloadResearchTemplate, exportResearchWorkbook, parseResearchWorkbook } from '../lib/researchExcel'

const statusClass = {
  Published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Ready to submit': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const emptyForm = {
  code: '',
  title: '',
  type: 'Market Research',
  owner: '',
  status: 'Draft',
  evidence: '',
  background: '',
  objective: '',
  method: 'Interview + desk research',
  dataSource: '',
  expectedOutput: '',
  deadline: '',
  reviewNotes: '',
}

function withDefaults(item = {}) {
  return {
    background: 'Belum diisi.',
    objective: 'Belum diisi.',
    method: 'Belum diisi.',
    dataSource: 'Belum diisi.',
    expectedOutput: 'Belum diisi.',
    deadline: '',
    reviewNotes: '',
    comments: [],
    ...item,
  }
}

export default function Riset() {
  const {
    researchNotes, members, tasks, addResearchNote, updateResearchNote,
    addTask, currentUser, addAuditLog, mergeResearchNotesFromExcel,
    markResearchExcelExported, excelConnection,
  } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({ ...emptyForm, owner: currentUser?.id || 'u1' })
  const [comment, setComment] = useState('')
  const [excelMessage, setExcelMessage] = useState('')
  const fileInputRef = useRef(null)
  const role = currentUser?.role || 'riset'
  const canApprove = can(role, 'research', 'approve')
  const canPublish = can(role, 'research', 'publish')
  const selected = withDefaults(researchNotes.find(item => item.id === selectedId))
  const researchTasks = tasks.filter(task => task.tags?.includes('Riset'))
  const submitted = researchNotes.filter(item => ['Submitted', 'Ready to submit', 'Published'].includes(item.status)).length

  const resetForm = () => setForm({ ...emptyForm, owner: currentUser?.id || 'u1' })

  const saveResearch = () => {
    const owner = members.find(member => member.id === form.owner) || currentUser
    addResearchNote({
      ...form,
      pic: owner?.name || currentUser?.name,
      equity: [true, false, false, false, false, false],
      comments: [],
    })
    addTask({
      title: `Kickoff ${form.title}`,
      status: 'todo',
      priority: 'normal',
      projectId: 'p1',
      assignees: [form.owner],
      dueDate: form.deadline || new Date().toISOString().split('T')[0],
      tags: ['Riset', form.type],
      description: `Mulai riset ${form.code}: ${form.evidence || 'Lengkapi evidence awal dan timeline equity.'}`,
    })
    addAuditLog({
      actor: currentUser.id,
      action: 'Membuat riset',
      target: form.code,
      before: '-',
      after: form.status,
      time: new Date().toLocaleString('id-ID'),
    })
    setShowForm(false)
    resetForm()
  }

  const updateStatus = (status, note = '') => {
    const reviewNotes = note || selected.reviewNotes
    updateResearchNote(selected.id, { status, reviewNotes })
    addAuditLog({
      actor: currentUser.id,
      action: 'Update status riset',
      target: selected.code,
      before: selected.status,
      after: status,
      time: new Date().toLocaleString('id-ID'),
    })
  }

  const saveDetail = () => {
    const owner = members.find(member => member.id === selected.owner)
    updateResearchNote(selected.id, {
      background: selected.background,
      objective: selected.objective,
      method: selected.method,
      dataSource: selected.dataSource,
      expectedOutput: selected.expectedOutput,
      deadline: selected.deadline,
      reviewNotes: selected.reviewNotes,
      pic: owner?.name || selected.pic,
    })
  }

  const patchSelected = (updates) => {
    updateResearchNote(selected.id, updates)
  }

  const addComment = () => {
    if (!comment.trim()) return
    const nextComments = [
      ...(selected.comments || []),
      {
        id: `rc${Date.now()}`,
        author: currentUser.name,
        text: comment.trim(),
        time: new Date().toLocaleString('id-ID'),
      },
    ]
    updateResearchNote(selected.id, { comments: nextComments })
    setComment('')
  }

  const toggleEquity = (item, index) => {
    const nextEquity = item.equity.map((done, i) => i === index ? !done : done)
    updateResearchNote(item.id, { equity: nextEquity })
  }

  const importExcel = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const payload = await parseResearchWorkbook(file, members)
      if (!payload.rows.length) {
        setExcelMessage('File terbaca, tetapi belum ada baris riset yang valid.')
        return
      }

      mergeResearchNotesFromExcel(payload)
      addAuditLog({
        actor: currentUser.id,
        action: 'Import Excel riset',
        target: payload.fileName,
        before: `${researchNotes.length} riset`,
        after: `${payload.rows.length} baris dari sheet ${payload.sheetName}`,
        time: new Date().toLocaleString('id-ID'),
      })
      setExcelMessage(`${payload.rows.length} baris tersambung dari ${payload.fileName}.`)
    } catch (error) {
      setExcelMessage(`Gagal membaca Excel: ${error.message}`)
    } finally {
      event.target.value = ''
    }
  }

  const exportExcel = async () => {
    const filename = `grcc-riset-${new Date().toISOString().split('T')[0]}.xlsx`
    try {
      await exportResearchWorkbook(researchNotes, filename)
      markResearchExcelExported(filename)
      addAuditLog({
        actor: currentUser.id,
        action: 'Export Excel riset',
        target: filename,
        before: '-',
        after: `${researchNotes.length} riset`,
        time: new Date().toLocaleString('id-ID'),
      })
      setExcelMessage(`Workbook ${filename} dibuat dari data riset saat ini.`)
    } catch (error) {
      setExcelMessage(`Gagal membuat workbook: ${error.message}`)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard Riset</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Monitoring riset, approval workflow, detail metodologi, dan timeline equity mingguan.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium">
          <FlaskConical className="w-4 h-4" /> Tambah Riset
        </button>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{researchNotes.length}</p><p className="text-xs text-gray-500 dark:text-gray-400">Total Riset</p></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4"><p className="text-2xl font-bold text-blue-600">{submitted}</p><p className="text-xs text-gray-500 dark:text-gray-400">Submitted/Ready</p></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4"><p className="text-2xl font-bold text-yellow-600">{researchNotes.filter(r => r.status === 'Review').length}</p><p className="text-xs text-gray-500 dark:text-gray-400">Review</p></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4"><p className="text-2xl font-bold text-primary-600">{researchTasks.length}</p><p className="text-xs text-gray-500 dark:text-gray-400">Task Riset</p></div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Koneksi Excel Riset</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${excelConnection.status === 'connected' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                <Link2 className="w-3 h-3" /> {excelConnection.status === 'connected' ? 'Terhubung' : 'Belum terhubung'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {excelConnection.fileName
                ? `${excelConnection.fileName}${excelConnection.sheetName ? ` · Sheet ${excelConnection.sheetName}` : ''} · ${excelConnection.importedRows || 0} baris`
                : 'Import workbook Excel untuk memperbarui dashboard riset berdasarkan kolom Code.'}
            </p>
            {(excelConnection.lastImportedAt || excelConnection.lastExportedAt || excelMessage) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {excelMessage || `Import terakhir: ${excelConnection.lastImportedAt || '-'} · Export terakhir: ${excelConnection.lastExportedAt || '-'}`}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <input ref={fileInputRef} type="file" accept=".xlsx" onChange={importExcel} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-medium">
              <Upload className="w-4 h-4" /> Hubungkan Excel
            </button>
            <button type="button" onClick={exportExcel} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium">
              <Download className="w-4 h-4" /> Export Excel
            </button>
            <button type="button" onClick={downloadResearchTemplate} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium">
              <FileSpreadsheet className="w-4 h-4" /> Template
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[110px_1.4fr_1fr_1fr_140px_220px_90px] gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <span>Code</span><span>Title</span><span>Type</span><span>PIC</span><span>Status</span><span>Timeline Equity</span><span>Aksi</span>
        </div>
        {researchNotes.map(rawItem => {
          const item = withDefaults(rawItem)
          const owner = members.find(member => member.id === item.owner)
          return (
            <div key={item.id} className="grid md:grid-cols-[110px_1.4fr_1fr_1fr_140px_220px_90px] gap-3 px-4 py-4 border-b last:border-0 border-gray-100 dark:border-gray-800 items-center">
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{item.code}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.evidence}</p>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">{item.type}</span>
              <div className="flex items-center gap-2">
                <Avatar user={owner} size="xs" />
                <span className="text-xs text-gray-600 dark:text-gray-400">{item.pic}</span>
              </div>
              <span className={`w-max px-2 py-1 rounded-lg text-xs font-medium ${statusClass[item.status]}`}>{item.status}</span>
              <div className="flex items-center gap-1">
                {item.equity.map((done, index) => (
                  <button key={index} type="button" title={`Week ${index + 1}`} onClick={() => toggleEquity(item, index)}
                    className={`h-7 flex-1 rounded-md flex items-center justify-center ${done ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'}`}>
                    {done ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  </button>
                ))}
              </div>
              <button onClick={() => setSelectedId(item.id)} className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
                <Eye className="w-3 h-3" /> Detail
              </button>
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary-600" /> Status Pipeline</h3>
        <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {Object.keys(statusClass).map(status => (
            <div key={status} className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{researchNotes.filter(item => item.status === status).length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{status}</p>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Riset" size="lg">
        <div className="space-y-4">
          <ResearchForm form={form} setForm={setForm} members={members} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Batal</Button>
            <Button variant="primary" onClick={saveResearch} disabled={!form.code.trim() || !form.title.trim()} className="flex-1">Simpan Riset</Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(selectedId)} onClose={() => setSelectedId(null)} title="Detail Riset" size="xl">
        {selectedId && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-primary-600 dark:text-primary-400">{selected.code}</p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selected.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selected.type} · PIC {selected.pic}</p>
              </div>
              <span className={`w-max px-2 py-1 rounded-lg text-xs font-medium ${statusClass[selected.status]}`}>{selected.status}</span>
            </div>

            <ResearchDetailEditor item={selected} onChange={patchSelected} />

            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Approval Workflow</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => updateStatus('Review')}>Ajukan Review</Button>
                <Button variant="outline" onClick={() => updateStatus('Ready to submit')} disabled={!canApprove}>Approve Review</Button>
                <Button variant="primary" onClick={() => updateStatus('Submitted')} disabled={!canApprove}>Submit</Button>
                <Button variant="success" onClick={() => updateStatus('Published')} disabled={!canPublish}>Published</Button>
                <Button variant="danger" onClick={() => updateStatus('Rejected', selected.reviewNotes || 'Ditolak oleh koordinator.')} disabled={!canApprove}><XCircle className="w-4 h-4" /> Reject</Button>
              </div>
              {!canApprove && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Approve, submit, publish, dan reject hanya untuk Koordinator Riset.</p>}
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Komentar Riset</p>
              <div className="space-y-2 mb-3 max-h-44 overflow-y-auto">
                {(selected.comments || []).map(item => (
                  <div key={item.id} className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{item.author}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.text}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{item.time}</p>
                  </div>
                ))}
                {(selected.comments || []).length === 0 && <p className="text-xs text-gray-400 dark:text-gray-600">Belum ada komentar.</p>}
              </div>
              <div className="flex gap-2">
                <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()} placeholder="Tulis komentar atau catatan revisi..." className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
                <Button onClick={addComment}><Send className="w-4 h-4" /> Kirim</Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedId(null)} className="flex-1">Tutup</Button>
              <Button variant="primary" onClick={saveDetail} className="flex-1">Simpan Detail</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function ResearchForm({ form, setForm, members }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Code"><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="RS-001" className="field" /></Field>
        <Field label="Deadline"><input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="field" /></Field>
      </div>
      <Field label="Judul Riset"><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="field" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="field">
            {['Market Research', 'Training Research', 'Operational Research', 'Marketing Research', 'Desk Research'].map(type => <option key={type}>{type}</option>)}
          </select>
        </Field>
        <Field label="PIC">
          <select value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} className="field">
            {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Latar Belakang"><textarea value={form.background} onChange={e => setForm({ ...form, background: e.target.value })} rows={2} className="field resize-none" /></Field>
      <Field label="Tujuan Riset"><textarea value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} rows={2} className="field resize-none" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Metode"><input value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} className="field" /></Field>
        <Field label="Sumber Data"><input value={form.dataSource} onChange={e => setForm({ ...form, dataSource: e.target.value })} className="field" /></Field>
      </div>
      <Field label="Output yang Diharapkan"><input value={form.expectedOutput} onChange={e => setForm({ ...form, expectedOutput: e.target.value })} className="field" /></Field>
      <Field label="Evidence / Catatan Awal"><textarea value={form.evidence} onChange={e => setForm({ ...form, evidence: e.target.value })} rows={3} className="field resize-none" /></Field>
    </>
  )
}

function ResearchDetailEditor({ item, onChange }) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <Field label="Latar Belakang"><textarea value={item.background} onChange={e => onChange({ background: e.target.value })} rows={3} className="field resize-none" /></Field>
      <Field label="Tujuan"><textarea value={item.objective} onChange={e => onChange({ objective: e.target.value })} rows={3} className="field resize-none" /></Field>
      <Field label="Metode"><input value={item.method} onChange={e => onChange({ method: e.target.value })} className="field" /></Field>
      <Field label="Sumber Data"><input value={item.dataSource} onChange={e => onChange({ dataSource: e.target.value })} className="field" /></Field>
      <Field label="Output"><input value={item.expectedOutput} onChange={e => onChange({ expectedOutput: e.target.value })} className="field" /></Field>
      <Field label="Deadline"><input type="date" value={item.deadline || ''} onChange={e => onChange({ deadline: e.target.value })} className="field" /></Field>
      <div className="md:col-span-2">
        <Field label="Catatan Review"><textarea value={item.reviewNotes} onChange={e => onChange({ reviewNotes: e.target.value })} rows={3} className="field resize-none" /></Field>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}</span>
      {children}
    </label>
  )
}
