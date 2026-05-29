"use client";

import { useEffect, useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api, ApiError } from "@/lib/api";
import type { CategoryDistributionItem, TopNutrientItem } from "@/lib/types";
import { toast } from "sonner";

function TopList({ title, items }: { title: string; items: TopNutrientItem[] }) {
  return (
    <Card className="p-6 bg-card/50 border-primary/20">
      <h3 className="font-bold mb-4">{title}</h3>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={it.id} className="flex items-center justify-between text-sm">
            <span className="truncate flex-1">
              <span className="text-muted-foreground mr-2">{i + 1}.</span>
              {it.description}
            </span>
            <span className="font-bold text-primary ml-3 whitespace-nowrap">
              {it.value.toFixed(1)} {it.unit}
            </span>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">No data.</p>}
      </div>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [categories, setCategories] = useState<CategoryDistributionItem[]>([]);
  const [protein, setProtein] = useState<TopNutrientItem[]>([]);
  const [fiber, setFiber] = useState<TopNutrientItem[]>([]);
  const [vitC, setVitC] = useState<TopNutrientItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.analytics.categoryDistribution(),
      api.analytics.topProtein(8),
      api.analytics.topFiber(8),
      api.analytics.topVitaminC(8),
    ])
      .then(([cat, p, f, v]) => {
        if (cat.status === "fulfilled") setCategories(cat.value.data.slice(0, 10));
        if (p.status === "fulfilled") setProtein(p.value.data);
        if (f.status === "fulfilled") setFiber(f.value.data);
        if (v.status === "fulfilled") setVitC(v.value.data);
        if (cat.status === "rejected")
          toast.error(
            cat.reason instanceof ApiError ? cat.reason.message : "Failed to load analytics"
          );
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = categories.map((c) => ({
    name: c.category ?? "Unknown",
    count: c.foodCount,
  }));

  return (
    <>
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Nutrition Analytics</h1>
        <p className="text-muted-foreground mb-10">
          Aggregated insights across the food database — live from the API.
        </p>

        {loading ? (
          <p className="text-muted-foreground py-20">Loading analytics…</p>
        ) : (
          <div className="space-y-8">
            <Card className="p-8 bg-card/50 border-primary/20">
              <h3 className="font-bold mb-6">Foods per Category</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" angle={-40} textAnchor="end" interval={0} height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TopList title="Top Protein" items={protein} />
              <TopList title="Top Fiber" items={fiber} />
              <TopList title="Top Vitamin C" items={vitC} />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
