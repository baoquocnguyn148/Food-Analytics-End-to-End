import React from "react";

interface SheetNavigationProps {
  activeSheet: number;
  onSheetChange: (sheet: number) => void;
}

const sheets = [
  {
    id: 0,
    label: "📊 Executive Summary",
    description: "Macro Trends & KPIs",
  },
  {
    id: 1,
    label: "🤖 ML Insights",
    description: "Clustering & Anomalies",
  },
  {
    id: 2,
    label: "🥗 Diet Profiler",
    description: "Health & Dietary Goals",
  },
  {
    id: 3,
    label: "🔍 Smart Finder",
    description: "Interactive Food Search",
  },
];

export function SheetNavigation({
  activeSheet,
  onSheetChange,
}: SheetNavigationProps) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto gap-2 py-4">
          {sheets.map((sheet) => (
            <button
              key={sheet.id}
              onClick={() => onSheetChange(sheet.id)}
              className={`tab-button whitespace-nowrap flex-shrink-0 ${
                activeSheet === sheet.id ? "active" : ""
              }`}
            >
              <div className="text-center">
                <div className="font-semibold">{sheet.label}</div>
                <div
                  className={`text-xs ${
                    activeSheet === sheet.id
                      ? "text-blue-100"
                      : "text-slate-500"
                  }`}
                >
                  {sheet.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
