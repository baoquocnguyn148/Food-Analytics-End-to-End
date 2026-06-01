"use client";

import React, { useState, useMemo } from "react";
import { getAllFoods, FoodItem } from "@/lib/data";
import { GaugeChart, Gauge, ResponsiveContainer } from "recharts";
import { Search, X } from "lucide-react";

export function Sheet4SmartFinder() {
  const allFoods = getAllFoods();
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [filters, setFilters] = useState({
    mainGroup: "",
    dietType: "",
    healthLabel: "",
    searchTerm: "",
  });

  // Available filter options
  const mainGroups = [
    "All Groups",
    "Vegetables",
    "Fruits",
    "Meat & Poultry",
    "Dairy & Eggs",
    "Legumes",
    "Grains",
    "Beverages",
  ];

  const dietTypes = [
    { label: "All Diets", value: "" },
    { label: "Keto", value: "is_keto" },
    { label: "Vegan", value: "is_vegan" },
    { label: "Muscle Gain", value: "is_muscle_gain" },
    { label: "Weight Loss", value: "is_weight_loss" },
    { label: "Heart Health", value: "is_heart_health" },
    { label: "Diabetes-Friendly", value: "is_diabetes_friendly" },
  ];

  const healthLabels = [
    { label: "All", value: "" },
    { label: "Healthy", value: "Healthy" },
    { label: "Neutral", value: "Neutral" },
    { label: "Unhealthy", value: "Unhealthy" },
  ];

  // Filter foods based on current filters
  const filteredFoods = useMemo(() => {
    return allFoods.filter((food) => {
      // Main group filter
      if (
        filters.mainGroup &&
        filters.mainGroup !== "All Groups" &&
        food.main_group !== filters.mainGroup
      ) {
        return false;
      }

      // Diet type filter
      if (filters.dietType) {
        if (!food[filters.dietType as keyof FoodItem]) {
          return false;
        }
      }

      // Health label filter
      if (
        filters.healthLabel &&
        food.health_label !== filters.healthLabel
      ) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const lowerSearch = filters.searchTerm.toLowerCase();
        if (!food.description.toLowerCase().includes(lowerSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
    setSelectedFood(null);
  };

  const handleClearFilters = () => {
    setFilters({
      mainGroup: "",
      dietType: "",
      healthLabel: "",
      searchTerm: "",
    });
    setSelectedFood(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar - Filters */}
      <div className="lg:col-span-1">
        <div className="chart-container sticky top-24">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            🔍 Food Filters
          </h3>

          {/* Search Box */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Foods
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="e.g., Salmon, Broccoli..."
                value={filters.searchTerm}
                onChange={(e) =>
                  handleFilterChange("searchTerm", e.target.value)
                }
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Main Group Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Food Group
            </label>
            <select
              value={filters.mainGroup}
              onChange={(e) =>
                handleFilterChange("mainGroup", e.target.value)
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mainGroups.map((group) => (
                <option key={group} value={group === "All Groups" ? "" : group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          {/* Diet Type Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Diet Type
            </label>
            <select
              value={filters.dietType}
              onChange={(e) =>
                handleFilterChange("dietType", e.target.value)
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dietTypes.map((diet) => (
                <option key={diet.value} value={diet.value}>
                  {diet.label}
                </option>
              ))}
            </select>
          </div>

          {/* Health Label Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Health Label
            </label>
            <select
              value={filters.healthLabel}
              onChange={(e) =>
                handleFilterChange("healthLabel", e.target.value)
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {healthLabels.map((label) => (
                <option key={label.value} value={label.value}>
                  {label.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={handleClearFilters}
            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <X size={16} /> Clear Filters
          </button>

          <p className="text-xs text-slate-500 mt-4">
            {filteredFoods.length} foods match your filters
          </p>
        </div>
      </div>

      {/* Right Panel - Food List & Detail */}
      <div className="lg:col-span-3">
        {/* Food List */}
        <div className="chart-container mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Matching Foods ({filteredFoods.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Food
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">
                    Cal/100g
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">
                    Protein (g)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">
                    NDS
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFoods.length > 0 ? (
                  filteredFoods.map((food, index) => (
                    <tr
                      key={index}
                      className={`border-b border-slate-100 hover:bg-blue-50 cursor-pointer ${
                        selectedFood?.description === food.description
                          ? "bg-blue-100"
                          : ""
                      }`}
                      onClick={() => setSelectedFood(food)}
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900">
                          {food.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {food.main_group}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {food.calories.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {food.protein.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-block px-2 py-1 rounded text-white text-xs font-semibold ${
                            food.nds > 60
                              ? "bg-green-500"
                              : food.nds > 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        >
                          {food.nds.toFixed(0)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFood(food);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 px-4 text-center text-slate-500"
                    >
                      No foods match your filters. Try adjusting your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Food Detail */}
        {selectedFood && (
          <div className="chart-container">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              📊 Nutrition Detail: {selectedFood.description}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nutrition Scores */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Nutrient Density Score
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {selectedFood.nds.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Nutritional quality (0-100)
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Wellness Score
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {selectedFood.cws.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Overall health benefit
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Health Label
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      selectedFood.health_label === "Healthy"
                        ? "text-green-600"
                        : selectedFood.health_label === "Neutral"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedFood.health_label}
                  </p>
                </div>
              </div>

              {/* Macronutrient Breakdown */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3">Macros (per 100g)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">Protein</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (selectedFood.protein / 30) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 w-12">
                          {selectedFood.protein.toFixed(1)}g
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">Carbs</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (selectedFood.carbohydrate / 80) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 w-12">
                          {selectedFood.carbohydrate.toFixed(1)}g
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">Fat</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (selectedFood.fat_total_lipid / 30) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 w-12">
                          {selectedFood.fat_total_lipid.toFixed(1)}g
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3">Key Nutrients</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Fiber</p>
                      <p className="font-semibold text-slate-900">
                        {selectedFood.fiber.toFixed(1)}g
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Sodium</p>
                      <p className="font-semibold text-slate-900">
                        {selectedFood.sodium}mg
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Sugar</p>
                      <p className="font-semibold text-slate-900">
                        {selectedFood.sugar_total.toFixed(1)}g
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Calories</p>
                      <p className="font-semibold text-slate-900">
                        {selectedFood.calories.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diet Suitability */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-3">
                Diet Suitability
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedFood.is_keto && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    ✓ Keto
                  </span>
                )}
                {selectedFood.is_vegan && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    ✓ Vegan
                  </span>
                )}
                {selectedFood.is_muscle_gain && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    ✓ Muscle Gain
                  </span>
                )}
                {selectedFood.is_weight_loss && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    ✓ Weight Loss
                  </span>
                )}
                {selectedFood.is_heart_health && (
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                    ✓ Heart Health
                  </span>
                )}
                {selectedFood.is_diabetes_friendly && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    ✓ Diabetes-Friendly
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
