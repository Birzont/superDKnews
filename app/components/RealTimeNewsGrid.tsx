"use client"

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import NewsCard from './NewsCard'
import Toast from './RealTimeToast'

interface Issue {
  id: string;
  related_major_issue: string;
  news_ids: string;
  article_count: number;
  conservative_count: number;
  conservative_title: string;
  conservative_body: string;
  centrist_count: number;
  centrist_title: string;
  centrist_body: string;
  progressive_count: number;
  progressive_title: string;
  progressive_body: string;
  created_at: string;
  date: string;
  conservative_ratio: number;
  centrist_ratio: number;
  progressive_ratio: number;
  category: string;
  url?: string; // 이미지 url 컬럼 추가
}

interface Article {
  id: string;
  title: string;
  body: string;
  url: string;
  press: string;
  press_ideology: number;
  created_at: string;
  feature_extraction: string; // Added for image
}

interface RealTimeNewsGridProps {
  selectedCategory: string;
  issuesOverride?: Issue[];
}

export default function RealTimeNewsGrid({ selectedCategory, issuesOverride }: RealTimeNewsGridProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [articlesMap, setArticlesMap] = useState<{ [issueId: string]: Article[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setIssues([]);
    setArticlesMap({});
    setCurrentPage(1);
    setLoading(true);
  }, [selectedCategory, issuesOverride]);

  useEffect(() => {
    if (issuesOverride) {
      setIssues(issuesOverride);
      setLoading(false);
      setTotalPages(1);
      return;
    }
    fetchIssuesAndArticles(currentPage);
    // eslint-disable-next-line
  }, [selectedCategory, issuesOverride, currentPage]);

  const fetchIssuesAndArticles = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const from = (pageNum - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      // 1. 전체 개수 조회
      const { count: totalCount } = await supabase
        .from('issue_table')
        .select('*', { count: 'exact', head: true })
        .eq('category', selectedCategory);
      
      if (totalCount !== null) {
        setTotalPages(Math.ceil(totalCount / PAGE_SIZE));
      }

      // 2. 이슈(요약) 리스트 불러오기 (페이지 단위)
      const { data: issuesData, error: issuesError } = await supabase
        .from('issue_table')
        .select('*')
        .eq('category', selectedCategory)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (issuesError) throw issuesError;
      if (!issuesData || issuesData.length === 0) {
        setIssues([]);
        setLoading(false);
        return;
      }
      
      setIssues(issuesData);

      // 3. 각 이슈별로 기사 리스트 불러오기
      const articlesMapTemp: { [issueId: string]: Article[] } = {};
      for (const issue of issuesData) {
        let articleIds: string[] = [];
        try {
          articleIds = JSON.parse(issue.news_ids);
        } catch {
          articleIds = (issue.news_ids || '').split(',').map((id: string) => id.trim());
        }
        if (articleIds.length === 0) {
          articlesMapTemp[issue.id] = [];
          continue;
        }
        const { data: articlesData, error: articlesError } = await supabase
          .from('articles_table')
          .select('id, title, body, url, press, press_ideology, created_at, feature_extraction')
          .in('id', articleIds);
        if (articlesError) {
          articlesMapTemp[issue.id] = [];
        } else {
          // articleIds 순서대로 정렬
          const sortedArticles = articleIds
            .map(id => (articlesData || []).find((a: Article) => a.id === id))
            .filter(Boolean) as Article[];
          articlesMapTemp[issue.id] = sortedArticles;
        }
      }
      setArticlesMap(articlesMapTemp);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setCurrentPage(1);
    setIssues([]);
    setArticlesMap({});
    setError(null);
    setLoading(true);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 페이지네이션 컴포넌트
  const Pagination = () => {
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          이전
        </button>

        {/* 첫 페이지 */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-2 text-gray-400">...</span>
            )}
          </>
        )}

        {/* 페이지 번호들 */}
        {pages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === pageNum
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {pageNum}
          </button>
        ))}

        {/* 마지막 페이지 */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* 다음 페이지 버튼 */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          다음
        </button>
      </div>
    );
  };

  if (loading && issues.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">뉴스를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">표시할 뉴스가 없습니다.</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {issues.map((issue) => {
          const articles = articlesMap[issue.id] || [];
          // ideologyStats 계산
          const total = (issue.progressive_count || 0) + (issue.centrist_count || 0) + (issue.conservative_count || 0);
          const ideologyStats = {
            progressive: issue.progressive_count || 0,
            moderate: issue.centrist_count || 0,
            conservative: issue.conservative_count || 0,
            total,
            progressivePercent: total ? Math.round((issue.progressive_count || 0) / total * 100) : 0,
            moderatePercent: total ? Math.round((issue.centrist_count || 0) / total * 100) : 0,
            conservativePercent: total ? Math.round((issue.conservative_count || 0) / total * 100) : 0,
          };
          // 대표 성향(기사 개수 기준) 계산
          const counts = [
            { type: '진보', value: issue.progressive_count || 0 },
            { type: '중도', value: issue.centrist_count || 0 },
            { type: '보수', value: issue.conservative_count || 0 },
          ];
          counts.sort((a, b) => b.value - a.value);
          const mainIdeology = counts[0].type;
          let ideologyValue = 2; // 진보
          if (mainIdeology === '중도') ideologyValue = 4;
          else if (mainIdeology === '보수') ideologyValue = 7;
          return (
            <NewsCard
              key={issue.id}
              id={issue.id}
              title={issue.related_major_issue}
              description={issue.centrist_body && issue.centrist_body.trim() !== '' ? issue.centrist_body : issue.conservative_body}
              category={issue.category}
              ideology={ideologyValue}
              createdAt={issue.date || issue.created_at}
              ideologyStats={ideologyStats}
              imageUrl={issue.url} // 이미지 url 전달
            />
          );
        })}
      </div>
      
      {/* 페이지네이션 */}
      {totalPages > 1 && <Pagination />}
      
      {/* 페이지 정보 */}
      <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
        <span>페이지 {currentPage} / {totalPages}</span>
        <span className="mx-2">•</span>
        <span>총 {issues.length}개의 뉴스</span>
      </div>
    </>
  );
} 