import { useEffect, useRef, useState } from 'react'

// Conta de 0 até target com easeOutCubic via requestAnimationFrame.
export function useCountUp(target, { duration = 1100, delay = 0 } = {}) {
  const [value, setValue] = useState(0)
  const ref = useRef({ raf: 0, to: 0 })

  useEffect(() => {
    let start = null
    let timeout = 0
    const from = 0
    const ease = (t) => 1 - Math.pow(1 - t, 3)

    const step = (ts) => {
      if (start === null) start = ts
      const p = Math.min(1, (ts - start) / duration)
      setValue(from + (target - from) * ease(p))
      if (p < 1) ref.current.raf = requestAnimationFrame(step)
      else setValue(target)
    }

    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }

    timeout = setTimeout(() => {
      ref.current.raf = requestAnimationFrame(step)
    }, delay)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(ref.current.raf)
    }
  }, [target, duration, delay])

  return value
}

// Incrementa um valor base a cada intervalo (sensação "ao vivo").
export function useTicker(base, perTick, intervalMs = 2600) {
  const [v, setV] = useState(base)
  useEffect(() => {
    setV(base)
    const id = setInterval(() => {
      setV((cur) => cur + perTick * (0.6 + Math.random() * 0.8))
    }, intervalMs)
    return () => clearInterval(id)
  }, [base, perTick, intervalMs])
  return v
}

// Relógio ao vivo (HH:MM:SS) para a barra de status.
export function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}
