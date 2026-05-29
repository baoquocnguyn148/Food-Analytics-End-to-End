"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { FoodCard } from "@/components/food-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { Food, CategoryDistributionItem } from "@/lib/types";
import { Search, ArrowRight, Check } from "lucide-react";

const RECOMMENDATIONS = [
  { title: "Muscle Gain", description: "High protein, calorie surplus", icon: "💪" },
  { title: "Weight Loss", description: "Low calorie, high fiber", icon: "⚡" },
  { title: "Heart Health", description: "Omega-3, low sodium", icon: "❤️" },
  { title: "Diabetic Friendly", description: "Low glycemic index", icon: "🎯" },
];

const PRICING_PLANS = [
  { name: "Basic", price: "9.99", features: ["Track macros", "Food database", "Basic recipes"] },
  { name: "Pro", price: "19.99", features: ["Everything in Basic", "Meal planning", "AI recommendations", "Nutrition reports"], badge: "Popular" },
  { name: "Family", price: "34.99", features: ["Everything in Pro", "Multiple profiles", "Family tracking", "Premium support"] },
];

export default function Page() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [featured, setFeatured] = useState<Food[]>([]);
  const [categories, setCategories] = useState<CategoryDistributionItem[]>([]);

  useEffect(() => {
    api.foods.list(1, 6).then((r) => setFeatured(r.data)).catch(() => {});
    api.analytics
      .categoryDistribution()
      .then((r) => setCategories(r.data.slice(0, 8)))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/foods?q=${encodeURIComponent(query.trim())}` : "/foods");
  };

  return (
    <main className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent opacity-60" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Smart Nutrition <span className="text-primary">Marketplace</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Explore 7000+ nutrition-rich foods with detailed health insights. Track macros,
                compare nutrition, and build your perfect meal plan.
              </p>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search 7000+ foods…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-12 h-12 rounded-lg bg-background/50 border-primary/20"
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 h-12 px-8">
                  Search
                </Button>
              </form>
              <div className="flex gap-4 pt-2">
                <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                  <Link href="/foods">
                    Explore Foods <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/recommend">Start Healthy Plan</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center bg-card/50 border-primary/20">
                <div className="text-3xl font-bold text-primary">7000+</div>
                <p className="text-sm text-muted-foreground">Foods</p>
              </Card>
              <Card className="p-4 text-center bg-card/50 border-primary/20">
                <div className="text-3xl font-bold text-accent">38</div>
                <p className="text-sm text-muted-foreground">Nutrients</p>
              </Card>
              <Card className="p-4 text-center bg-card/50 border-primary/20">
                <div className="text-3xl font-bold text-primary">AI</div>
                <p className="text-sm text-muted-foreground">Powered</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Categories (live) */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-2">Browse Categories</h2>
          <p className="text-muted-foreground mb-8">Live counts from the database</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.length === 0
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="p-6 bg-background/50 animate-pulse h-24" />
                ))
              : categories.map((cat) => (
                  <Link key={cat.category ?? "unknown"} href="/foods">
                    <Card className="p-6 cursor-pointer hover:border-primary/30 bg-background/50 transition">
                      <h3 className="font-semibold truncate">{cat.category ?? "Unknown"}</h3>
                      <p className="text-sm text-muted-foreground">{cat.foodCount} items</p>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Featured foods (live) */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2">Featured Foods</h2>
              <p className="text-muted-foreground">Straight from the live API</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/foods">
                View all <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-48 bg-card/50 animate-pulse" />
                ))
              : featured.map((f) => <FoodCard key={f.id} food={f} />)}
          </div>
        </div>
      </section>

      {/* AI recommendations -> link to /recommend */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-2">AI-Powered Recommendations</h2>
          <p className="text-muted-foreground mb-8">Tailored suggestions based on your goals</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {RECOMMENDATIONS.map((rec) => (
              <Link key={rec.title} href="/recommend">
                <Card className="p-6 h-full bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 hover:border-primary/50 transition">
                  <div className="text-4xl mb-3">{rec.icon}</div>
                  <h3 className="font-bold mb-1">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing (marketing) */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-2 text-center">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-center mb-10">
            Choose the perfect plan for your nutrition goals
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={`p-8 transition-all ${
                  plan.badge
                    ? "ring-2 ring-primary/50 bg-gradient-to-br from-primary/10 to-accent/5 scale-105"
                    : "bg-card/50 border-primary/20"
                }`}
              >
                {plan.badge && (
                  <Badge className="mb-4 bg-primary text-primary-foreground">{plan.badge}</Badge>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.badge ? "bg-primary hover:bg-primary/90" : ""}`}
                  variant={plan.badge ? "default" : "outline"}
                  asChild
                >
                  <Link href="/register">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-12 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            NutriHub
          </span>
          <p className="text-sm text-muted-foreground">© 2026 NutriHub. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
