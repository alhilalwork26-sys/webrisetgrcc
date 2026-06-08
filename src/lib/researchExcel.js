import ExcelJS from 'exceljs'

export const RESEARCH_EXCEL_COLUMNS = [
  { key: 'code', header: 'Code', width: 16 },
  { key: 'title', header: 'Judul Riset', width: 34 },
  { key: 'type', header: 'Type', width: 22 },
  { key: 'pic', header: 'PIC', width: 22 },
  { key: 'status', header: 'Status', width: 18 },
  { key: 'deadline', header: 'Deadline', width: 16 },
  { key: 'evidence', header: 'Evidence', width: 42 },
  { key: 'background', header: 'Latar Belakang', width: 42 },
  { key: 'objective', header: 'Tujuan', width: 42 },
  { key: 'method', header: 'Metode', width: 26 },
  { key: 'dataSource', header: 'Sumber Data', width: 30 },
  { key: 'expectedOutput', header: 'Output', width: 34 },
  { key: 'reviewNotes', header: 'Catatan Review', width: 34 },
  { key: 'week1', header: 'Week 1', width: 12 },
  { key: 'week2', header: 'Week 2', width: 12 },
  { key: 'week3', header: 'Week 3', width: 12 },
  { key: 'week4', header: 'Week 4', width: 12 },
  { key: 'week5', header: 'Week 5', width: 12 },
  { key: 'week6', header: 'Week 6', width: 12 },
]

const headerAliases = {
  code: 'code',
  kode: 'code',
  'judul riset': 'title',
  judul: 'title',
  title: 'title',
  type: 'type',
  tipe: 'type',
  jenis: 'type',
  pic: 'pic',
  owner: 'pic',
  status: 'status',
  deadline: 'deadline',
  evidence: 'evidence',
  catatan: 'evidence',
  'latar belakang': 'background',
  background: 'background',
  tujuan: 'objective',
  objective: 'objective',
  metode: 'method',
  method: 'method',
  'sumber data': 'dataSource',
  datasource: 'dataSource',
  output: 'expectedOutput',
  'output yang diharapkan': 'expectedOutput',
  'catatan review': 'reviewNotes',
  reviewnotes: 'reviewNotes',
  'week 1': 'week1',
  week1: 'week1',
  minggu1: 'week1',
  'week 2': 'week2',
  week2: 'week2',
  minggu2: 'week2',
  'week 3': 'week3',
  week3: 'week3',
  minggu3: 'week3',
  'week 4': 'week4',
  week4: 'week4',
  minggu4: 'week4',
  'week 5': 'week5',
  week5: 'week5',
  minggu5: 'week5',
  'week 6': 'week6',
  week6: 'week6',
  minggu6: 'week6',
}

function normalizeHeader(value) {
  return String(value || '').trim().toLowerCase()
}

function readBool(value) {
  const normalized = valueToText(value).trim().toLowerCase()
  return ['1', 'true', 'ya', 'yes', 'done', 'selesai', 'v', 'x'].includes(normalized)
}

function valueToText(value) {
  if (value == null) return ''
  if (value instanceof Date) return value.toISOString().split('T')[0]
  if (typeof value === 'object') {
    if (Array.isArray(value.richText)) return value.richText.map(part => part.text).join('')
    if (value.text) return String(value.text)
    if (value.result != null) return valueToText(value.result)
    if (value.hyperlink && value.text) return String(value.text)
  }
  return String(value)
}

function makeWorkbook() {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'GRCC Riset'
  workbook.created = new Date()
  workbook.modified = new Date()
  return workbook
}

function styleWorksheet(worksheet) {
  worksheet.views = [{ state: 'frozen', ySplit: 1 }]
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF166534' } }
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
  worksheet.autoFilter = {
    from: 'A1',
    to: `${worksheet.getColumn(RESEARCH_EXCEL_COLUMNS.length).letter}1`,
  }
}

async function downloadWorkbook(workbook, filename) {
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function exportResearchWorkbook(researchNotes = [], filename = 'grcc-riset.xlsx') {
  const workbook = makeWorkbook()
  const worksheet = workbook.addWorksheet('Riset')
  worksheet.columns = RESEARCH_EXCEL_COLUMNS
  worksheet.addRows(researchNotes.map((item) => {
    const equity = item.equity || []
    return {
      code: item.code,
      title: item.title,
      type: item.type,
      pic: item.pic,
      status: item.status,
      deadline: item.deadline,
      evidence: item.evidence,
      background: item.background,
      objective: item.objective,
      method: item.method,
      dataSource: item.dataSource,
      expectedOutput: item.expectedOutput,
      reviewNotes: item.reviewNotes,
      week1: equity[0] ? 'Done' : '',
      week2: equity[1] ? 'Done' : '',
      week3: equity[2] ? 'Done' : '',
      week4: equity[3] ? 'Done' : '',
      week5: equity[4] ? 'Done' : '',
      week6: equity[5] ? 'Done' : '',
    }
  }))
  styleWorksheet(worksheet)
  await downloadWorkbook(workbook, filename)
}

export async function downloadResearchTemplate() {
  const workbook = makeWorkbook()
  const worksheet = workbook.addWorksheet('Riset')
  worksheet.columns = RESEARCH_EXCEL_COLUMNS
  worksheet.addRow({
    code: 'RS-001',
    title: 'Contoh Riset',
    type: 'Market Research',
    pic: 'Tsanya El Karima',
    status: 'Draft',
    deadline: '2026-06-30',
    evidence: 'Catatan awal riset',
    background: 'Masalah atau konteks riset.',
    objective: 'Tujuan riset.',
    method: 'Interview + desk research',
    dataSource: 'Interview, dataset, observasi',
    expectedOutput: 'Insight dan rekomendasi',
    reviewNotes: '',
    week1: 'Done',
  })
  styleWorksheet(worksheet)
  await downloadWorkbook(workbook, 'template-riset-grcc.xlsx')
}

export async function parseResearchWorkbook(file, members = []) {
  const buffer = await file.arrayBuffer()
  const workbook = makeWorkbook()
  await workbook.xlsx.load(buffer)
  const worksheet = workbook.worksheets[0]
  if (!worksheet) throw new Error('Workbook tidak memiliki sheet.')

  const headerMap = {}
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    const key = headerAliases[normalizeHeader(valueToText(cell.value))]
    if (key) headerMap[colNumber] = key
  })

  const rows = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const raw = {}
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headerMap[colNumber]
      if (key) raw[key] = cell.value
    })
    const normalized = normalizeResearchRow(raw, members, rowNumber - 1)
    if (normalized.code || normalized.title) rows.push(normalized)
  })

  return {
    fileName: file.name,
    sheetName: worksheet.name,
    rows,
    rawRowCount: Math.max(worksheet.rowCount - 1, 0),
  }
}

function normalizeResearchRow(row, members, index) {
  const owner = findOwner(row.pic, members)
  const equity = [1, 2, 3, 4, 5, 6].map(week => readBool(row[`week${week}`]))

  return {
    code: valueToText(row.code || `RS-${String(index).padStart(3, '0')}`).trim().toUpperCase(),
    title: valueToText(row.title).trim(),
    type: valueToText(row.type || 'Market Research').trim(),
    owner: owner?.id || members[0]?.id || 'u1',
    pic: owner?.name || valueToText(row.pic || members[0]?.name || 'Tim Riset').trim(),
    status: valueToText(row.status || 'Draft').trim(),
    deadline: valueToText(row.deadline).trim(),
    evidence: valueToText(row.evidence).trim(),
    background: valueToText(row.background || 'Belum diisi.').trim(),
    objective: valueToText(row.objective || 'Belum diisi.').trim(),
    method: valueToText(row.method || 'Belum diisi.').trim(),
    dataSource: valueToText(row.dataSource || 'Belum diisi.').trim(),
    expectedOutput: valueToText(row.expectedOutput || 'Belum diisi.').trim(),
    reviewNotes: valueToText(row.reviewNotes).trim(),
    equity,
    comments: [],
  }
}

function findOwner(pic, members) {
  const name = valueToText(pic).trim().toLowerCase()
  if (!name) return null
  return members.find(member =>
    member.name.toLowerCase() === name ||
    member.initials?.toLowerCase() === name ||
    member.email?.toLowerCase() === name
  ) || null
}
