interface IconProps {
  size?: number
}

export function CopyIcon({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5.5" y="5.5" width="8" height="8" rx="1" />
      <path d="M10.5 3.5H4.5a1 1 0 0 0-1 1v6" />
    </svg>
  )
}

export function CheckIcon({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 8.4 3.1 3.1L13 4.6" />
    </svg>
  )
}

export function ExpandIcon({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9.8 6.2M2.5 13.5l3.7-3.7" />
    </svg>
  )
}

export function CollapseIcon({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13.5 6.5h-4v-4M2.5 9.5h4v4M9.5 6.5 13.2 2.8M6.5 9.5 2.8 13.2" />
    </svg>
  )
}

export function ExternalIcon({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6.5 3.5h6v6M12.5 3.5 7 9" />
      <path d="M11 10.5v2h-8v-8h2" />
    </svg>
  )
}
