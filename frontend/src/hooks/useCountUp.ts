import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const SCALE = 10_000n

export function useCountUp(value: bigint, duration = 900): bigint {
  const reducedMotion = useReducedMotion()
  const [display, setDisplay] = useState<bigint>(reducedMotion ? value : 0n)

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
      const scaled = BigInt(Math.round(eased * 10_000))
      setDisplay((value * scaled) / SCALE)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, reducedMotion])

  return display
}
