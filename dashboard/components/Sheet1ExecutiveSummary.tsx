"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
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
} from "recharts";
import { KPICard } from "./KPICard";
import {
  getKPIData,
  getPlantAnimalDistribution,
  getNovaDistribution,
  getCalorieProteinData,
} from "@/lib/data";
import { Leaf, TrendingUp, Zap } from "lucide-react";

export function Sheet1ExecutiveSummary() {
  const kpiData = getKPIData();
  const plantAnimalData = getPlantAnimalDistribution();
  const novaData = getNovaDistribution();
  const calorieProteinData = getCalorieProteinData();

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Foods in Database"
          value={kpiData.totalFoods.toLocaleString()}
          icon={<TrendingUp size={32} />}
        />
        <KPICard
          label="Average NDS Score"
          value={kpiData.avgNDS}
          unit="pts"
          icon={<Zap size={32} />}
        />
        <KPICard
          label="Plant-based Foods"
          value={kpiData.percentPlantBased}
          unit="%"
          icon={<Leaf size={32} />}
        />
        <KPICard
          label="Ultra-processed (NOVA 4)"
          value={kpiData.percentUltraProcessed}
          unit="%"
          trend={-5}
        />
      </div>

      {/* Donut Chart - Plant-based vs Animal-based */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Distribution: Plant-based vs Animal-based
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={plantAnimalData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                dataKey="value"
                label={({ name, value, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {plantAnimalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* NOVA Processing Levels - Stacked Bar */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Processing Levels (NOVA) by Food Group
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={novaData}
              layout="vertical"
              margin={{ left: 150, right: 30, top: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="main_group" type="category" width={140} />
              <Tooltip />
              <Legend />
              <Bar dataKey="nova1" stackId="a" fill="#10b981" name="Level 1" />
              <Bar dataKey="nova2" stackId="a" fill="#3b82f6" name="Level 2" />
              <Bar dataKey="nova3" stackId="a" fill="#f59e0b" name="Level 3" />
              <Bar dataKey="nova4" stackId="a" fill="#ef4444" name="Level 4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scatter Plot - Calories vs Protein */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Macronutrient Profile: Calories vs Protein (bubble size = fat content)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            data={calorieProteinData}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Calories (per 100g)"
              unit=" kcal"
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Protein (g/100g)"
              unit="g"
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm">Calories: {data.x} kcal</p>
                      <p className="text-sm">Protein: {data.y}g</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {calorieProteinData.map((entry, index) => (
              <Scatter
                key={`scatter-${index}`}
                name={entry.name}
                data={[entry]}
                fill={entry.color}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
