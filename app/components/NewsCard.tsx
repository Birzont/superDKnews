"use client"

import Link from 'next/link'

interface NewsCardProps {
  id: string
  title: string
  description: string
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
  imageUrl?: string // 이미지 url prop 추가
}

export default function NewsCard({
  id,
  title,
  description,
  category,
  ideology,
  createdAt,
  ideologyStats,
  imageUrl,
}: NewsCardProps) {

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

  return (
    <Link href={`/post/${id}`}>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        {/* 이미지 영역 */}
        {imageUrl && (
          <div className="w-full h-32 sm:h-40 md:h-48 lg:h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
            <img src={imageUrl} alt="대표 이미지" className="object-cover w-full h-full" />
          </div>
        )}
        <div className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {category}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getIdeologyColor(ideology)}`}>
              {getIdeologyText(ideology)}
            </span>
          </div>
          
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 flex-1">
            {title}
          </h3>
          
          <p className="text-gray-600 text-xs sm:text-sm line-clamp-3 mb-3 flex-1">
            {description}
          </p>
          
          <div className="text-xs text-gray-500 mb-3">
            {new Date(createdAt).toLocaleDateString('ko-KR')}
          </div>
        </div>
        
        {/* 성향 분포 바 및 비율 표시 */}
        {ideologyStats && ideologyStats.total > 0 && (
          <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-blue-700">진보 {ideologyStats.progressivePercent}%</span>
              <span className="text-gray-700">중도 {ideologyStats.moderatePercent}%</span>
              <span className="text-red-700">보수 {ideologyStats.conservativePercent}%</span>
            </div>
            <div className="flex h-2 w-full rounded overflow-hidden">
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