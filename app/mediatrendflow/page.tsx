"use client"

import React from "react";
import SideNav from '../components/SideNav';

const MediaTrendFlowPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-gray-100 to-white relative">
        {/* 상단 헤더 */}
        <div className="w-[1600px] mx-auto pt-10 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-left font-pretendard">이슈별 흐름 아카이브</h1>
          <p className="text-base text-gray-500 text-left font-pretendard">시간 흐름에 따라 언론이 어떻게 이슈를 다뤄왔는지 추적해보세요.(해당 보도는 선거 이전에 시행됨을 유의해주시길 바랍니다.)</p>
        </div>
        {/* 중앙 카드 */}
        <div className="w-[1600px] mx-auto mt-12 mb-8 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">준비 중입니다</h2>
              <p className="text-gray-500">이슈별 흐름 아카이브 기능이 곧 제공될 예정입니다.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MediaTrendFlowPage; 