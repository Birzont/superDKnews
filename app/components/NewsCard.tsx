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
}

export default function NewsCard({
  id,
  title,
  description,
  category,
  ideology,
  createdAt,
  ideologyStats,
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
      <div className="bg-white rounded-12 border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
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