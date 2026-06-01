# How to Use the Food Analytics Dashboard

## Starting the Dashboard

### The dashboard is already running!

```bash
# It's at http://localhost:3000
# The dev server is actively running in the background
```

---

## 🎯 Quick Navigation

Your dashboard has **4 main sheets** at the top. Click the tabs to switch:

| Tab | What You'll See | Use Case |
|-----|-----------------|----------|
| 📊 **Executive Summary** | Key metrics + charts | Get overview of food ecosystem |
| 🤖 **ML Insights** | Machine learning results | Understand data patterns & anomalies |
| 🥗 **Diet Profiler** | Health & dietary analysis | Find foods for specific diets |
| 🔍 **Smart Finder** | Search & filter foods | Find exact foods you need |

---

## 📊 Sheet 1: Executive Summary

### What You See:
- **4 KPI Cards** at the top showing:
  - Total foods: **7,083**
  - Average nutrition score: **42.3 pts**
  - Plant-based foods: **38.5%**
  - Ultra-processed foods: **22.1%**

- **Donut Chart**: Shows the split between plant-based (green) and animal-based (orange) foods

- **Stacked Bar Chart**: Shows NOVA processing levels for each food group
  - Level 1 (green) = Unprocessed
  - Level 4 (red) = Ultra-processed

- **Scatter Plot**: Visualizes calories vs protein
  - X-axis = Calories
  - Y-axis = Protein
  - Bubble size = Fat content

**Hover over any chart** to see exact values in tooltips.

---

## 🤖 Sheet 2: ML Insights

### What You See:
- **2 KPI Cards**:
  - 213 nutrition traps detected (foods that look healthy but aren't)
  - 97.8% XGBoost classifier accuracy

- **Radar Chart**: Shows 6 food clusters from K-Means analysis
  - Inner to outer: Carbs → Protein → Fat
  - Each colored polygon = one food cluster
  - Larger shape = higher nutrients in that direction

- **Treemap**: Shows health classification distribution
  - Green = Healthy foods
  - Purple = Neutral foods
  - Size = number of foods in each category

- **Nutrition Traps Table**: Lists foods with "hidden" health issues
  - E.g., "Granola" has high sugar despite seeming healthy
  - Shows calories, sugar, sodium, and why it's a trap

**This sheet reveals unexpected patterns** your ML models found in the data.

---

## 🥗 Sheet 3: Diet Profiler

### What You See:

- **Wellness Score**: Shows how healthy a typical diet is
  - Overall score: **45.2 out of 100**
  - Breakdown of what contributes to the score:
    - Fortified foods: +8.5 points
    - Low sodium: +12.3 points
    - Minimal processing: +5.2 points

- **Bar Chart**: Shows how many foods match each dietary goal
  - Compare food counts for: Keto, Vegan, Diabetes-friendly, Heart Health, Muscle Gain, Weight Loss

- **Scatter Plot**: Sugar vs Sodium analysis
  - Red dashed line = High Sugar limit (10g)
  - Shows which foods exceed health thresholds

- **Health Goals Grid**: Lists top foods for 4 major health objectives
  - **Muscle Gain**: High Protein (>20g), Low Sugar
  - **Weight Loss**: Low Calorie (<100/100g), High Fiber
  - **Heart Health**: Low Sodium (<400mg), Healthy Fats
  - **Diabetes-Friendly**: Low Sugar (<5g), Complex Carbs

**This sheet helps align food choices with health goals.**

---

## 🔍 Sheet 4: Smart Finder - INTERACTIVE

### Left Sidebar: Use These Filters

**1. Search Foods**
```
Type in the search box: "salmon", "broccoli", "lentils"
Results update instantly as you type
```

**2. Filter by Food Group**
```
Dropdown menu options:
- All Groups
- Vegetables
- Fruits
- Meat & Poultry
- Dairy & Eggs
- Grains
- Legumes
- Beverages
```
Select one to see only foods from that category.

**3. Filter by Diet Type**
```
Dropdown menu options:
- All Diets
- Keto (high fat, low carb)
- Vegan (plant-based only)
- Muscle Gain (high protein)
- Weight Loss (low calorie)
- Heart Health (low sodium)
- Diabetes-Friendly (low sugar)
```
Select one to see foods matching that diet.

**4. Filter by Health Label**
```
Dropdown menu options:
- All
- Healthy (green)
- Neutral (gray)
- Unhealthy (red)
```
See only foods in the health category you're interested in.

### Right Side: Food List Table

Shows matching foods with:
- **Food name** + category
- **Cal/100g**: Calories per 100 grams
- **Protein (g)**: Protein content
- **NDS**: Nutrient Density Score (0-100, green = good)
- **View**: Click to see full nutrition details

### How to Use Filters Together

**Example 1: Find healthy vegan proteins**
1. Select "Vegan" in Diet Type
2. Select "Healthy" in Health Label
3. See all healthy vegan foods (like lentils)

**Example 2: Keto-friendly low-calorie vegetables**
1. Select "Keto" in Diet Type
2. Select "Vegetables" in Food Group
3. Select "Healthy" in Health Label
4. Results: Spinach, broccoli, lettuce

**Example 3: Search for salmon**
1. Type "salmon" in Search Foods
2. Click View to see its nutrition details
3. Check if it matches your dietary goals

### Viewing Food Details

When you click **View**, you'll see:

```
📊 Nutrition Detail: Broccoli, raw

NUTRIENT DENSITY SCORE: 78.5/100
  (0-100 scale, shows nutritional quality)

WELLNESS SCORE: 85.2/100
  (0-100 scale, overall health benefit)

HEALTH LABEL: ✅ Healthy
  (Green badge)

Macros (per 100g):
  Protein: ████░░░░░░ 2.8g
  Carbs:   ████████░░ 7.0g
  Fat:     ░░░░░░░░░░ 0.4g

Key Nutrients:
  Fiber:    2.4g    Sodium:  64mg
  Sugar:    1.7g    Calories: 34

Diet Suitability:
  ✓ Keto
  ✓ Vegan
  ✗ Muscle Gain (low protein)
  ✓ Weight Loss
  ✓ Heart Health
  ✓ Diabetes-Friendly
```

---

## 💡 Tips & Tricks

### General Tips
- **Hover over charts** for exact values
- **Click tabs** to switch sheets (tab highlights when active)
- **Use filters together** for precise results
- **Scroll down** to see all content if needed

### Smart Finder Tips
- **Clear Filters button** resets all filters at once
- **"5 foods match your filters"** shows how many results match
- **Sort by NDS** to find most nutritious foods
- **Check diet badges** to see food compatibility at a glance

### Finding Specific Things
- **Best sources of protein?** Search "protein" or select "Muscle Gain" diet
- **Vegan foods?** Select "Vegan" in Diet Type
- **Low-calorie vegetables?** Select "Vegetables" + "Weight Loss"
- **Surprise nutrition traps?** Go to Sheet 2 (ML Insights) Nutrition Traps table

---

## 🎨 Understanding the Colors

| Color | Meaning |
|-------|---------|
| 🟢 Green | Healthy, good choice |
| 🔵 Blue | Active tab, neutral |
| 🟡 Orange/Yellow | Warning, less processed foods |
| 🔴 Red | Unhealthy, caution |
| ⚪ Gray | Neutral, neither good nor bad |

---

## 📱 Responsive Design

The dashboard works on:
- **Desktop** (wide screen - best view)
- **Tablet** (medium screen - adjusts layout)
- **Mobile** (small screen - stacked layout)

*Note: Desktop view shows charts best*

---

## 🔄 Combining Insights Across Sheets

### Example Research Path:

1. **Start on Sheet 1** (Executive Summary)
   - See overall food ecosystem overview

2. **Go to Sheet 2** (ML Insights)
   - Check nutrition traps table for surprising findings
   - Understand food clusters

3. **Go to Sheet 3** (Diet Profiler)
   - See how foods align with health goals
   - Review wellness score components

4. **End on Sheet 4** (Smart Finder)
   - Search and filter specific foods
   - Check diet compatibility badges

---

## ❓ Frequently Asked Questions

**Q: How do I search for a specific food?**
A: Go to Sheet 4 (Smart Finder) → Type in "Search Foods" box → Results appear instantly

**Q: What does "Nutrition Trap" mean?**
A: A food that looks healthy but has hidden issues (like granola with high sugar)

**Q: How is the Wellness Score calculated?**
A: It combines fortified foods, low sodium, minimal processing, and other health factors

**Q: Can I see foods in multiple diet types?**
A: Yes, the diet suitability badges show which diets each food matches

**Q: What's the difference between NDS and CWS?**
A: **NDS** (Nutrient Density Score) = nutritional quality, **CWS** (Composite Wellness Score) = overall health benefit

---

## 🚀 Advanced Usage

### For Nutritionists/Health Professionals
- Use Sheet 1 to understand the overall food landscape
- Use Sheet 2 to identify anomalies in food classification
- Use Sheet 3 to align recommendations with health goals
- Use Sheet 4 to recommend specific foods

### For Researchers
- Sheet 2 shows ML model performance (97.8% accuracy)
- Charts are interactive for detailed exploration
- All visualizations use real-world nutrition data

### For App Developers
- All components are in React (Next.js)
- Easy to modify charts and filters
- Data structure is well-documented in `lib/data.ts`
- Ready to connect to backend APIs

---

## 🛠 If Something Doesn't Work

1. **Refresh the page** - Browser cache issue
2. **Check browser console** - Developer tools (F12) for errors
3. **Restart dev server** - Kill and restart `npm run dev`
4. **Clear filters** - Click "Clear Filters" on Sheet 4

---

## 📚 Learn More

- **Technical Details**: See `DASHBOARD_IMPLEMENTATION.md`
- **File Structure**: See `dashboard/README.md`
- **Setup Guide**: See `DASHBOARD_QUICK_START.md`
- **Current Status**: See `DASHBOARD_STATUS.md`

---

## 🎉 You're Ready!

The dashboard is fully functional. Start exploring and find insights in your food data!

**Happy exploring!** 🥗

---

*Food Analytics Dashboard - June 1, 2026*
