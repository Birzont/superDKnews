"use client"

import SideNav from '../components/SideNav'
import RealTimeNewsGrid from '../components/RealTimeNewsGrid'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ControversialIssuePage() {
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  useEffect(() => {
    fetchControversialIssues()
  }, [])

  const fetchControversialIssues = async () => {
    try {
      // conservative_count와 progressive_count가 각각 전체의 45~55% 사이인 이슈만
      const { data, error } = await supabase
        .from('issue_table')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // 필터링: 보수/진보 비율이 45~55% 사이 또는 예시 이슈 3개는 무조건 포함
      const exampleIssues = [
        '이재명 정부 초대 장관 후보 청문회 시작',
        '윤석열 전 대통령 재구속에 대한 여야 반응',
        '이재명 대통령, 민생회복 위해 소비쿠폰 지급 효과 극대화 주문',
        '이재명 정부 1기 장관 후보자 청문회 진행',
        '조은석 특검팀, 윤 전 대통령 2차 강제구인 시도',
        '장관 후보자 논란과 여권 고심'
      ];
      
      const filtered = (data || []).filter(issue => {
        const total = issue.article_count || 0
        if (!total) return false
        const cons = issue.conservative_count || 0
        const prog = issue.progressive_count || 0
        const consRatio = cons / total
        const progRatio = prog / total
        // 둘 다 0.45~0.55 사이(5:5에 가까움) 또는 예시 이슈 3개 중 하나
        return (
          (consRatio >= 0.45 && consRatio <= 0.55 && progRatio >= 0.45 && progRatio <= 0.55)
          || exampleIssues.includes(issue.related_major_issue)
        )
      })
      
      setIssues(filtered)
    } catch (error) {
      console.error('Error fetching controversial issues:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-gray-100 to-white relative">
        {/* 상단 헤더 */}
        <div className="w-full max-w-7xl mx-auto pt-4 md:pt-10 px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-left font-pretendard">국내 쟁점 사안</h1>
          <p className="text-sm md:text-base text-gray-500 text-left font-pretendard">국내에서 논란이 되는 주요 사안들을 확인하세요.</p>
        </div>
        {/* 중앙 카드 */}
        <div className="w-full max-w-7xl mx-auto mt-6 md:mt-12 mb-8 px-4 md:px-6">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-8">
            {/* 뉴스 그리드 */}
            <RealTimeNewsGrid 
              selectedCategory=""
              issuesOverride={issues}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </main>
    </div>
  )
} 