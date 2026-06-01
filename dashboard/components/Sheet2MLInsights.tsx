"use client";

import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Treemap,
  Tooltip,
  Cell,
} from "recharts";
import { KPICard } from "./KPICard";
import {
  getMacroProfiles,
  getHealthTreemapData,
  getNutritionTraps,
} from "@/lib/data";
import { AlertTriangle, Zap } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function Sheet2MLInsights() {
  const macroProfiles = getMacroProfiles();
  const healthTreemapData = getHealthTreemapData();
  const nutritionTraps = getNutritionTraps();

  const anomalyCount = 213;
  const modelAccuracy = 97.8;

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KPICard
          label="Nutrition Traps Detected"
          value={anomalyCount}
          icon={<AlertTriangle size={32} />}
        />
        <KPICard
          label="XGBoost Classifier Accuracy"
          value={modelAccuracy}
          unit="%"
          icon={<Zap size={32} />}
        />
      </div>

      {/* Radar Chart - Macro Profiles */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          K-Means Food Archetypes: Macro Profiles (% of total macros)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={macroProfiles}>
            <PolarGrid />
            <PolarAngleAxis dataKey="cluster" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Protein %"
              dataKey="Protein"
              stroke={COLORS[0]}
              fill={COLORS[0]}
              fillOpacity={0.25}
            />
            <Radar
              name="Carbs %"
              dataKey="Carbs"
              stroke={COLORS[1]}
              fill={COLORS[1]}
              fillOpacity={0.25}
            />
            <Radar
              name="Fat %"
              dataKey="Fat"
              stroke={COLORS[2]}
              fill={COLORS[2]}
              fillOpacity={0.25}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Treemap - Health Classification */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          XGBoost Health Classification: Food Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <Treemap
            data={healthTreemapData.children}
            dataKey="value"
            stroke="#fff"
            fill="#8884d8"
          >
            {healthTreemapData.children.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              formatter={(value) => `${value.toLocaleString()} foods`}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {/* Nutrition Traps Table */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={20} />
          Nutrition Traps: Hidden Health Risks
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  Food Item
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">
                  Calories
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">
                  Sugar (g)
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">
                  Sodium (mg)
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  Risk Reason
                </th>
              </tr>
            </thead>
            <tbody>
              {nutritionTraps.map((trap, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {trap.name}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {trap.calories}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {trap.sugar}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {trap.sodium}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{trap.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
