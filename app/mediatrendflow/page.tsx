import React from "react";

const MediaTrendFlowPage = () => {
  return (
    <div className="container mx-auto px-4 py-10 md:py-16 lg:py-20">
      <div className="mb-10 flex items-start">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">특정 이슈에 대한 보도 변화를 추적해드립니다.</h1>
      </div>
      <div className="bg-white rounded-2xl shadow p-8 flex flex-col min-h-[400px] justify-center">
        <div className="mb-6 flex flex-row justify-start w-full gap-4 items-center">
          <a
            href="https://hukuacaive1.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-colors duration-200"
          >
            후쿠시마 오염수 방류 보도 추적
          </a>
          {/* 여기에 버튼을 추가할 수 있습니다 */}
        </div>
        {/* 추후: 이슈별 보도 변화 그래프/리스트 등 추가 */}
      </div>
    </div>
  );
};

export default MediaTrendFlowPage; 