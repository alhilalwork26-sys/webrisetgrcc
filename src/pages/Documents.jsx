import { useMemo, useRef, useState } from 'react'
import { Copy, ExternalLink, Eye, FileText, FolderOpen, FolderPlus, Link2, Lock, Paperclip, Upload } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import { can } from '../config/roleConfig'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

const emptyForm = {
  judul: '',
  folder: 'Brief Riset',
  visibility: 'public',
  fileName: '',
  ringkasan: '',
  googleDocUrl: '',
  source: 'google_doc',
}

const emptyFolderForm = {
  name: '',
  visibility: 'public',
  description: '',
}

function extractGoogleFileId(url) {
  const text = String(url || '').trim()
  if (!text) return ''
  const docMatch = text.match(/\/document\/d\/([a-zA-Z0-9_-]+)/)
  if (docMatch) return docMatch[1]
  const openMatch = text.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (openMatch) return openMatch[1]
  return ''
}

function normalizeDocUrl(url) {
  const text = String(url || '').trim()
  const id = extractGoogleFileId(text)
  return id ? `https://docs.google.com/document/d/${id}/edit` : text
}

function googleCreateUrl(title) {
  const params = new URLSearchParams()
  if (title) params.set('title', title)
  return `https://docs.google.com/document/create${params.toString() ? `?${params.toString()}` : ''}`
}

function docStatus(doc) {
  if (doc.googleDocUrl) return { label: 'Google Docs', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
  if (doc.source === 'pending_upload') return { label: 'Perlu upload', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' }
  return { label: 'Metadata', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
}

export default function Documents() {
  const { notulen, documentFolders, currentUser, addNotulen, addDocumentFolder, addAuditLog } = useAppStore()
  const role = currentUser?.role || 'riset'
  const [showForm, setShowForm] = useState(false)
  const [showFolderForm, setShowFolderForm] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [copiedId, setCopiedId] = useState('')
  const [activeFolder, setActiveFolder] = useState('all')
  const [form, setForm] = useState(emptyForm)
  const [folderForm, setFolderForm] = useState(emptyFolderForm)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const docs = notulen.filter(doc => doc.visibility !== 'important' || can(role, 'documents', 'viewImportant'))
  const visibleDocs = activeFolder === 'all' ? docs : docs.filter(doc => doc.folder === activeFolder)
  const connected = notulen.filter(doc => doc.googleDocUrl).length
  const pendingUpload = notulen.filter(doc => doc.source === 'pending_upload' || !doc.googleDocUrl).length

  const folders = useMemo(() => {
    const savedFolders = documentFolders?.map(folder => folder.name).filter(Boolean) || []
    return Array.from(new Set([...savedFolders, ...notulen.map(doc => doc.folder).filter(Boolean)]))
  }, [documentFolders, notulen])
  const folderExists = folders.some(folder => folder.toLowerCase() === folderForm.name.trim().toLowerCase())
  const folderStats = folders.map(name => ({
    name,
    count: docs.filter(doc => doc.folder === name).length,
    meta: documentFolders?.find(folder => folder.name === name),
  }))

  const resetForm = () => {
    setForm(emptyForm)
    setSelectedFile(null)
  }
  const resetFolderForm = () => setFolderForm(emptyFolderForm)

  const openDoc = (doc) => {
    if (!doc.googleDocUrl) return
    window.open(normalizeDocUrl(doc.googleDocUrl), '_blank', 'noopener,noreferrer')
    addAuditLog({
      actor: currentUser.id,
      action: 'Buka Google Docs',
      target: doc.judul,
      before: '-',
      after: doc.googleFileId || extractGoogleFileId(doc.googleDocUrl),
      time: new Date().toLocaleString('id-ID'),
    })
  }

  const copyLink = async (doc) => {
    if (!doc.googleDocUrl) return
    await navigator.clipboard.writeText(normalizeDocUrl(doc.googleDocUrl))
    setCopiedId(doc.id)
    setTimeout(() => setCopiedId(''), 1400)
  }

  const createGoogleDoc = () => {
    window.open(googleCreateUrl(form.judul), '_blank', 'noopener,noreferrer')
  }

  const pickFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile({
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      lastModified: file.lastModified,
    })
    setForm(current => ({
      ...current,
      fileName: current.fileName || file.name,
      judul: current.judul || file.name.replace(/\.[^.]+$/, ''),
      source: 'pending_upload',
    }))
    event.target.value = ''
  }

  const saveDocument = () => {
    const normalizedUrl = normalizeDocUrl(form.googleDocUrl)
    const googleFileId = extractGoogleFileId(normalizedUrl)
    addNotulen({
      ...form,
      fileName: form.fileName || selectedFile?.name || '',
      fileSize: selectedFile?.size || 0,
      originalMimeType: selectedFile?.type || '',
      googleDocUrl: normalizedUrl,
      googleFileId,
      storageProvider: googleFileId ? 'google_drive' : 'metadata',
      source: googleFileId ? 'google_doc' : 'pending_upload',
      mimeType: googleFileId ? 'application/vnd.google-apps.document' : '',
      tanggal: new Date().toISOString().split('T')[0],
      jenis: form.visibility === 'important' ? 'Penting' : 'Dokumen Riset',
      author: currentUser.name,
      peserta: currentUser.department,
      keputusan: form.visibility === 'important' ? 'Akses real mengikuti permission Google Drive dan lapisan PIN website.' : 'Dokumen tersimpan sebagai metadata website dengan sumber Google Docs.',
      lastSyncedAt: new Date().toLocaleString('id-ID'),
    })
    addAuditLog({
      actor: currentUser.id,
      action: googleFileId ? 'Tambah dokumen Google Docs' : 'Catat file untuk upload Drive',
      target: form.judul,
      before: '-',
      after: googleFileId || selectedFile?.name || form.visibility,
      time: new Date().toLocaleString('id-ID'),
    })
    setShowForm(false)
    resetForm()
  }

  const saveFolder = () => {
    const name = folderForm.name.trim()
    if (!name || folderExists) return
    addDocumentFolder({
      ...folderForm,
      name,
      createdBy: currentUser.id,
    })
    addAuditLog({
      actor: currentUser.id,
      action: 'Buat folder dokumen',
      target: name,
      before: '-',
      after: folderForm.visibility,
      time: new Date().toLocaleString('id-ID'),
    })
    setActiveFolder(name)
    setForm(current => ({ ...current, folder: name }))
    setShowFolderForm(false)
    resetFolderForm()
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dokumen Riset</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Metadata dokumen di portal, isi dokumen di Google Docs agar bisa diedit langsung dan kolaboratif.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowFolderForm(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium">
            <FolderPlus className="w-4 h-4" /> Buat Folder
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium">
            <Upload className="w-4 h-4" /> Upload Dokumen
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{notulen.length}</p><p className="text-xs text-gray-500 dark:text-gray-400">Total Metadata</p></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4"><p className="text-2xl font-bold text-primary-600">{folders.length}</p><p className="text-xs text-gray-500 dark:text-gray-400">Folder Portal</p></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4"><p className="text-2xl font-bold text-yellow-600">{pendingUpload}</p><p className="text-xs text-gray-500 dark:text-gray-400">Belum Ada Link</p></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4"><p className="text-2xl font-bold text-green-600">{connected}</p><p className="text-xs text-gray-500 dark:text-gray-400">Terhubung Google Docs</p></div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Folder Dokumen</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Folder portal untuk mengelompokkan metadata dan link Google Docs.</p>
          </div>
          <button onClick={() => setShowFolderForm(true)} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium">
            <FolderPlus className="w-4 h-4" /> Folder Baru
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setActiveFolder('all')} className={`shrink-0 rounded-xl px-3 py-2 text-sm border ${activeFolder === 'all' ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-700'}`}>
            Semua <span className="ml-1 text-xs opacity-80">{docs.length}</span>
          </button>
          {folderStats.map(folder => (
            <button key={folder.name} onClick={() => setActiveFolder(folder.name)} className={`shrink-0 min-w-40 rounded-xl px-3 py-2 text-left border ${activeFolder === folder.name ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-700'}`}>
              <span className="block text-sm font-medium">{folder.name}</span>
              <span className="block text-xs opacity-80">{folder.count} dokumen{folder.meta?.visibility === 'important' ? ' · penting' : ''}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center"><FolderOpen className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Penyimpanan Aktif: Google Drive + Database Portal</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-3xl">Isi dokumen diedit di Google Docs. Portal menyimpan indeks, folder, akses, status, pemilik, dan link edit. Upload otomatis ke Drive perlu OAuth Google di backend; sementara ini link Google Docs yang ditempel sudah menjadi koneksi real ke dokumen yang bisa diedit.</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleDocs.map(doc => {
          const status = docStatus(doc)
          return (
            <div key={doc.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                <div className="flex flex-wrap gap-1 justify-end">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${status.className}`}><Link2 className="w-3 h-3" /> {status.label}</span>
                  {doc.visibility === 'important' && <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><Lock className="w-3 h-3" /> PIN</span>}
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-4">{doc.judul}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{doc.folder} · {doc.fileName || doc.googleFileId || 'Google Docs'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-3">{doc.ringkasan}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => setPreviewDoc(doc)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400"><Eye className="w-3 h-3" /> Preview</button>
                <button onClick={() => openDoc(doc)} disabled={!doc.googleDocUrl} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 text-white text-xs"><ExternalLink className="w-3 h-3" /> Edit</button>
                <button onClick={() => copyLink(doc)} disabled={!doc.googleDocUrl} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 disabled:opacity-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400"><Copy className="w-3 h-3" /> {copiedId === doc.id ? 'Tersalin' : 'Link'}</button>
              </div>
            </div>
          )
        })}
        {visibleDocs.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
            <FolderOpen className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-3">Folder ini belum punya dokumen</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tambahkan dokumen dan pilih folder ini agar muncul di sini.</p>
          </div>
        )}
      </div>

      <Modal open={Boolean(previewDoc)} onClose={() => setPreviewDoc(null)} title="Preview Dokumen" size="md">
        {previewDoc && (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">{previewDoc.folder}</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{previewDoc.judul}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{previewDoc.googleFileId || previewDoc.fileName || 'Belum tersambung'} · {previewDoc.tanggal}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Ringkasan</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{previewDoc.ringkasan || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Penyimpanan</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{previewDoc.googleDocUrl ? 'Isi dokumen berada di Google Docs dan bisa diedit lewat tombol di bawah.' : 'Metadata sudah tercatat, tetapi link Google Docs belum ditambahkan.'}</p>
            </div>
            <Button variant="primary" onClick={() => openDoc(previewDoc)} disabled={!previewDoc.googleDocUrl} className="w-full"><ExternalLink className="w-4 h-4" /> Buka/Edit di Google Docs</Button>
          </div>
        )}
      </Modal>

      <Modal open={showFolderForm} onClose={() => setShowFolderForm(false)} title="Buat Folder Dokumen" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nama Folder</label>
            <input value={folderForm.name} onChange={e => setFolderForm({ ...folderForm, name: e.target.value })} placeholder="Contoh: Interview Notes" className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
            {folderExists && <p className="text-xs text-red-500 mt-1.5">Folder dengan nama ini sudah ada.</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Akses Default</label>
            <select value={folderForm.visibility} onChange={e => setFolderForm({ ...folderForm, visibility: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200">
              <option value="public">Public/Internal</option>
              <option value="important">Penting + PIN</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Deskripsi</label>
            <textarea value={folderForm.description} onChange={e => setFolderForm({ ...folderForm, description: e.target.value })} rows={3} placeholder="Untuk jenis dokumen apa folder ini dipakai?" className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 resize-none" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowFolderForm(false)} className="flex-1">Batal</Button>
            <Button variant="primary" onClick={saveFolder} disabled={!folderForm.name.trim() || folderExists} className="flex-1"><FolderPlus className="w-4 h-4" /> Simpan Folder</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Upload Dokumen Riset" size="lg">
        <div className="space-y-4">
          <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 p-3">
            <p className="text-xs font-semibold text-green-700 dark:text-green-300">Alur Google Docs</p>
            <p className="text-xs text-green-700/80 dark:text-green-300/80 mt-1">Pilih file untuk dicatat di portal. Upload otomatis ke Google Drive akan aktif setelah credential Drive API dipasang.</p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4">
            <input ref={fileInputRef} type="file" onChange={pickFile} className="hidden" />
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedFile?.name || 'Belum ada file dipilih'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB · ${selectedFile.type}` : 'Pilih .docx, .pdf, .xlsx, gambar, atau lampiran riset.'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium">
                <Upload className="w-4 h-4" /> Pilih File
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Judul Dokumen</label>
              <input value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
            </div>
            <button type="button" onClick={createGoogleDoc} className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-medium">
              <ExternalLink className="w-4 h-4" /> Buat Google Doc
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Folder</label>
              <select value={form.folder} onChange={e => setForm({ ...form, folder: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200">
                {folders.map(folder => <option key={folder} value={folder}>{folder}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Akses Portal</label>
              <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value, folder: e.target.value === 'important' ? 'Dokumen Penting' : form.folder })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200">
                <option value="public">Public/Internal</option>
                <option value="important">Penting + PIN</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Link Google Docs</label>
            <input value={form.googleDocUrl} onChange={e => setForm({ ...form, googleDocUrl: e.target.value })} placeholder="https://docs.google.com/document/d/.../edit" className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nama File Asal / Catatan Upload</label>
            <input value={form.fileName} onChange={e => setForm({ ...form, fileName: e.target.value })} placeholder="brief-riset.docx atau dibuat langsung di Google Docs" className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Ringkasan</label>
            <textarea value={form.ringkasan} onChange={e => setForm({ ...form, ringkasan: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 resize-none" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Batal</Button>
            <Button variant="primary" onClick={saveDocument} disabled={!form.judul.trim() && !selectedFile} className="flex-1"><Upload className="w-4 h-4" /> Simpan Upload</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
