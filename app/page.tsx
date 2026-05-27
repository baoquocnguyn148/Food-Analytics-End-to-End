'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Heart, ShoppingCart, Search, TrendingUp, Zap, Star, ArrowRight, Check } from 'lucide-react'
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const MOCK_FOODS = [
  { id: 1, name: 'Greek Yogurt', category: 'Dairy', protein: 10.2, carbs: 3.6, fat: 0.4, calories: 59, image: '🥛', score: 92 },
  { id: 2, name: 'Salmon Fillet', category: 'Seafood', protein: 25.4, carbs: 0, fat: 11.2, calories: 206, image: '🐟', score: 95 },
  { id: 3, name: 'Broccoli', category: 'Vegetables', protein: 2.8, carbs: 6.6, fat: 0.4, calories: 34, image: '🥦', score: 88 },
  { id: 4, name: 'Almonds', category: 'Nuts', protein: 21.2, carbs: 21.5, fat: 49.9, calories: 579, image: '🥜', score: 85 },
  { id: 5, name: 'Chicken Breast', category: 'Meat', protein: 31.0, carbs: 0, fat: 3.6, calories: 165, image: '🍗', score: 93 },
  { id: 6, name: 'Brown Rice', category: 'Grains', protein: 2.6, carbs: 23.0, fat: 0.9, calories: 111, image: '🍚', score: 72 },
  { id: 7, name: 'Blueberries', category: 'Fruits', protein: 0.7, carbs: 14.5, fat: 0.3, calories: 57, image: '🫐', score: 91 },
  { id: 8, name: 'Spinach', category: 'Vegetables', protein: 2.7, carbs: 3.6, fat: 0.4, calories: 23, image: '🥬', score: 94 },
]

const CATEGORIES = [
  { name: 'Fruits', emoji: '🍎', count: 142 },
  { name: 'Vegetables', emoji: '🥬', count: 187 },
  { name: 'Meat', emoji: '🍗', count: 95 },
  { name: 'Seafood', emoji: '🐟', count: 78 },
  { name: 'Dairy', emoji: '🥛', count: 62 },
  { name: 'Grains', emoji: '🍚', count: 103 },
  { name: 'Nuts', emoji: '🥜', count: 45 },
  { name: 'Beverages', emoji: '🧃', count: 89 },
]

const RECOMMENDATIONS = [
  { title: 'Muscle Gain', description: 'High protein, calorie surplus', icon: '💪', foods: ['Chicken Breast', 'Salmon', 'Eggs'] },
  { title: 'Weight Loss', description: 'Low calorie, high fiber', icon: '⚡', foods: ['Broccoli', 'Spinach', 'Chicken'] },
  { title: 'Heart Health', description: 'Omega-3, low sodium', icon: '❤️', foods: ['Salmon', 'Avocado', 'Almonds'] },
  { title: 'Diabetic Friendly', description: 'Low glycemic index', icon: '🎯', foods: ['Leafy Greens', 'Berries', 'Nuts'] },
]

const PRICING_PLANS = [
  { name: 'Basic', price: '9.99', features: ['Track macros', 'Food database', 'Basic recipes'] },
  { name: 'Pro', price: '19.99', features: ['Everything in Basic', 'Meal planning', 'AI recommendations', 'Nutrition reports'], badge: 'Popular' },
  { name: 'Family', price: '34.99', features: ['Everything in Pro', 'Multiple profiles', 'Family tracking', 'Premium support'] },
]

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [proteinRange, setProteinRange] = useState([0, 35])
  const [compareItems, setCompareItems] = useState<typeof MOCK_FOODS>([])
  const [favorites, setFavorites] = useState<number[]>([])

  const filteredFoods = useMemo(() => {
    return MOCK_FOODS.filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !selectedCategory || food.category === selectedCategory
      const matchesProtein = food.protein >= proteinRange[0] && food.protein <= proteinRange[1]
      return matchesSearch && matchesCategory && matchesProtein
    })
  }, [searchQuery, selectedCategory, proteinRange])

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const toggleCompare = (food: typeof MOCK_FOODS[0]) => {
    setCompareItems(prev => 
      prev.find(f => f.id === food.id) 
        ? prev.filter(f => f.id !== food.id)
        : [...prev.slice(0, 2), food].slice(-2)
    )
  }

  const macroData = [
    { name: 'Protein', value: 30 },
    { name: 'Carbs', value: 40 },
    { name: 'Fat', value: 30 },
  ]

  const nutritionBreakdown = [
    { nutrient: 'Vitamin A', percentage: 85 },
    { nutrient: 'Vitamin C', percentage: 92 },
    { nutrient: 'Iron', percentage: 78 },
    { nutrient: 'Calcium', percentage: 88 },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-lg bg-background/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            NutriHub
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm">Browse</Button>
            <Button variant="ghost" size="sm">Meal Plans</Button>
            <Button variant="ghost" size="sm">Compare</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent opacity-60"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-balance">
                  Smart Nutrition <span className="text-primary">Marketplace</span>
                </h1>
                <p className="text-xl text-muted-foreground text-balance">
                  Explore 7000+ nutrition-rich foods with detailed health insights. Track macros, compare nutrition, and build your perfect meal plan.
                </p>
              </div>

              {/* Search bar */}
              <div className="relative">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search 7000+ foods..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 rounded-lg bg-background/50 border-primary/20"
                    />
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 h-12 px-8">Search</Button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4 pt-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Explore Foods <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline">
                  Start Healthy Plan
                </Button>
              </div>
            </div>

            {/* Right - Nutrition preview */}
            <div className="space-y-6">
              <Card className="p-8 bg-card/50 border-primary/20 backdrop-blur">
                <h3 className="text-lg font-semibold mb-6">Nutrition Overview</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={macroData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center bg-card/50 border-primary/20">
                  <div className="text-3xl font-bold text-primary">94%</div>
                  <p className="text-sm text-muted-foreground">Health Score</p>
                </Card>
                <Card className="p-4 text-center bg-card/50 border-primary/20">
                  <div className="text-3xl font-bold text-accent">7000+</div>
                  <p className="text-sm text-muted-foreground">Foods</p>
                </Card>
                <Card className="p-4 text-center bg-card/50 border-primary/20">
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <p className="text-sm text-muted-foreground">Organic Data</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-2">Browse Categories</h2>
            <p className="text-muted-foreground">Explore foods organized by type</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Card
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                className={`p-6 cursor-pointer transition-all duration-300 ${
                  selectedCategory === cat.name 
                    ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                    : 'hover:border-primary/30 bg-background/50'
                }`}
              >
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <h3 className="font-semibold">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">{cat.count} items</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Filter & Products Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-card/50 border-primary/20 h-fit sticky top-24">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Filters
                </h3>

                <div className="space-y-6">
                  {/* Protein Range */}
                  <div>
                    <label className="text-sm font-semibold mb-3 block">Protein (g)</label>
                    <Slider
                      value={proteinRange}
                      onValueChange={setProteinRange}
                      min={0}
                      max={35}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{proteinRange[0]}g</span>
                      <span>{proteinRange[1]}g</span>
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div>
                    <label className="text-sm font-semibold mb-3 block">Quick Filters</label>
                    <div className="space-y-2">
                      {['High Protein', 'Low Carb', 'Vegan', 'Gluten Free'].map((filter) => (
                        <label key={filter} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded bg-input border-primary/20" />
                          <span className="text-sm">{filter}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90">Apply Filters</Button>
                </div>
              </Card>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <h3 className="text-2xl font-bold">Featured Products</h3>
                <p className="text-muted-foreground text-sm">
                  Showing {filteredFoods.length} foods {selectedCategory && `in ${selectedCategory}`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFoods.map((food) => (
                  <Card key={food.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-card/50 border-primary/10 hover:border-primary/30">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-5xl">{food.image}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(food.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              favorites.includes(food.id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                      </div>

                      <div className="mb-3">
                        <h4 className="font-bold text-lg">{food.name}</h4>
                        <Badge variant="secondary" className="mt-1">{food.category}</Badge>
                      </div>

                      {/* Nutrition Badges */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-primary/10 rounded p-2 text-center">
                          <div className="text-xs text-muted-foreground">Protein</div>
                          <div className="font-bold text-primary">{food.protein}g</div>
                        </div>
                        <div className="bg-accent/10 rounded p-2 text-center">
                          <div className="text-xs text-muted-foreground">Carbs</div>
                          <div className="font-bold text-accent">{food.carbs}g</div>
                        </div>
                        <div className="bg-orange-500/10 rounded p-2 text-center">
                          <div className="text-xs text-muted-foreground">Fat</div>
                          <div className="font-bold text-orange-500">{food.fat}g</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold">{food.calories} cal</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{food.score}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 bg-primary hover:bg-primary/90" size="sm">
                          <ShoppingCart className="w-4 h-4 mr-2" /> Add
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCompare(food)}
                          className={compareItems.find(f => f.id === food.id) ? 'border-primary/50 bg-primary/10' : ''}
                        >
                          Compare
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nutrition Details Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Detailed Nutrition Analysis</h2>
          <p className="text-muted-foreground mb-12">Advanced breakdown of macros and micronutrients</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Macro Chart */}
            <Card className="p-8 bg-background/50 border-primary/20">
              <h3 className="font-bold mb-6">Macronutrient Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={macroData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis />
                  <Radar name="Macro" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            {/* Vitamin Breakdown */}
            <Card className="p-8 bg-background/50 border-primary/20">
              <h3 className="font-bold mb-6">Vitamin & Mineral Breakdown</h3>
              <div className="space-y-4">
                {nutritionBreakdown.map((item) => (
                  <div key={item.nutrient}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.nutrient}</span>
                      <span className="text-primary font-bold">{item.percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Recommendations */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">AI-Powered Recommendations</h2>
          <p className="text-muted-foreground mb-12">Tailored suggestions based on your health goals</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RECOMMENDATIONS.map((rec) => (
              <Card key={rec.title} className="p-8 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 hover:border-primary/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{rec.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.foods.map((food) => (
                        <Badge key={food} variant="secondary" className="bg-primary/20 text-primary">
                          {food}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compare Section */}
      {compareItems.length > 0 && (
        <section className="py-20 px-4 bg-card/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-12">Compare Foods</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/20">
                    <th className="text-left py-4 px-4 font-bold">Nutrient</th>
                    {compareItems.map((food) => (
                      <th key={food.id} className="py-4 px-4 text-center">
                        <div className="text-2xl mb-2">{food.image}</div>
                        <div className="font-bold">{food.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['Protein', 'Carbs', 'Fat', 'Calories'].map((nutrient) => (
                    <tr key={nutrient} className="border-b border-primary/10 hover:bg-primary/5">
                      <td className="py-4 px-4 font-semibold">{nutrient}</td>
                      {compareItems.map((food) => (
                        <td key={food.id} className="py-4 px-4 text-center font-bold text-primary">
                          {food[nutrient.toLowerCase() as keyof typeof food]}
                          {nutrient !== 'Calories' ? 'g' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Loved by Health Enthusiasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', role: 'Fitness Coach', text: 'NutriHub transformed how I track nutrition for my clients. The insights are incredible!' },
              { name: 'John D.', role: 'Athlete', text: 'Detailed nutritional data helps me optimize my diet perfectly. Best nutrition app ever!' },
              { name: 'Emma L.', role: 'Nutritionist', text: 'The database is comprehensive and accurate. My patients love the comparison features.' },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="p-6 bg-card/50 border-primary/20">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-center mb-12">Choose the perfect plan for your nutrition goals</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={`p-8 transition-all ${
                  plan.badge
                    ? 'ring-2 ring-primary/50 bg-gradient-to-br from-primary/10 to-accent/5 scale-105'
                    : 'bg-card/50 border-primary/20'
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
                  className={`w-full ${
                    plan.badge
                      ? 'bg-primary hover:bg-primary/90'
                      : 'border-primary/30 hover:bg-primary/10'
                  }`}
                  variant={plan.badge ? 'default' : 'outline'}
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">NutriHub</h3>
              <p className="text-sm text-muted-foreground">Smart nutrition marketplace for healthier living.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">About</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Download</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">App Store</Button>
                <Button variant="outline" size="sm" className="w-full">Play Store</Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2024 NutriHub. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">Status</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
