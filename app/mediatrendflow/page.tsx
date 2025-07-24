"use client"

import React from "react";
import SideNav from '../components/SideNav';

const MediaTrendFlowPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-gray-100 to-white relative">
        {/* 상단 헤더 */}
        <div className="w-full max-w-7xl mx-auto pt-4 md:pt-10 px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-left font-pretendard">이슈별 흐름 아카이브</h1>
          <p className="text-sm md:text-base text-gray-500 text-left font-pretendard">시간 흐름에 따라 언론이 어떻게 이슈를 다뤄왔는지 추적해보세요.(해당 보도는 선거 이전에 시행됨을 유의해주시길 바랍니다.)</p>
        </div>
        {/* 중앙 카드 */}
        <div className="w-full max-w-7xl mx-auto mt-6 md:mt-12 mb-8 px-4 md:px-6">
          <div className="bg-white rounded-xl md:rounded-3xl shadow-lg p-4 md:p-8 lg:p-12 flex flex-col items-center min-h-[400px] md:min-h-[600px] w-full">
            <div className="w-full flex flex-col gap-4 md:gap-8 mt-4 md:mt-8">
              <a
                href="https://hukuacaive1.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-base md:text-lg font-semibold py-4 md:py-6 px-4 rounded-xl md:rounded-2xl shadow transition-colors duration-200 text-center"
              >
                후쿠시마 오염수 방류 보도 추적
              </a>
              <a
                href="https://fundacaive2.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-base md:text-lg font-semibold py-4 md:py-6 px-4 rounded-xl md:rounded-2xl shadow transition-colors duration-200 text-center"
              >
                기본소득 보도 추적
              </a>
              <a
                href="https://wonjaacaive3.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-base md:text-lg font-semibold py-4 md:py-6 px-4 rounded-xl md:rounded-2xl shadow transition-colors duration-200 text-center"
              >
                원자력 발전소 보도 추적
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MediaTrendFlowPage; 