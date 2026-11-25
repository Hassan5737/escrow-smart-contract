import type { Address } from 'viem'
import { truncateAddress } from '../lib/format'

interface RecentListProps {
  items: readonly Address[]
  active: Address | undefined
  onSelect: (address: Address) => void
  onClear: () => void
}

export function RecentList({ items, active, onSelect, onClear }: RecentListProps) {
  if (items.length === 0) return null

  return (
    <div className="recent">
      <div className="recent-head">
        <span className="recent-label">Recent</span>
        <button type="button" className="recent-clear" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="recent-list">
        {items.map((item) => {
          const isActive = item.toLowerCase() === active?.toLowerCase()
          return (
            <button
              type="button"
              key={item}
              className={`recent-chip mono${isActive ? ' is-active' : ''}`}
              onClick={() => onSelect(item)}
              aria-current={isActive ? 'true' : undefined}
            >
              {truncateAddress(item, 6, 4)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
