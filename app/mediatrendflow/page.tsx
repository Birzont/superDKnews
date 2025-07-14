import React from "react";

const MediaTrendFlowPage = () => {
  return (
    <div className="container mx-auto px-4 py-10 md:py-16 lg:py-20">
      <div className="mb-10">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">특정 이슈에 대한 보도 변화를 추적해드립니다.</h1>
      </div>
      <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center justify-center min-h-[400px]">
        {/* 추후: 이슈별 보도 변화 그래프/리스트 등 추가 */}
        <p className="text-gray-500 text-lg text-center">이 페이지에서는 주요 이슈에 대한 언론 보도의 시계열적 변화를 한눈에 볼 수 있도록 시각화할 예정입니다.</p>
      </div>
    </div>
  );
};

export default MediaTrendFlowPage; 