'use client'

interface IdeologyStatsProps {
  articles: Array<{
    press_ideology?: number
  }>
}

export default function IdeologyStats({ articles }: IdeologyStatsProps) {
  // 성향별 기사 수 계산
  const stats = articles.reduce((acc, article) => {
    const ideology = article.press_ideology ?? 5 // 기본값은 중도
    
    if (ideology <= 3) {
      acc.progressive++
    } else if (ideology <= 5) {
      acc.moderate++
    } else {
      acc.conservative++
    }
    
    return acc
  }, { progressive: 0, moderate: 0, conservative: 0 })

  const total = articles.length

  // 전체 성향 계산 (가중 평균)
  const averageIdeology = articles.reduce((sum, article) => {
    return sum + (article.press_ideology ?? 5)
  }, 0) / (total || 1)

  // 전체 성향 계산 (개수 기준)
  const max = Math.max(stats.progressive, stats.moderate, stats.conservative);
  let overallText = '';
  let overallColor = '';
  if (max === stats.progressive) {
    overallText = '진보';
    overallColor = 'from-blue-800 to-blue-900';
  } else if (max === stats.moderate) {
    overallText = '중도';
    overallColor = 'from-gray-500 to-gray-700';
  } else {
    overallText = '보수';
    overallColor = 'from-red-500 to-red-700';
  }

  // 전체 성향에 따른 색상 결정
  const getOverallColor = (avg: number) => {
    if (avg <= 3) return 'from-blue-800 to-blue-900'
    if (avg <= 5) return 'from-gray-500 to-gray-700'
    return 'from-red-500 to-red-700'
  }

  const getOverallText = (avg: number) => {
    if (avg <= 3) return '진보'
    if (avg <= 5) return '중도'
    return '보수'
  }

  return (
    <div className="bg-white rounded-12 shadow-sm p-6 sticky top-8">
      <h3 className="text-lg font-bold text-gray-900 mb-6">성향 분석</h3>
      
      {/* 전체 성향 */}
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">전체 성향</div>
        <div className={`bg-gradient-to-r ${overallColor} text-white px-4 py-3 rounded-lg text-center`}>
          <div className="text-xl font-bold">{overallText}</div>
          <div className="text-sm opacity-90">평균: {averageIdeology.toFixed(1)}</div>
        </div>
      </div>

      {/* 성향별 분포 */}
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-3">성향별 기사 수</div>
        
        {/* 진보 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-700 to-blue-900 rounded-full"></div>
            <span className="text-sm text-gray-700">진보</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">{stats.progressive}</span>
            <span className="text-xs text-gray-500">({total > 0 ? ((stats.progressive / total) * 100).toFixed(1) : 0}%)</span>
          </div>
        </div>

        {/* 중도 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
            <span className="text-sm text-gray-700">중도</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">{stats.moderate}</span>
            <span className="text-xs text-gray-500">({total > 0 ? ((stats.moderate / total) * 100).toFixed(1) : 0}%)</span>
          </div>
        </div>

        {/* 보수 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
            <span className="text-sm text-gray-700">보수</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">{stats.conservative}</span>
            <span className="text-xs text-gray-500">({total > 0 ? ((stats.conservative / total) * 100).toFixed(1) : 0}%)</span>
          </div>
        </div>
      </div>

      {/* 성향 분포 차트 */}
      <div className="mt-6">
        <div className="text-sm text-gray-600 mb-2">성향 분포</div>
        <div className="flex h-3 bg-gray-200 rounded-full overflow-hidden">
          {stats.progressive > 0 && (
            <div 
              className="bg-gradient-to-r from-blue-700 to-blue-900"
              style={{ width: `${(stats.progressive / total) * 100}%` }}
            ></div>
          )}
          {stats.moderate > 0 && (
            <div 
              className="bg-gradient-to-r from-gray-400 to-gray-600"
              style={{ width: `${(stats.moderate / total) * 100}%` }}
            ></div>
          )}
          {stats.conservative > 0 && (
            <div 
              className="bg-gradient-to-r from-red-400 to-red-600"
              style={{ width: `${(stats.conservative / total) * 100}%` }}
            ></div>
          )}
        </div>
      </div>

      {/* 총 기사 수 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{total}</div>
          <div className="text-sm text-gray-600">총 기사 수</div>
        </div>
      </div>
    </div>
  )
} 