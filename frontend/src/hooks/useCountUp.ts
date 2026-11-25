import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

export function useCountUp(value: number, duration = 900): number {
  const reducedMotion = useReducedMotion()
  const [display, setDisplay] = useState(reducedMotion ? value : 0)

  useEffect(() => {
    if (reducedMotion || duration <= 0) {
      setDisplay(value)
      return
    }

    let frame = 0
    const startedAt = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, reducedMotion])

  return display
}
