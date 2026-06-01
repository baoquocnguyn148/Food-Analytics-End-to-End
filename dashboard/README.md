# 🥗 Food Analytics Interactive Dashboard

A comprehensive, interactive dashboard for exploring food nutrition data, machine learning insights, and personalized dietary recommendations. Built with **Next.js 16**, **React 19**, **TypeScript**, **Recharts**, and **Tailwind CSS**.

## 📊 Dashboard Sheets

### Sheet 1: 📊 Executive Summary & Macro Trends
- **KPI Cards**: Total foods, Average NDS, Plant-based %, Ultra-processed %
- **Donut Chart**: Plant-based vs Animal-based distribution
- **Stacked Bar Chart**: NOVA processing levels by food group
- **Scatter Plot**: Calories vs Protein with fat content bubble size

### Sheet 2: 🤖 Machine Learning Insights
- **KPI Cards**: Nutrition traps detected, XGBoost accuracy (97.8%)
- **Radar Chart**: K-Means food archetypes (6 clusters with macro profiles)
- **Treemap**: Health classification distribution (Healthy/Neutral/Unhealthy)
- **Nutrition Traps Table**: Anomalies with risk explanations

### Sheet 3: 🥗 Dietary & Health Profiler
- **Wellness Score Decomposition**: CWS breakdown and component analysis
- **Bar Chart**: Foods matching dietary goals (Keto, Vegan, Heart Health, etc.)
- **Scatter Plot**: Sugar vs Sodium with reference lines
- **Health Goals Overview**: Recommendations for 4 major objectives

### Sheet 4: 🔍 Smart Food Finder
- **Multi-criteria Filtering**: Search, food group, diet type, health label
- **Real-time Food List**: Sortable table with NDS scores
- **Detailed View**: Complete nutrition info, macros, diet suitability

## 🚀 Quick Start

```bash
cd dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
dashboard/
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Main dashboard page
│   └── globals.css          # Global styles
├── components/
│   ├── KPICard.tsx
│   ├── SheetNavigation.tsx
│   ├── Sheet1ExecutiveSummary.tsx
│   ├── Sheet2MLInsights.tsx
│   ├── Sheet3DietProfiler.tsx
│   └── Sheet4SmartFinder.tsx
├── lib/
│   └── data.ts              # Mock data (replace with real data)
└── package.json
```

## 🔧 Technologies

- **Next.js 16** (App Router with Turbopack)
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for interactive visualizations
- **Lucide React** for icons

## 📊 Data Integration

Replace mock data in `lib/data.ts` with real data from:
- CSV files: `food_cleaned.csv`, ML output files
- FastAPI backend: `http://localhost:8000/api/foods`
- Database queries

## 🎨 Features

✅ Interactive multi-sheet analytics dashboard
✅ Real-time filtering and search
✅ Responsive design (mobile, tablet, desktop)
✅ ML insights visualization (K-Means, XGBoost, Anomalies)
✅ Detailed nutrition profiling
✅ Diet compatibility matching

## 🚀 Production Build

```bash
npm run build
npm start
```

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Recharts Docs](https://recharts.org)
- [Tailwind CSS](https://tailwindcss.com)

---

**Part of Food Analytics End-to-End Project**
