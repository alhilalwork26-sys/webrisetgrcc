export default function Avatar({ user, size = 'md', showStatus = false }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-7 h-7 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base', xl: 'w-12 h-12 text-lg' }
  const dotSizes = { xs: 'w-1.5 h-1.5', sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3', xl: 'w-3.5 h-3.5' }
  return (
    <div className="relative inline-flex shrink-0">
      <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white select-none`} style={{ backgroundColor: user?.color || '#6366f1' }}>
        {user?.initials || user?.name?.slice(0, 2).toUpperCase() || '??'}
      </div>
      {showStatus && (
        <span className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full border-2 border-white dark:border-gray-900 ${user?.online ? 'bg-green-400' : 'bg-gray-300'}`} />
      )}
    </div>
  )
}
