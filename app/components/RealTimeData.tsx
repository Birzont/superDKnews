'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface RealTimeDataProps {
  refreshInterval?: number // 새로고침 간격 (밀리초)
}

export default function RealTimeData({ refreshInterval = 30000 }: RealTimeDataProps) {
  const router = useRouter()

  useEffect(() => {
    // 주기적으로 페이지를 새로고침하여 최신 데이터를 가져옴
    const interval = setInterval(() => {
      router.refresh()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [router, refreshInterval])

  return null // 이 컴포넌트는 UI를 렌더링하지 않음
} 