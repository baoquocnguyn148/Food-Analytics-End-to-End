# 🥗 Food Analytics Dashboard - Quick Start Guide

## 🚀 30-Second Setup

```bash
cd /vercel/share/v0-project/dashboard
npm install
npm run dev
```

**→ Visit:** http://localhost:3000

---

## 📊 Dashboard Overview

Your dashboard has **4 interactive sheets**:

### Sheet 1️⃣ : Executive Summary
📈 **What you see:**
- 4 KPI cards (Total foods, avg nutrition score, plant-based %, ultra-processed %)
- Donut chart of plant vs animal foods
- NOVA processing levels by food group
- Scatter plot of calories vs protein

🎯 **Use case:** Understand the overall food ecosystem

---

### Sheet 2️⃣ : ML Insights
🤖 **What you see:**
- Nutrition trap anomalies (213 detected)
- XGBoost health classifier accuracy (97.8%)
- Radar chart of 6 food clusters (High-Carb, High-Protein, etc.)
- Treemap of health classifications
- Table of nutrition traps (foods that look healthy but aren't)

🎯 **Use case:** Discover ML findings and anomalies

---

### Sheet 3️⃣ : Diet Profiler
🥗 **What you see:**
- Wellness score breakdown
- Foods matching different diets (Keto, Vegan, etc.)
- Sugar vs Sodium scatter plot with health limits
- Top recommendations for 4 health goals

🎯 **Use case:** Explore dietary compatibility

---

### Sheet 4️⃣ : Smart Finder
🔍 **What you see:**
- Search & filter sidebar (by name, food group, diet, health label)
- Real-time food list with nutrition scores
- Click any food to see complete nutrition details

🎯 **Use case:** Find foods matching your criteria

---

## 🎨 Key Features

✅ **Interactive** - Click, hover, filter everything
✅ **Responsive** - Works on phone, tablet, desktop
✅ **Real-time** - Instant results as you filter
✅ **Colorful** - Easy-to-read visualizations
✅ **Smart** - Shows ML insights (anomalies, clusters)
✅ **Searchable** - Find foods instantly

---

## 📁 Files You Care About

**Main Files:**
- `app/page.tsx` - Dashboard main page
- `components/Sheet*.tsx` - The 4 sheet implementations
- `lib/data.ts` - Sample data (replace with real data here)

**To add real data:**
1. Open `lib/data.ts`
2. Replace `getKPIData()` and other functions with CSV/API calls
3. Restart dev server

---

## 💡 What's Next?

### Option 1: Explore the Dashboard
Just use it! Click through all 4 sheets, try filtering, view food details.

### Option 2: Connect Real Data
Replace mock data in `lib/data.ts` with actual CSV files or API calls:
```typescript
// Instead of mock data:
export const getKPIData = () => ({ ... })

// Use real data:
export async function getKPIData() {
  const foods = await loadCSV('/path/to/food_cleaned.csv');
  return calculateKPIs(foods);
}
```

### Option 3: Customize
- Add new visualizations
- Change colors in `app/globals.css`
- Modify filters in `Sheet4SmartFinder.tsx`
- Add new dietary goals

---

## 🔧 Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for errors
npm run lint
```

---

## 📊 Sample Data in Dashboard

The dashboard shows sample data for:
- **5 foods**: Broccoli, Salmon, Lentils, Spinach, Chicken
- **6 food clusters**: High-Carb, High-Protein, High-Fat, Balanced, Low-Cal, Low-Carb
- **3 health labels**: Healthy (3,200), Neutral (2,400), Unhealthy (1,483)
- **6 diet types**: Keto, Vegan, Muscle Gain, Weight Loss, Heart Health, Diabetes-friendly

**To add real food data:**
- Import `food_cleaned.csv` (7,083 foods)
- Add ML results from `module5_outputs/`
- Connect to FastAPI backend

---

## ❓ FAQ

**Q: How do I add my own data?**
A: Edit `lib/data.ts` and load your CSV or API data.

**Q: Can I deploy this?**
A: Yes! `npm run build` then deploy to Vercel or any Node.js host.

**Q: How do I change colors?**
A: Edit `app/globals.css` and modify color values.

**Q: How do I add a new chart?**
A: Create a new component in `components/` and import Recharts.

**Q: What if something breaks?**
A: Check console for errors. All code is TypeScript so type errors are caught.

---

## 🎯 Pro Tips

1. **Use the search** in Smart Finder to find foods instantly
2. **Click food rows** to see detailed nutrition info
3. **Hover over charts** to see data values
4. **Use filters** to narrow down to your dietary needs
5. **Check Nutrition Traps** for surprising facts (e.g., "granola = high sugar")

---

## 📞 Need Help?

- **Documentation:** Check `dashboard/README.md`
- **Code reference:** Check `DASHBOARD_IMPLEMENTATION.md`
- **Component code:** All TypeScript, well-commented
- **Data structure:** See `lib/data.ts` for schema

---

**Happy exploring! 🚀**

Built with ❤️ using Next.js 16, React 19, Recharts, and Tailwind CSS
