"use client"

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  fallbackPath?: string
  className?: string
}

export default function BackButton({ fallbackPath = '/', className = '' }: BackButtonProps) {
  const router = useRouter()

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackPath)
    }
  }

  return (
    <div className={`mb-4 ${className}`}>
      <button
        onClick={handleGoBack}
        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">뒤로가기</span>
      </button>
    </div>
  )
} 