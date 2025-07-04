"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface NewsCardProps {
  id: string
  title: string
  description: string
  imageUrl?: string
  category: string
  ideology: number
  createdAt: string
  ideologyStats?: {
    progressive: number;
    moderate: number;
    conservative: number;
    total: number;
    progressivePercent: number;
    moderatePercent: number;
    conservativePercent: number;
  }
}

export default function NewsCard({
  id,
  title,
  description,
  imageUrl,
  category,
  ideology,
  createdAt,
  ideologyStats,
}: NewsCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const getIdeologyColor = (ideology: number) => {
    if (ideology <= 3) return 'bg-blue-100 text-blue-800'
    if (ideology <= 5) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getIdeologyText = (ideology: number) => {
    if (ideology <= 3) return '진보'
    if (ideology <= 5) return '중도'
    return '보수'
  }

  // 기본 이미지 URL (이미지 로딩 실패 시 사용)
  const defaultImageUrl = 'https://images.unsplash.com/photo-1495020683877-95802df4ae64?w=400&h=300&fit=crop'

  // 이미지 URL이 유효한지 확인
  const isValidImageUrl = (url?: string) => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const displayImageUrl = (imageUrl && isValidImageUrl(imageUrl) && !imageError) ? imageUrl : defaultImageUrl

  return (
    <Link href={`/post/${id}`}>
      <div className="bg-white rounded-12 border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 w-full bg-gray-100">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          <Image
            src={displayImageUrl}
            alt={title}
            fill
            className={`object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true)
              setImageLoading(false)
            }}
          />
        </div>
        
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {category}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getIdeologyColor(ideology)}`}>
              {getIdeologyText(ideology)}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {description}
          </p>
          
          <div className="text-xs text-gray-500 mb-2">
            {new Date(createdAt).toLocaleDateString('ko-KR')}
          </div>
        </div>
        {/* 성향 분포 바 및 비율 표시 */}
        {ideologyStats && ideologyStats.total > 0 && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-blue-700">진보 {ideologyStats.progressivePercent}%</span>
              <span className="text-gray-700">중도 {ideologyStats.moderatePercent}%</span>
              <span className="text-red-700">보수 {ideologyStats.conservativePercent}%</span>
            </div>
            <div className="flex h-3 w-full rounded overflow-hidden">
              <div style={{width: `${ideologyStats.progressivePercent}%`}} className="bg-blue-500" />
              <div style={{width: `${ideologyStats.moderatePercent}%`}} className="bg-gray-400" />
              <div style={{width: `${ideologyStats.conservativePercent}%`}} className="bg-red-500" />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
} 