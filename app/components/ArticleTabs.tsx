"use client"
import React, { useState } from "react";
import SafeImage from "./SafeImage";

interface Article {
  newspaper_post_id: string;
  news_post_ideology: number;
  news_post_title: string;
  news_post_description?: string;
  news_post_url?: string;
  image_url?: string;
  category?: string;
  created_at?: string;
}

interface ArticleTabsProps {
  progressive: Article[];
  moderate: Article[];
  conservative: Article[];
  defaultImageUrl: string;
}

const tabList = [
  { key: "progressive", label: "Left", color: "text-red-700" },
  { key: "moderate", label: "Center", color: "text-yellow-700" },
  { key: "conservative", label: "Right", color: "text-blue-700" },
];

export default function ArticleTabs({ progressive, moderate, conservative, defaultImageUrl }: ArticleTabsProps) {
  const [selected, setSelected] = useState<"progressive" | "moderate" | "conservative">("progressive");

  const articleMap: Record<string, Article[]> = {
    progressive,
    moderate,
    conservative,
  };

  const getIdeologyColor = (ideology: number) => {
    if (ideology <= 3) return "bg-red-100 text-red-800";
    if (ideology <= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  const getIdeologyText = (ideology: number) => {
    if (ideology <= 3) return "진보";
    if (ideology <= 5) return "중도";
    return "보수";
  };

  const isValidImageUrl = (url?: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div>
      {/* 탭 버튼 */}
      <div className="flex items-center gap-2 mb-4">
        {tabList.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-md font-semibold border ${selected === tab.key ? `${tab.color} bg-gray-200 border-gray-400` : "text-gray-500 bg-gray-100 border-gray-200"}`}
            onClick={() => setSelected(tab.key as any)}
            disabled={articleMap[tab.key].length === 0}
            style={{ minWidth: 80 }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* 선택된 성향의 기사들 */}
      <div>
        {articleMap[selected].length > 0 ? (
          <div className="divide-y divide-gray-200">
            {articleMap[selected].map((article) => (
              <div key={article.newspaper_post_id} className="p-8 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-6">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {article.category || '일반'}
                      </span>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${getIdeologyColor(article.news_post_ideology)}`}>
                        {getIdeologyText(article.news_post_ideology)}
                      </span>
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
        ) : (
          <div className="text-gray-400 text-center py-8">해당 성향의 기사가 없습니다.</div>
        )}
      </div>
    </div>
  );
} 