'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAManualInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isPWA, setIsPWA] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // PWA 모드인지 확인
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = (window.navigator as any).standalone === true
      setIsPWA(isStandalone || isInApp)
    }

    // 플랫폼 확인
    const checkPlatform = () => {
      const userAgent = navigator.userAgent
      setIsAndroid(/Android/.test(userAgent))
      setIsIOS(/iPad|iPhone|iPod/.test(userAgent))
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowButton(true)
    }

    checkPWA()
    checkPlatform()

    // PWA가 아닌 경우에만 설치 버튼 표시
    if (!isPWA) {
      window.addEventListener('beforeinstallprompt', handler)
      
      // 3초 후에 수동 설치 버튼 표시
      const timer = setTimeout(() => {
        if (!isPWA) {
          setShowButton(true)
        }
      }, 3000)

      return () => {
        window.removeEventListener('beforeinstallprompt', handler)
        clearTimeout(timer)
      }
    }
  }, [isPWA])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('사용자가 PWA 설치를 수락했습니다')
        setShowButton(false)
      } else {
        console.log('사용자가 PWA 설치를 거부했습니다')
      }

      setDeferredPrompt(null)
    } else {
      // 플랫폼별 수동 설치 가이드 표시
      if (isIOS) {
        alert(`iOS에서 설치하는 방법:

1. Safari 브라우저 하단의 공유 버튼(□↑)을 탭하세요
2. "홈 화면에 추가"를 선택하세요
3. "추가"를 탭하세요

이제 홈 화면에서 앱처럼 사용할 수 있습니다!`)
      } else if (isAndroid) {
        alert(`Android Chrome에서 설치하는 방법:

1. 브라우저 주소창 옆의 메뉴 버튼(⋮)을 탭하세요
2. "앱 설치" 또는 "홈 화면에 추가"를 선택하세요
3. "설치"를 탭하세요

또는 주소창에 "설치" 아이콘이 나타나면 그것을 탭하세요!`)
      } else {
        alert('브라우저 메뉴에서 "홈 화면에 추가" 또는 "앱 설치"를 선택해주세요.')
      }
    }
  }

  // PWA 모드이거나 버튼이 표시되지 않으면 렌더링하지 않음
  if (isPWA || !showButton) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleInstallClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium">
          {isIOS ? '홈 화면에 추가' : '앱 설치'}
        </span>
      </button>
    </div>
  )
} 