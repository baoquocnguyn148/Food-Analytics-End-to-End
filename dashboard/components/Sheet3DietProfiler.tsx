"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from "recharts";
import { getDietRecommendations, getSugarSodiumData } from "@/lib/data";

export function Sheet3DietProfiler() {
  const dietData = getDietRecommendations();
  const sugarSodiumData = getSugarSodiumData();
  const [selectedDiet, setSelectedDiet] = useState(null);

  const avgCWS = 45.2;

  return (
    <div className="space-y-8">
      {/* Decomposition Tree Visualization (simplified as Cards) */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Wellness Score Decomposition
        </h3>
        <div className="bg-slate-50 p-6 rounded-lg">
          <div className="mb-4">
            <p className="text-sm text-slate-600">Overall Composite Wellness Score (CWS)</p>
            <p className="text-4xl font-bold text-blue-600">{avgCWS}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded border border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Fortified Foods
              </p>
              <p className="text-2xl font-bold text-green-600">+8.5</p>
              <p className="text-xs text-slate-600 mt-1">
                Added vitamins boost score
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Low Sodium
              </p>
              <p className="text-2xl font-bold text-green-600">+12.3</p>
              <p className="text-xs text-slate-600 mt-1">
                Balanced sodium content
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Minimal Processing
              </p>
              <p className="text-2xl font-bold text-green-600">+5.2</p>
              <p className="text-xs text-slate-600 mt-1">
                NOVA 1-2 foods preferred
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Diet Compatibility Bar Chart */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Foods Matching Each Dietary Goal
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={dietData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="diet" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {dietData.map((entry, index) => (
                <Bar
                  key={`bar-${index}`}
                  dataKey="count"
                  fill={entry.color}
                  onClick={() => setSelectedDiet(entry.diet)}
                />
              ))}
            </Bar>
            {dietData.map((entry, index) => (
              <Bar
                key={`diet-${index}`}
                dataKey="count"
                fill={entry.color}
                radius={[8, 8, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        {selectedDiet && (
          <p className="text-sm text-slate-600 mt-4">
            Selected: <span className="font-semibold">{selectedDiet}</span>
          </p>
        )}
      </div>

      {/* Sugar vs Sodium with Reference Lines */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Sugar vs Sodium Risk Profile (with Reference Limits)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            data={sugarSodiumData}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="sugar"
              name="Sugar (g per 100g)"
              unit="g"
            />
            <YAxis
              type="number"
              dataKey="sodium"
              name="Sodium (mg per 100g)"
              unit="mg"
            />
            {/* Reference lines for recommended limits */}
            <ReferenceLine
              x={10}
              stroke="#f97316"
              strokeDasharray="5 5"
              label={{
                value: "High Sugar (10g)",
                position: "top",
                fill: "#f97316",
                fontSize: 12,
              }}
            />
            <ReferenceLine
              y={400}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{
                value: "High Sodium (400mg)",
                position: "right",
                fill: "#ef4444",
                fontSize: 12,
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                      <p className="font-semibold">{data.category}</p>
                      <p className="text-sm">Sugar: {data.sugar}g</p>
                      <p className="text-sm">Sodium: {data.sodium}mg</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {sugarSodiumData.map((entry, index) => (
              <Scatter
                key={`scatter-${index}`}
                name={entry.category}
                data={[entry]}
                fill={
                  entry.sugar > 10 || entry.sodium > 400
                    ? "#ef4444"
                    : "#10b981"
                }
                shape="circle"
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Health Goals Overview */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Top Health Goals & Food Alignment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              goal: "Muscle Gain",
              focus: "High Protein (>20g), Low Sugar",
              topFoods: ["Chicken Breast", "Salmon", "Lentils"],
            },
            {
              goal: "Weight Loss",
              focus: "Low Calorie (<100/100g), High Fiber",
              topFoods: ["Broccoli", "Spinach", "Mushrooms"],
            },
            {
              goal: "Heart Health",
              focus: "Low Sodium (<400mg), Healthy Fats",
              topFoods: ["Olive Oil", "Salmon", "Almonds"],
            },
            {
              goal: "Diabetes-Friendly",
              focus: "Low Sugar (<5g), Complex Carbs",
              topFoods: ["Lentils", "Oats", "Green Vegetables"],
            },
          ].map((item, index) => (
            <div key={index} className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900">{item.goal}</h4>
              <p className="text-sm text-slate-600 mt-1">{item.focus}</p>
              <div className="mt-3 space-y-1">
                {item.topFoods.map((food, fIndex) => (
                  <p key={fIndex} className="text-xs text-slate-700 flex items-center gap-2">
                    <span className="text-green-500">✓</span> {food}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
