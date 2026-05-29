"use client";

import { useState } from "react";
import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, ApiError } from "@/lib/api";
import type { PersonalizedItem } from "@/lib/types";
import { toast } from "sonner";

const GOALS = ["MUSCLEGAIN", "WEIGHTLOSS", "ENERGY", "ENDURANCE", "RECOVERY", "GENERAL_HEALTH"];
const RESTRICTIONS = ["VEGAN", "VEGETARIAN", "GLUTENFREE", "DAIRYFREE", "LOWSODIUM", "DIABETICFRIENDLY"];
const ACTIVITY = ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"];

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border/60 hover:border-primary/40"
      }`}
    >
      {label.replace("_", " ")}
    </button>
  );
}

export default function RecommendPage() {
  const [goals, setGoals] = useState<string[]>(["MUSCLEGAIN"]);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [activity, setActivity] = useState("MODERATE");
  const [items, setItems] = useState<PersonalizedItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const handleSubmit = async () => {
    if (goals.length === 0) {
      toast.error("Pick at least one goal");
      return;
    }
    setLoading(true);
    try {
      const res = await api.ml.personalized({
        goals,
        restrictions: restrictions.length ? restrictions : undefined,
        activityLevel: activity,
        limit: 12,
      });
      setItems(res.data.recommendations);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Personalized Meal Plan</h1>
        <p className="text-muted-foreground mb-8">
          Tell us your goals — the engine ranks foods for you.
        </p>

        <Card className="p-8 bg-card/50 border-primary/20 space-y-6">
          <div>
            <Label className="mb-3 block">Goals</Label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <Chip key={g} label={g} active={goals.includes(g)} onClick={() => toggle(goals, setGoals, g)} />
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Dietary restrictions (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {RESTRICTIONS.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  active={restrictions.includes(r)}
                  onClick={() => toggle(restrictions, setRestrictions, r)}
                />
              ))}
            </div>
          </div>

          <div className="max-w-xs">
            <Label className="mb-2 block">Activity level</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90">
            {loading ? "Generating…" : "Generate plan"}
          </Button>
        </Card>

        {items && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-6">
              {items.length} recommended foods
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((it) => (
                <Link
                  key={it.id}
                  href={`/foods/${it.id}`}
                  className="block p-5 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{it.description}</div>
                      {it.category && (
                        <Badge variant="secondary" className="mt-1">
                          {it.category}
                        </Badge>
                      )}
                    </div>
                    <span className="text-primary font-bold">{Math.round(it.score * 100)}%</span>
                  </div>
                  {it.matchedGoals.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {it.matchedGoals.map((g) => (
                        <Badge key={g} className="bg-primary/20 text-primary text-xs">
                          {g}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {it.explanation?.[0] && (
                    <p className="text-xs text-muted-foreground mt-2">{it.explanation[0]}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
