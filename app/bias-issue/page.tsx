"use client"

import SideNav from '../components/SideNav'
import RealTimeNewsGrid from '../components/RealTimeNewsGrid'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function BiasIssuePage() {
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBiasIssues()
  }, [])

  const fetchBiasIssues = async () => {
    setLoading(true)
    // article_count 대비 보수 또는 진보 비율이 70% 이상인 이슈만
    const { data, error } = await supabase
      .from('issue_table')
      .select('*')
      .order('created_at', { ascending: false })
    // 필터링: conservative_count/article_count >= 0.7 또는 progressive_count/article_count >= 0.7
    const filtered = (data || []).filter(issue => {
      const total = issue.article_count || 0
      if (!total) return false
      const cons = issue.conservative_count || 0
      const prog = issue.progressive_count || 0
      // 카테고리 필터: 정치, 사회, 경제, 국제만
      const allowedCategories = ['정치', '사회', '경제', '국제']
      if (!allowedCategories.includes(issue.category)) return false
      return cons / total >= 0.7 || prog / total >= 0.7
    })
    setIssues(filtered)
    setLoading(false)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNav />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bias Issue</h1>
            <p className="text-gray-600">진보 또는 보수 기사 비율이 70% 이상인 이슈만 모아봅니다.</p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">뉴스를 불러오는 중...</span>
            </div>
          ) : (
            <RealTimeNewsGrid selectedCategory={""} issuesOverride={issues} />
          )}
        </div>
      </main>
    </div>
  )
} 