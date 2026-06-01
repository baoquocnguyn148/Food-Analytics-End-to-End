"use client";

import React, { useState } from "react";
import { SheetNavigation } from "@/components/SheetNavigation";
import { Sheet1ExecutiveSummary } from "@/components/Sheet1ExecutiveSummary";
import { Sheet2MLInsights } from "@/components/Sheet2MLInsights";
import { Sheet3DietProfiler } from "@/components/Sheet3DietProfiler";
import { Sheet4SmartFinder } from "@/components/Sheet4SmartFinder";

export default function Home() {
  const [activeSheet, setActiveSheet] = useState(0);

  const renderSheet = () => {
    switch (activeSheet) {
      case 0:
        return <Sheet1ExecutiveSummary />;
      case 1:
        return <Sheet2MLInsights />;
      case 2:
        return <Sheet3DietProfiler />;
      case 3:
        return <Sheet4SmartFinder />;
      default:
        return <Sheet1ExecutiveSummary />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            🥗 Food Analytics Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Interactive insights for nutrition, ML analysis, and personalized
            food recommendations
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <SheetNavigation activeSheet={activeSheet} onSheetChange={setActiveSheet} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderSheet()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                📊 Dashboard Insights
              </h3>
              <p className="text-sm text-slate-600">
                Comprehensive food nutrition analytics with ML-powered
                classifications and personalized recommendations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                🔬 Technology Stack
              </h3>
              <p className="text-sm text-slate-600">
                Next.js, React, TypeScript, Recharts, Tailwind CSS, and Python
                ML pipelines.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                📈 Dataset
              </h3>
              <p className="text-sm text-slate-600">
                7,083 foods analyzed with 78 nutritional attributes using
                advanced ML techniques.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-sm text-slate-500">
            <p>
              Food Analytics End-to-End Dashboard © 2026 | Powered by ML &
              Data Science
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
