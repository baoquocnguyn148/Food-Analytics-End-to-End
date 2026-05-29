"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { estimateCalories } from "@/lib/api";
import type { Food } from "@/lib/types";
import { ArrowRight } from "lucide-react";

function n(v: unknown, digits = 1): string {
  const num = Number(v);
  return Number.isFinite(num) ? num.toFixed(digits) : "0";
}

export function FoodCard({ food }: { food: Food }) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-card/50 border-primary/10 hover:border-primary/30">
      <div className="p-6">
        <div className="mb-3 min-h-[3.5rem]">
          <h4 className="font-bold leading-tight line-clamp-2">
            {food.description ?? "Unknown"}
          </h4>
          {food.category && (
            <Badge variant="secondary" className="mt-2">
              {food.category}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-primary/10 rounded p-2 text-center">
            <div className="text-xs text-muted-foreground">Protein</div>
            <div className="font-bold text-primary">{n(food.protein)}g</div>
          </div>
          <div className="bg-accent/10 rounded p-2 text-center">
            <div className="text-xs text-muted-foreground">Carbs</div>
            <div className="font-bold text-accent">{n(food.carbohydrate)}g</div>
          </div>
          <div className="bg-orange-500/10 rounded p-2 text-center">
            <div className="text-xs text-muted-foreground">Fat</div>
            <div className="font-bold text-orange-500">{n(food.totalLipid)}g</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">{estimateCalories(food)} kcal</span>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/foods/${food.id}`}>
              Details <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
