import { motion } from 'framer-motion'

export default function ProgressBar({ value, color = '#7B2FBE', height = 6, showLabel = false, animated = true }) {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{value}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden`} style={{ height }}>
        <motion.div
          initial={animated ? { width: 0 } : { width: `${value}%` }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  )
}
