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
  const [isAndroid, setIsAndroid] = useState(false)
  const [isChrome, setIsChrome] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // PWA 모드인지 확인
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = (window.navigator as any).standalone === true
      setIsPWA(isStandalone || isInApp)
    }

    // 플랫폼 및 브라우저 확인
    const checkPlatform = () => {
      const userAgent = navigator.userAgent
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent)
      const isSafariBrowser = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
      const isAndroidDevice = /Android/.test(userAgent)
      const isChromeBrowser = /Chrome/.test(userAgent) && !/Edge/.test(userAgent)
      
      setIsIOS(isIOSDevice)
      setIsSafari(isSafariBrowser)
      setIsAndroid(isAndroidDevice)
      setIsChrome(isChromeBrowser)
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
      
      // 3초 후에 수동으로 프롬프트 표시 (더 빠르게)
      const timer = setTimeout(() => {
        if (!showInstallPrompt && !isPWA) {
          setShowInstallPrompt(true)
        }
      }, 3000)

      return () => {
        window.removeEventListener('beforeinstallprompt', handler)
        clearTimeout(timer)
      }
    }
  }, [isPWA, showInstallPrompt])

  const handleInstallClick = async () => {
    setIsInstalling(true)
    
    try {
      if (deferredPrompt) {
        // Chrome/Android의 경우 브라우저 설치 프롬프트 사용
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
          console.log('사용자가 PWA 설치를 수락했습니다')
          setShowInstallPrompt(false)
        } else {
          console.log('사용자가 PWA 설치를 거부했습니다')
          // 거부해도 수동 설치 가이드 제공
          showManualInstallGuide()
        }

        setDeferredPrompt(null)
      } else {
        // 수동 설치 가이드 표시
        showManualInstallGuide()
      }
    } catch (error) {
      console.error('설치 중 오류:', error)
      showManualInstallGuide()
    } finally {
      setIsInstalling(false)
    }
  }

  const showManualInstallGuide = () => {
    if (isIOS && isSafari) {
      alert(`📱 iOS Safari에서 설치하는 방법:

1️⃣ Safari 하단의 공유 버튼(□↑)을 탭하세요
2️⃣ "홈 화면에 추가"를 선택하세요  
3️⃣ "추가"를 탭하세요

✅ 완료! 이제 홈 화면에서 앱처럼 사용할 수 있습니다!`)
    } else if (isAndroid && isChrome) {
      alert(`📱 Android Chrome에서 설치하는 방법:

1️⃣ 브라우저 주소창 옆의 메뉴 버튼(⋮)을 탭하세요
2️⃣ "앱 설치" 또는 "홈 화면에 추가"를 선택하세요
3️⃣ "설치"를 탭하세요

💡 또는 주소창에 "설치" 아이콘이 나타나면 그것을 탭하세요!`)
    } else if (isIOS) {
      alert(`📱 iOS에서 설치하는 방법:

1️⃣ 브라우저 하단의 공유 버튼(□↑)을 탭하세요
2️⃣ "홈 화면에 추가"를 선택하세요
3️⃣ "추가"를 탭하세요

✅ 완료! 이제 홈 화면에서 앱처럼 사용할 수 있습니다!`)
    } else if (isAndroid) {
      alert(`📱 Android에서 설치하는 방법:

1️⃣ 브라우저 메뉴 버튼(⋮)을 탭하세요
2️⃣ "앱 설치" 또는 "홈 화면에 추가"를 선택하세요
3️⃣ "설치"를 탭하세요

💡 또는 주소창에 "설치" 아이콘이 나타나면 그것을 탭하세요!`)
    } else {
      alert(`💻 데스크톱에서 설치하는 방법:

1️⃣ 브라우저 주소창 옆의 설치 아이콘(📱)을 클릭하세요
2️⃣ "설치"를 클릭하세요

💡 또는 브라우저 메뉴에서 "앱 설치"를 찾아보세요!`)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
  }

  // PWA 모드이거나 프롬프트가 표시되지 않으면 렌더링하지 않음
  if (isPWA || !showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border-2 border-blue-500 rounded-xl shadow-2xl p-6 z-50 max-w-md mx-auto">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-2">🚀 앱 설치</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            DKnewsSUPER를 홈 화면에 추가하여 더 빠르게 접근하고 오프라인에서도 사용하세요!
          </p>
          
          {/* 플랫폼별 특별 안내 */}
          {isIOS && isSafari && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 mb-2">
                <strong>📱 iOS Safari 사용자:</strong> 브라우저 하단의 공유 버튼을 사용하세요
              </p>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              나중에
            </button>
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInstalling ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  설치 중...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  📱 {isIOS ? '홈 화면에 추가' : '앱 설치'}
                </span>
              )}
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
} 