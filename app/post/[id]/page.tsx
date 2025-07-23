"use client"

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import RealTimeData from '../../components/RealTimeData'
import IssueSpecificChatbot from '../../components/IssueSpecificChatbot'
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'

// 동적 import 적용
const IdeologyStats = dynamic(() => import('../../components/IdeologyStats'), { ssr: false })
const SummaryTabs = dynamic(() => import('../../components/SummaryTabs'), { ssr: false })
const ArticleTabs = dynamic(() => import('../../components/ArticleTabs'), { ssr: false })

// Article 타입 정의
interface Article {
  id: string;
  date: string;
  press: string;
  contributor: string;
  title: string;
  category: string;
  institution: string;
  keywords: string;
  feature_extraction: string;
  body: string;
  url: string;
  related_major_issue: string;
  created_at: string;
  press_ideology: number;
  major_cat: number;
}

interface PostPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PostPage({ params }: PostPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [summaryIssue, setSummaryIssue] = useState<any>(null)
  const [newspaperArticles, setNewspaperArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isChatbotOpen, setIsChatbotOpen] = useState(true)

  // params를 안전하게 처리
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = await params
        setResolvedParams(resolved)
      } catch (err) {
        console.error('Error resolving params:', err)
        setError('페이지 매개변수를 처리할 수 없습니다.')
        setLoading(false)
      }
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchData()
    }
  }, [resolvedParams?.id])

  const fetchData = async () => {
    if (!resolvedParams?.id) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('Fetching issue with ID:', resolvedParams.id)
      
      // issue_table 테이블에서 특정 요약 이슈를 가져오기
      const { data: issueData, error: issueError } = await supabase
        .from('issue_table')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (issueError) {
        console.error('Error fetching summary issue:', issueError)
        setError('요약 이슈를 불러올 수 없습니다.')
        setLoading(false)
        return
      }

      if (!issueData) {
        setError('해당 이슈를 찾을 수 없습니다.')
        setLoading(false)
        return
      }

      console.log('Issue data:', issueData)
      setSummaryIssue(issueData)

      // news_ids를 파싱하여 개별 기사 ID 배열 생성
      let articleIds: string[] = []
      if (issueData.news_ids) {
        try {
          // JSON 배열 형태로 저장되어 있다고 가정
          if (typeof issueData.news_ids === 'string') {
            if (issueData.news_ids.startsWith('[')) {
              articleIds = JSON.parse(issueData.news_ids) as string[]
            } else {
              // 쉼표로 구분된 문자열 형태일 수도 있음
              articleIds = issueData.news_ids.split(',').map((id: any) => id.trim()).filter((id: any) => id.length > 0)
            }
          }
        } catch (parseError) {
          console.error('Error parsing news_ids:', parseError)
          // 파싱 실패 시 빈 배열로 처리
          articleIds = []
        }
      }

      console.log('Article IDs to fetch:', articleIds)

      // articles_table 테이블에서 특정 기사들을 가져오기
      if (articleIds.length > 0) {
        const { data: articlesData, error: articlesError } = await supabase
          .from('articles_table')
          .select('*')
          .in('id', articleIds)
          .order('created_at', { ascending: false }) // 최신 기사부터 정렬

        if (articlesError) {
          console.error('Error fetching articles:', articlesError)
          setError('기사들을 불러올 수 없습니다.')
        } else {
          console.log('Articles data:', articlesData)
          setNewspaperArticles(articlesData || [])
        }
      } else {
        console.log('No article IDs found, setting empty array')
        setNewspaperArticles([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">뉴스를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (!summaryIssue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">뉴스를 찾을 수 없습니다</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 성향별로 기사 분류
  const progressiveArticles = newspaperArticles.filter(a => a.press_ideology && a.press_ideology <= 3)
  const moderateArticles = newspaperArticles.filter(a => a.press_ideology && a.press_ideology > 3 && a.press_ideology <= 5)
  const conservativeArticles = newspaperArticles.filter(a => a.press_ideology && a.press_ideology > 5)

  // 대표 성향 계산 (개수 기준)
  const counts = [
    { type: '진보', count: progressiveArticles.length },
    { type: '중도', count: moderateArticles.length },
    { type: '보수', count: conservativeArticles.length },
  ];
  counts.sort((a, b) => b.count - a.count);
  const mainIdeology = counts[0].type;
  const mainIdeologyColor = mainIdeology === '진보' ? 'bg-blue-100 text-blue-800' : mainIdeology === '중도' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';

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

  // 날짜 포맷
  const dateStr = summaryIssue.date ? new Date(summaryIssue.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 실시간 데이터 새로고침 컴포넌트 */}
      <RealTimeData refreshInterval={15000} /> {/* 15초마다 새로고침 */}
      
      <div className="max-w-7xl mx-auto p-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          홈으로 돌아가기
        </Link>

        {/* 3열 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 왼쪽 컬럼: 기사 내용 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 요약 기사 섹션 */}
            <article className="bg-white rounded-12 shadow-sm overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                    뉴스 요약
                  </span>
                  <span className="text-sm font-medium text-gray-600 bg-blue-100 px-3 py-2 rounded-full">
                    {summaryIssue.article_count || 0}개 기사 포함
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  {summaryIssue.related_major_issue || '제목 없음'}
                </h1>

                <div className="text-sm text-gray-500 mb-8">
                  {new Date().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                {/* 성향별 요약 탭 */}
                <div className="mb-6">
                <SummaryTabs
                    left={summaryIssue.progressive_title + '\n' + summaryIssue.progressive_body}
                    center={summaryIssue.centrist_title + '\n' + summaryIssue.centrist_body}
                    right={summaryIssue.conservative_title + '\n' + summaryIssue.conservative_body}
                />
                </div>
              </div>
            </article>

            {/* 포함된 개별 기사들 섹션 */}
            {newspaperArticles.length > 0 && (
              <div className="bg-white rounded-12 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    포함된 기사들 ({newspaperArticles.length}개)
                  </h2>
                  <p className="text-gray-600">
                    이 요약에 포함된 개별 뉴스 기사들을 확인하세요.
                  </p>
                </div>
                <div className="p-8">
                  <ArticleTabs
                    progressive={progressiveArticles}
                    moderate={moderateArticles}
                    conservative={conservativeArticles}
                  />
                </div>
              </div>
            )}

            {/* 기사가 없는 경우 */}
            {newspaperArticles.length === 0 && summaryIssue.article_count && summaryIssue.article_count > 0 && (
              <div className="bg-white rounded-12 shadow-sm p-8 text-center">
                <p className="text-gray-600">
                  포함된 기사들을 불러올 수 없습니다.
                </p>
              </div>
            )}
          </div>

          {/* 중간 컬럼: 성향 통계 */}
          <div className="lg:col-span-1">
            <IdeologyStats articles={newspaperArticles} />
          </div>

          {/* 오른쪽 컬럼: 사안별 챗봇 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-12 shadow-sm overflow-hidden h-[600px]">
              <IssueSpecificChatbot 
                isOpen={isChatbotOpen} 
                onClose={() => setIsChatbotOpen(false)} 
                issueData={summaryIssue}
                articles={newspaperArticles}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 