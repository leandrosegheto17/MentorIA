'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PollingRefresherProps {
  /** Ativa o polling enquanto true */
  active: boolean
  /** Intervalo em ms (padrão: 5000) */
  intervalMs?: number
}

export function PollingRefresher({ active, intervalMs = 5000 }: PollingRefresherProps) {
  const router = useRouter()

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => router.refresh(), intervalMs)
    return () => clearInterval(interval)
  }, [active, intervalMs, router])

  return null
}
