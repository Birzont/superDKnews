"use client"
import React, { useState } from "react";

interface SummaryTabsProps {
  left?: string;
  center?: string;
  right?: string;
}

const tabList = [
  { key: "left", label: "Left", color: "text-red-700" },
  { key: "center", label: "Center", color: "text-yellow-700" },
  { key: "right", label: "Right", color: "text-blue-700" },
];

export default function SummaryTabs({ left, center, right }: SummaryTabsProps) {
  const [selected, setSelected] = useState<"left" | "center" | "right">("left");

  const summaryMap: Record<string, string | undefined> = {
    left,
    center,
    right,
  };

  const getTitle = (key: string) => {
    if (key === "left") return "진보 요약";
    if (key === "center") return "중도 요약";
    if (key === "right") return "보수 요약";
    return "";
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
            disabled={!summaryMap[tab.key]}
            style={{ minWidth: 80 }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* 선택된 요약 */}
      <div className="bg-white p-6 rounded-lg shadow-sm min-h-[120px]">
        {summaryMap[selected] ? (
          <>
            <h4 className={`font-bold mb-2 ${tabList.find(t => t.key === selected)?.color}`}>{getTitle(selected)}</h4>
            <p className="text-gray-700 whitespace-pre-line">{summaryMap[selected]}</p>
          </>
        ) : (
          <p className="text-gray-400">해당 성향 요약이 없습니다.</p>
        )}
      </div>
    </div>
  );
} 