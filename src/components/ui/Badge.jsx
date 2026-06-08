/* eslint-disable react-refresh/only-export-components */
import { priorityConfig, statusConfig } from './badgeConfig'

export { priorityConfig, statusConfig } from './badgeConfig'

export function PriorityBadge({ priority }) {
  const cfg = priorityConfig[priority] || priorityConfig.normal
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.class}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.todo
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.class}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export function Tag({ label }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
      {label}
    </span>
  )
}
