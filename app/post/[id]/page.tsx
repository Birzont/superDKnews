import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import SafeImage from '../../components/SafeImage'
import RealTimeData from '../../components/RealTimeData'
import IdeologyStats from '../../components/IdeologyStats'

// 실시간 데이터 업데이트를 위한 설정
export const revalidate = 0 // 매번 새로운 데이터를 가져옴

// homepage_articles 테이블에서 특정 요약 기사를 가져오는 함수
async function getSummaryArticleById(id: string) {
  try {
    const { data, error } = await supabase
      .from('homepage_articles')
      .select('*')
      .eq('news_post_id', id)
      .single()

    if (error) {
      console.error('Error fetching summary article:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching summary article:', error)
    return null
  }
}

// newspaper_articles 테이블에서 특정 기사들을 가져오는 함수
async function getNewspaperArticles(articleIds: string[]) {
  try {
    const { data, error } = await supabase
      .from('newspaper_articles')
      .select('*')
      .in('newspaper_post_id', articleIds)
      .order('created_at', { ascending: false }) // 최신 기사부터 정렬

    if (error) {
      console.error('Error fetching newspaper articles:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching newspaper articles:', error)
    return []
  }
}

interface PostPageProps {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const summaryArticle = await getSummaryArticleById(params.id)

  if (!summaryArticle) {
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

  // included_article_ids를 파싱하여 개별 기사 ID 배열 생성
  let articleIds: string[] = []
  if (summaryArticle.included_article_ids) {
    try {
      // JSON 배열 형태로 저장되어 있다고 가정
      articleIds = JSON.parse(summaryArticle.included_article_ids) as string[]
    } catch {
      // 쉼표로 구분된 문자열 형태일 수도 있음
      articleIds = summaryArticle.included_article_ids.split(',').map((id: string) => id.trim())
    }
  }

  // 개별 기사들 가져오기
  const newspaperArticles = await getNewspaperArticles(articleIds)

  const getIdeologyColor = (ideology: number) => {
    if (ideology <= 3) return 'bg-red-100 text-red-800'
    if (ideology <= 5) return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getIdeologyText = (ideology: number) => {
    if (ideology <= 3) return '진보'
    if (ideology <= 5) return '중도'
    return '보수'
  }

  // 기본 이미지 URL (이미지 로딩 실패 시 사용)
  const defaultImageUrl = 'https://images.unsplash.com/photo-1495020683877-95802df4ae64?w=800&h=400&fit=crop'

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

  const displayImageUrl = (summaryArticle.imageurl && isValidImageUrl(summaryArticle.imageurl)) ? summaryArticle.imageurl : defaultImageUrl

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
              <div className="relative h-96 w-full bg-gray-100">
                <SafeImage
                  src={displayImageUrl}
                  alt={summaryArticle.included_article_ai_summary_titles || '뉴스 이미지'}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                    뉴스 요약
                  </span>
                  <span className="text-sm font-medium text-gray-600 bg-blue-100 px-3 py-2 rounded-full">
                    {summaryArticle.article_count || 0}개 기사 포함
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  {summaryArticle.included_article_ai_summary_titles || '제목 없음'}
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

                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed mb-8">
                    {summaryArticle.included_article_ai_summary_descriptions || '설명 없음'}
                  </p>
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

                <div className="divide-y divide-gray-200">
                  {newspaperArticles.map((article, index) => (
                    <div key={article.newspaper_post_id} className="p-8 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-6">
                        {/* 기사 이미지 */}
                        <div className="flex-shrink-0">
                          <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                            <SafeImage
                              src={article.image_url && isValidImageUrl(article.image_url) ? article.image_url : defaultImageUrl}
                              alt={article.news_post_title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>

                        {/* 기사 정보 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              {article.category || '일반'}
                            </span>
                            {article.news_post_ideology && (
                              <span className={`text-sm font-medium px-3 py-1 rounded-full ${getIdeologyColor(article.news_post_ideology)}`}>
                                {getIdeologyText(article.news_post_ideology)}
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {article.news_post_title}
                          </h3>

                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                            {article.news_post_description}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {article.created_at && new Date(article.created_at).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {article.news_post_url && (
                              <a
                                href={article.news_post_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                원문 보기 →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 기사가 없는 경우 */}
            {newspaperArticles.length === 0 && summaryArticle.article_count && summaryArticle.article_count > 0 && (
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