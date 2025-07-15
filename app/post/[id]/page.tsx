import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import RealTimeData from '../../components/RealTimeData'
import dynamic from 'next/dynamic'
// 동적 import 적용
const IdeologyStats = dynamic(() => import('../../components/IdeologyStats'), { ssr: false })
const SummaryTabs = dynamic(() => import('../../components/SummaryTabs'), { ssr: false })
const ArticleTabs = dynamic(() => import('../../components/ArticleTabs'), { ssr: false })
import React from 'react'

// 실시간 데이터 업데이트를 위한 설정
export const revalidate = 0 // 매번 새로운 데이터를 가져옴

// issue_table 테이블에서 특정 요약 이슈를 가져오는 함수로 변경
async function getSummaryIssueById(id: string) {
  try {
    const { data, error } = await supabase
      .from('issue_table')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      console.error('Error fetching summary issue:', error)
      return null
    }
    return data
  } catch (error) {
    console.error('Error fetching summary issue:', error)
    return null
  }
}

// articles_table 테이블에서 특정 기사들을 가져오는 함수로 변경
async function getArticles(articleIds: string[]) {
  try {
    const { data, error } = await supabase
      .from('articles_table')
      .select('*')
      .in('id', articleIds)
      .order('created_at', { ascending: false }) // 최신 기사부터 정렬
    if (error) {
      console.error('Error fetching articles:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

// Article 타입 정의 및 사용처 수정
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
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const summaryIssue = await getSummaryIssueById(params.id)

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

  // news_ids를 파싱하여 개별 기사 ID 배열 생성
  let articleIds: string[] = []
  if (summaryIssue.news_ids) {
    try {
      // JSON 배열 형태로 저장되어 있다고 가정
      articleIds = JSON.parse(summaryIssue.news_ids) as string[]
    } catch {
      // 쉼표로 구분된 문자열 형태일 수도 있음
      articleIds = summaryIssue.news_ids.split(',').map((id: string) => id.trim())
    }
  }

  // 개별 기사들 가져오기
  const newspaperArticles = await getArticles(articleIds)

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

        {/* 2열 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

                {/* 대표 성향 블록 제거 */}

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
                {/* 성향별 요약 제목+본문 블록 완전히 삭제 */}
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

          {/* 오른쪽 컬럼: 성향 통계 */}
          <div className="lg:col-span-1">
            <IdeologyStats articles={newspaperArticles} />
          </div>
        </div>
      </div>
    </div>
  )
} 