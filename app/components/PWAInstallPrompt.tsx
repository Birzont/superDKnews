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

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isPWA, setIsPWA] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isSafari, setIsSafari] = useState(false)

  useEffect(() => {
    // PWA 모드인지 확인
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = (window.navigator as any).standalone === true
      setIsPWA(isStandalone || isInApp)
    }

    // iOS 및 Safari 확인
    const checkPlatform = () => {
      const userAgent = navigator.userAgent
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent)
      const isSafariBrowser = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
      
      setIsIOS(isIOSDevice)
      setIsSafari(isSafariBrowser)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    checkPWA()
    checkPlatform()

    // PWA가 아닌 경우에만 설치 프롬프트 표시
    if (!isPWA) {
      window.addEventListener('beforeinstallprompt', handler)
      
      // 5초 후에 수동으로 프롬프트 표시 (테스트용)
      const timer = setTimeout(() => {
        if (!showInstallPrompt && !isPWA) {
          setShowInstallPrompt(true)
        }
      }, 5000)

      return () => {
        window.removeEventListener('beforeinstallprompt', handler)
        clearTimeout(timer)
      }
    }
  }, [isPWA, showInstallPrompt])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('사용자가 PWA 설치를 수락했습니다')
      } else {
        console.log('사용자가 PWA 설치를 거부했습니다')
      }

      setDeferredPrompt(null)
    }
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
  }

  const showIOSInstructions = () => {
    alert(`iOS Safari에서 설치하는 방법:

1. 브라우저 하단의 공유 버튼(□↑)을 탭하세요
2. "홈 화면에 추가"를 선택하세요
3. "추가"를 탭하세요

이제 홈 화면에서 앱처럼 사용할 수 있습니다!`)
  }

  // PWA 모드이거나 프롬프트가 표시되지 않으면 렌더링하지 않음
  if (isPWA || !showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-6 z-50 max-w-md mx-auto">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">앱 설치</h3>
          <p className="text-sm text-gray-600 mb-4">
            DKnewsSUPER를 홈 화면에 추가하여 더 빠르게 접근하고 오프라인에서도 사용하세요
          </p>
          
          {/* iOS Safari 특별 안내 */}
          {isIOS && isSafari && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 mb-2">
                <strong>iOS Safari 사용자:</strong> 브라우저 하단의 공유 버튼을 사용하세요
              </p>
              <button
                onClick={showIOSInstructions}
                className="text-xs text-blue-600 underline"
              >
                자세한 설치 방법 보기
              </button>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              나중에
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              설치하기
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
} 