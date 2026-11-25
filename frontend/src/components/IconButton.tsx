import type { ReactNode } from 'react'

interface IconButtonProps {
  label: string
  title?: string
  onClick: () => void
  children: ReactNode
  success?: boolean
}

export function IconButton({ label, title, onClick, children, success = false }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`icon-button${success ? ' icon-button--success' : ''}`}
      aria-label={label}
      title={title ?? label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
