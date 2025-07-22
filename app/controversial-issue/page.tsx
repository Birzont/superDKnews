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
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('is_controversial_issue', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setIssues(data || [])
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
        <div className="w-[1600px] mx-auto pt-10 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-left font-pretendard">국내 쟁점 사안</h1>
          <p className="text-base text-gray-500 text-left font-pretendard">국내에서 논란이 되는 주요 사안들을 확인하세요.</p>
        </div>
        {/* 중앙 카드 */}
        <div className="w-[1600px] mx-auto mt-12 mb-8 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
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