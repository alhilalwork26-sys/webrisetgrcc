export const priorityConfig = {
  urgent: { label: 'Urgent', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
  high: { label: 'Tinggi', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', dot: 'bg-orange-500' },
  normal: { label: 'Normal', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-blue-500' },
  low: { label: 'Rendah', class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', dot: 'bg-gray-400' },
}

export const statusConfig = {
  todo: { label: 'Belum Mulai', class: 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400', dot: 'bg-gray-400' },
  inprogress: { label: 'Sedang Berjalan', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-blue-500' },
  review: { label: 'Direview', class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', dot: 'bg-purple-500' },
  done: { label: 'Selesai', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
}
