export const roleLabels = {
  koordinator_riset: 'Koordinator Riset GRCC',
  riset: 'Tim Riset GRCC',
}

export const researchPages = [
  'dashboard',
  'riset',
  'tasks',
  'progress',
  'schedule',
  'documents',
  'reimburse',
  'projects',
  'goals',
  'members',
  'reports',
  'inbox',
  'settings',
]

export const rolePages = {
  koordinator_riset: researchPages,
  riset: researchPages,
}

export const rolePermissions = {
  koordinator_riset: {
    accounts: { manage: true },
    finance: { view: false, add: false, edit: false, pay: false, export: false },
    reimburse: { viewAll: true, approve: true, pay: true, create: true },
    documents: { upload: true, viewImportant: true, useAi: false },
    rab: { view: false, edit: false, export: false },
    audit: { view: true, export: true },
    tasks: { viewAll: true, add: true, edit: true, delete: true },
    progress: { viewAll: true, add: true },
    programs: { manage: false },
    research: { manage: true, viewAll: true, approve: true, publish: true },
  },
  riset: {
    accounts: { manage: false },
    finance: { view: false, add: false, edit: false, pay: false, export: false },
    reimburse: { viewAll: true, approve: false, pay: false, create: true },
    documents: { upload: true, viewImportant: false, useAi: false },
    rab: { view: false, edit: false, export: false },
    audit: { view: false, export: false },
    tasks: { viewAll: true, add: true, edit: true, delete: false },
    progress: { viewAll: true, add: true },
    programs: { manage: false },
    research: { manage: true, viewAll: true, approve: false, publish: false },
  },
}

export function canAccess(role, page) {
  return (rolePages[role] || rolePages.riset).includes(page)
}

export function can(role, feature, action) {
  return rolePermissions[role]?.[feature]?.[action] ?? false
}
