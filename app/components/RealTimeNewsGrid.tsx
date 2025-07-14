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
}

export default function RealTimeNewsGrid({ selectedCategory }: RealTimeNewsGridProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [articlesMap, setArticlesMap] = useState<{ [issueId: string]: Article[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIssuesAndArticles();
    // eslint-disable-next-line
  }, [selectedCategory]);

  const fetchIssuesAndArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. 이슈(요약) 리스트 불러오기
      const { data: issuesData, error: issuesError } = await supabase
        .from('issue_table')
        .select('*')
        .eq('category', selectedCategory)
        .order('created_at', { ascending: false });
      if (issuesError) throw issuesError;
      setIssues(issuesData || []);

      // 2. 각 이슈별로 기사 리스트 불러오기
      const articlesMapTemp: { [issueId: string]: Article[] } = {};
      for (const issue of issuesData || []) {
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

  if (loading) {
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
            onClick={fetchIssuesAndArticles}
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
            onClick={fetchIssuesAndArticles}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
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
            description={issue.centrist_body}
            category={issue.category}
            ideology={ideologyValue}
            createdAt={issue.date || issue.created_at}
            ideologyStats={ideologyStats}
            imageUrl={issue.url} // 이미지 url 전달
          />
        );
      })}
      </div>
  );
} 