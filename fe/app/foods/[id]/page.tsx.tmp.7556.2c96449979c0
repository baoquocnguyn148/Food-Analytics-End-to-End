"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api, ApiError, estimateCalories } from "@/lib/api";
import type {
  Food,
  HealthClassification,
  DietTypeResult,
  RecommendationResponse,
} from "@/lib/types";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

const NUTRIENTS: { key: keyof Food; label: string; unit: string }[] = [
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbohydrate", label: "Carbohydrate", unit: "g" },
  { key: "totalLipid", label: "Total Fat", unit: "g" },
  { key: "sugarTotal", label: "Sugar", unit: "g" },
  { key: "fiber", label: "Fiber", unit: "g" },
  { key: "sodium", label: "Sodium", unit: "mg" },
  { key: "cholesterol", label: "Cholesterol", unit: "mg" },
  { key: "calcium", label: "Calcium", unit: "mg" },
  { key: "iron", label: "Iron", unit: "mg" },
  { key: "vitaminC", label: "Vitamin C", unit: "mg" },
];

const HEALTH_COLOR: Record<string, string> = {
  HEALTHY: "bg-green-500",
  NEUTRAL: "bg-yellow-500",
  UNHEALTHY: "bg-red-500",
};

export default function FoodDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [food, setFood] = useState<Food | null>(null);
  const [health, setHealth] = useState<HealthClassification | null>(null);
  const [diet, setDiet] = useState<DietTypeResult | null>(null);
  const [recs, setRecs] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isInteger(id)) return;
    setLoading(true);
    api.foods
      .get(id)
      .then((res) => setFood(res.data))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Food not found"))
      .finally(() => setLoading(false));

    // Fire ML analyses in parallel; failures are non-fatal.
    api.ml.health(id).then((r) => setHealth(r.data)).catch(() => {});
    api.ml.diet(id).then((r) => setDiet(r.data)).catch(() => {});
    api.ml.recommendations(id, 5).then((r) => setRecs(r.data)).catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="max-w-5xl mx-auto px-4 py-20 text-muted-foreground">Loading…</div>
      </>
    );
  }

  if (!food) {
    return (
      <>
        <NavBar />
        <div className="max-w-5xl mx-auto px-4 py-20">
          <p className="text-muted-foreground">Food not found.</p>
          <Link href="/foods" className="text-primary hover:underline">
            Back to catalogue
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <div>
          <Link href="/foods" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to catalogue
          </Link>
          <h1 className="text-4xl font-bold mt-2">{food.description}</h1>
          <div className="flex items-center gap-3 mt-2">
            {food.category && <Badge variant="secondary">{food.category}</Badge>}
            <span className="text-muted-foreground">{estimateCalories(food)} kcal (est.)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Nutrition */}
          <Card className="p-8 bg-card/50 border-primary/20">
            <h2 className="font-bold text-lg mb-6">Nutrition (per 100g)</h2>
            <div className="space-y-3">
              {NUTRIENTS.map((nut) => {
                const val = Number(food[nut.key]);
                return (
                  <div key={String(nut.key)} className="flex justify-between text-sm border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">{nut.label}</span>
                    <span className="font-semibold">
                      {Number.isFinite(val) ? val.toFixed(2) : "0"} {nut.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Health + diet */}
          <div className="space-y-8">
            <Card className="p-8 bg-card/50 border-primary/20">
              <h2 className="font-bold text-lg mb-4">Health Classification</h2>
              {health ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={HEALTH_COLOR[health.classification] || "bg-muted"}>
                      {health.classification}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Score {Math.round(health.score * 100)}/100
                    </span>
                  </div>
                  <Progress value={health.score * 100} className="mb-4" />
                  {health.explanation?.length > 0 && (
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      {health.explanation.slice(0, 4).map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Analyzing…</p>
              )}
            </Card>

            <Card className="p-8 bg-card/50 border-primary/20">
              <h2 className="font-bold text-lg mb-4">Diet Compatibility</h2>
              {diet ? (
                <div className="flex flex-wrap gap-2">
                  {diet.suitableDiets.length === 0 && (
                    <span className="text-sm text-muted-foreground">No strong matches.</span>
                  )}
                  {diet.suitableDiets.map((d) => (
                    <Badge key={d} className="bg-primary/20 text-primary">
                      {d}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Analyzing…</p>
              )}
            </Card>
          </div>
        </div>

        {/* Similar foods */}
        <Card className="p-8 bg-card/50 border-primary/20">
          <h2 className="font-bold text-lg mb-6">Similar Foods</h2>
          {recs ? (
            recs.recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No similar foods found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recs.recommendations.map((r) => (
                  <Link
                    key={r.id}
                    href={`/foods/${r.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition"
                  >
                    <div>
                      <div className="font-medium">{r.description}</div>
                      <div className="text-xs text-muted-foreground">{r.reason}</div>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <span className="text-sm font-bold">{Math.round(r.similarity * 100)}%</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <p className="text-sm text-muted-foreground">Finding similar foods…</p>
          )}
        </Card>
      </main>
    </>
  );
}
