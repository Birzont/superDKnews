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
  searchQuery?: string;
}

export default function RealTimeNewsGrid({ selectedCategory, issuesOverride, searchQuery }: RealTimeNewsGridProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [articlesMap, setArticlesMap] = useState<{ [issueId: string]: Article[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allIssues, setAllIssues] = useState<Issue[]>([]); // 모든 이슈를 저장
  const PAGE_SIZE = 10;

  useEffect(() => {
    setIssues([]);
    setArticlesMap({});
    setCurrentPage(1);
    setLoading(true);
  }, [selectedCategory, issuesOverride]);

  // issuesOverride가 변경될 때마다 처리
  useEffect(() => {
    if (issuesOverride) {
      setAllIssues(issuesOverride);
      setIssues(issuesOverride);
      setTotalPages(1);
      setLoading(false);
      // 기사들 불러오기
      fetchArticlesForIssues(issuesOverride);
    } else {
      // Home 페이지의 경우 fetchAllIssues 호출
      fetchAllIssues();
    }
  }, [issuesOverride, selectedCategory]);

  // 검색어가 변경될 때마다 필터링
  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      // Bias Issue, Controversial Issue 페이지의 경우 이미 필터링된 이슈들 중에서 검색
      if (issuesOverride) {
        filterIssuesBySearch(searchQuery.trim(), issuesOverride);
        // 검색된 이슈들의 기사들도 불러오기
        fetchArticlesForIssues(issuesOverride);
      } else {
        // Home 페이지의 경우 모든 이슈에서 검색
        filterIssuesBySearch(searchQuery.trim());
      }
    } else {
      // 검색어가 없으면 페이지네이션 적용
      if (issuesOverride) {
        // Bias Issue, Controversial Issue 페이지의 경우 모든 필터링된 이슈 표시
        setIssues(issuesOverride);
        setTotalPages(1);
        // 모든 이슈의 기사들 불러오기
        fetchArticlesForIssues(issuesOverride);
      } else {
        // Home 페이지의 경우 페이지네이션 적용
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        setIssues(allIssues.slice(startIndex, endIndex));
        setTotalPages(Math.ceil(allIssues.length / PAGE_SIZE));
      }
    }
  }, [searchQuery, allIssues, currentPage, issuesOverride]);

  // 모든 이슈를 가져오는 함수
  const fetchAllIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: issuesData, error: issuesError } = await supabase
        .from('issue_table')
        .select('*')
        .eq('category', selectedCategory)
        .order('created_at', { ascending: false });
      
      if (issuesError) throw issuesError;
      
      setAllIssues(issuesData || []);
      
      // 페이지네이션 적용
      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      setIssues((issuesData || []).slice(startIndex, endIndex));
      setTotalPages(Math.ceil((issuesData || []).length / PAGE_SIZE));

      // 각 이슈별로 기사 리스트 불러오기
      await fetchArticlesForIssues(issuesData || []);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 필터링 함수
  const filterIssuesBySearch = (query: string, issuesToFilter: Issue[] = allIssues) => {
    const filtered = issuesToFilter.filter(issue => {
      const title = issue.related_major_issue?.toLowerCase() || '';
      const progressiveBody = issue.progressive_body?.toLowerCase() || '';
      const centristBody = issue.centrist_body?.toLowerCase() || '';
      const conservativeBody = issue.conservative_body?.toLowerCase() || '';
      
      const searchTerm = query.toLowerCase();
      
      return title.includes(searchTerm) || 
             progressiveBody.includes(searchTerm) || 
             centristBody.includes(searchTerm) || 
             conservativeBody.includes(searchTerm);
    });
    
    setIssues(filtered);
    setTotalPages(1); // 검색 결과는 페이지네이션 없이 모두 표시
  };

  // 각 이슈별로 기사 리스트를 불러오는 함수
  const fetchArticlesForIssues = async (issuesData: Issue[]) => {
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
  };

  const handleRetry = () => {
    setCurrentPage(1);
    setIssues([]);
    setArticlesMap({});
    setError(null);
    setLoading(true);
    fetchAllIssues();
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
          {searchQuery ? (
            <>
              <p className="text-gray-600 mb-2">"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
              <p className="text-sm text-gray-500 mb-4">다른 키워드로 검색해보세요.</p>
            </>
          ) : (
            <p className="text-gray-600 mb-4">표시할 뉴스가 없습니다.</p>
          )}
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
      {totalPages > 1 && !searchQuery && <Pagination />}
      
      {/* 페이지 정보 */}
      <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
        {searchQuery ? (
          <span>"{searchQuery}" 검색 결과: {issues.length}개의 뉴스</span>
        ) : (
          <>
            <span>페이지 {currentPage} / {totalPages}</span>
            <span className="mx-2">•</span>
            <span>총 {issues.length}개의 뉴스</span>
          </>
        )}
      </div>
    </>
  );
} 