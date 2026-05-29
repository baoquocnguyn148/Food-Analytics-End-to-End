# Analytics Module - Complete API Documentation

**Module**: Food Analytics Platform - Analytics API  
**Sprint**: SPRINT 4  
**Date**: 2026-05-29  
**Status**: ✅ COMPLETE

---

## 📊 Endpoints Overview

All endpoints are under `/api/analytics` and support pagination, sorting, and filtering.

### Nutrition-Based Analytics (5 endpoints)
1. `GET /api/analytics/top-protein` - Top foods by protein content
2. `GET /api/analytics/top-fiber` - Top foods by fiber content
3. `GET /api/analytics/top-vitamin-c` - Top foods by vitamin C
4. `GET /api/analytics/top-vitamin-a` - Top foods by vitamin A
5. `GET /api/analytics/top-calcium` - Top foods by calcium

### Aggregated Analytics (3 endpoints)
6. `GET /api/analytics/category-distribution` - Food count per category
7. `GET /api/analytics/nutrient-distribution` - Average nutrients per category
8. `GET /api/analytics/top-healthy-foods` - Foods ranked by health score

### Classification Analytics (2 endpoints)
9. `GET /api/analytics/plant-vs-animal` - Plant vs animal food split
10. `GET /api/analytics/processing-level-distribution` - Processing level breakdown

---

## 🔧 Query Parameters

### Common Parameters (Nutrition Endpoints)
```
limit: number (1-100, default: 10)
offset: number (0+, default: 0)
sortBy: "asc" | "desc" (default: "desc")
category: string (optional, filter by category)
```

### Example Queries
```
/api/analytics/top-protein?limit=5&offset=0&sortBy=desc
/api/analytics/top-fiber?limit=10&offset=10&sortBy=asc
/api/analytics/top-vitamin-c?category=Vegetables&limit=15
```

---

## 📋 Detailed Endpoint Specifications

### 1. Top Protein Foods
**Endpoint**: `GET /api/analytics/top-protein?limit=10&offset=0&sortBy=desc`

**Query Parameters**:
- `limit`: Results per page (1-100, default: 10)
- `offset`: Pagination offset (default: 0)
- `sortBy`: Sort order - "asc" or "desc" (default: "desc")

**Response**:
```json
{
  "success": true,
  "nutrient": "Protein",
  "data": [
    {
      "id": 123,
      "description": "Chicken Breast, cooked",
      "category": "Poultry",
      "value": 31.5,
      "unit": "g"
    },
    {
      "id": 456,
      "description": "Beef, lean",
      "category": "Meat",
      "value": 26.2,
      "unit": "g"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 7083
  }
}
```

---

### 2. Top Fiber Foods
**Endpoint**: `GET /api/analytics/top-fiber?limit=10&offset=0`

**Response**:
```json
{
  "success": true,
  "nutrient": "Fiber",
  "data": [
    {
      "id": 789,
      "description": "Raspberries",
      "category": "Fruits",
      "value": 6.5,
      "unit": "g"
    },
    {
      "id": 1012,
      "description": "Whole Wheat Bread",
      "category": "Grains",
      "value": 3.7,
      "unit": "g"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 7083
  }
}
```

---

### 3. Top Vitamin C Foods
**Endpoint**: `GET /api/analytics/top-vitamin-c?limit=10`

**Response**:
```json
{
  "success": true,
  "nutrient": "Vitamin C",
  "data": [
    {
      "id": 1345,
      "description": "Kiwi Fruit",
      "category": "Fruits",
      "value": 92.7,
      "unit": "mg"
    },
    {
      "id": 1678,
      "description": "Bell Pepper, red",
      "category": "Vegetables",
      "value": 95.0,
      "unit": "mg"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 7083
  }
}
```

---

### 4. Top Vitamin A Foods
**Endpoint**: `GET /api/analytics/top-vitamin-a?limit=10&sortBy=desc`

**Response**:
```json
{
  "success": true,
  "nutrient": "Vitamin A",
  "data": [
    {
      "id": 2001,
      "description": "Sweet Potato, cooked",
      "category": "Vegetables",
      "value": 961.0,
      "unit": "µg"
    },
    {
      "id": 2334,
      "description": "Carrots, raw",
      "category": "Vegetables",
      "value": 835.0,
      "unit": "µg"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 7083
  }
}
```

---

### 5. Top Calcium Foods
**Endpoint**: `GET /api/analytics/top-calcium?limit=10`

**Response**:
```json
{
  "success": true,
  "nutrient": "Calcium",
  "data": [
    {
      "id": 2667,
      "description": "Milk, whole",
      "category": "Dairy",
      "value": 123.0,
      "unit": "mg"
    },
    {
      "id": 3000,
      "description": "Yogurt, plain",
      "category": "Dairy",
      "value": 110.0,
      "unit": "mg"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 7083
  }
}
```

---

### 6. Category Distribution
**Endpoint**: `GET /api/analytics/category-distribution`

**Query Parameters**: None

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "category": "Vegetables",
      "foodCount": 1245,
      "percentage": 17.58
    },
    {
      "category": "Fruits",
      "foodCount": 892,
      "percentage": 12.59
    },
    {
      "category": "Meat",
      "foodCount": 567,
      "percentage": 8.00
    },
    {
      "category": "Dairy",
      "foodCount": 334,
      "percentage": 4.72
    },
    {
      "category": "Grains",
      "foodCount": 445,
      "percentage": 6.28
    }
  ],
  "summary": {
    "totalCategories": 12,
    "totalFoods": 7083
  }
}
```

---

### 7. Nutrient Distribution by Category
**Endpoint**: `GET /api/analytics/nutrient-distribution?limit=20&sortBy=foodCount`

**Query Parameters**:
- `limit`: Max categories to return (default: 20)
- `sortBy`: "foodCount" | "avgProtein" | "avgFiber" | "avgVitaminC" (default: "foodCount")

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "category": "Vegetables",
      "foodCount": 1245,
      "avgProtein": 2.4,
      "avgFiber": 2.1,
      "avgVitaminC": 28.5,
      "avgVitaminA": 425.3,
      "avgCalcium": 45.2
    },
    {
      "category": "Fruits",
      "foodCount": 892,
      "avgProtein": 0.9,
      "avgFiber": 2.8,
      "avgVitaminC": 35.2,
      "avgVitaminA": 120.5,
      "avgCalcium": 32.1
    },
    {
      "category": "Meat",
      "foodCount": 567,
      "avgProtein": 24.5,
      "avgFiber": 0.0,
      "avgVitaminC": 1.2,
      "avgVitaminA": 45.3,
      "avgCalcium": 12.4
    }
  ],
  "summary": {
    "totalCategories": 12,
    "sortedBy": "foodCount"
  }
}
```

---

### 8. Top Healthy Foods
**Endpoint**: `GET /api/analytics/top-healthy-foods?limit=10&offset=0&minScore=0.6`

**Query Parameters**:
- `limit`: Results per page (default: 10)
- `offset`: Pagination offset (default: 0)
- `minScore`: Minimum health score 0-1 (optional)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "description": "Broccoli, raw",
      "category": "Vegetables",
      "healthScore": 0.95,
      "protein": 2.8,
      "fiber": 2.4,
      "sugarTotal": 2.2
    },
    {
      "id": 456,
      "description": "Salmon, cooked",
      "category": "Fish",
      "healthScore": 0.88,
      "protein": 25.4,
      "fiber": 0.0,
      "sugarTotal": 0.0
    },
    {
      "id": 789,
      "description": "Almonds",
      "category": "Nuts",
      "healthScore": 0.85,
      "protein": 21.2,
      "fiber": 3.5,
      "sugarTotal": 4.4
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 3245
  }
}
```

---

### 9. Plant vs Animal Classification
**Endpoint**: `GET /api/analytics/plant-vs-animal`

**Query Parameters**: None

**Response**:
```json
{
  "success": true,
  "data": {
    "plantBased": {
      "count": 3456,
      "percentage": 48.78,
      "categories": ["Vegetables", "Fruits", "Grains", "Legumes", "Nuts", "Seeds"],
      "examples": [
        "Broccoli, raw",
        "Apple",
        "Whole Wheat Bread",
        "Black Beans",
        "Almonds"
      ]
    },
    "animalBased": {
      "count": 2145,
      "percentage": 30.27,
      "categories": ["Meat", "Poultry", "Fish", "Seafood", "Milk", "Dairy", "Egg"],
      "examples": [
        "Chicken Breast, cooked",
        "Beef, lean",
        "Salmon, cooked",
        "Milk, whole",
        "Eggs"
      ]
    },
    "mixed": {
      "count": 1482,
      "percentage": 20.91
    },
    "total": 7083
  }
}
```

---

### 10. Processing Level Distribution
**Endpoint**: `GET /api/analytics/processing-level-distribution`

**Query Parameters**: None

**Response**:
```json
{
  "success": true,
  "data": {
    "whole": {
      "count": 2234,
      "percentage": 31.54,
      "examples": [
        "Apple",
        "Broccoli, raw",
        "Almonds",
        "Brown Rice",
        "Carrots, raw"
      ]
    },
    "minimally": {
      "count": 1567,
      "percentage": 22.11,
      "examples": [
        "Frozen Broccoli",
        "Dried Apricots",
        "Canned Beans",
        "Pasteurized Milk",
        "Frozen Salmon"
      ]
    },
    "processed": {
      "count": 2345,
      "percentage": 33.08,
      "examples": [
        "Whole Wheat Bread",
        "Cheddar Cheese",
        "Yogurt, plain",
        "Olive Oil",
        "Tomato Sauce"
      ]
    },
    "ultraProcessed": {
      "count": 937,
      "percentage": 13.23,
      "examples": [
        "Instant Noodles",
        "Frozen Meal",
        "Potato Chips",
        "Candy Bars",
        "Cola"
      ]
    },
    "total": 7083
  }
}
```

---

## 🔍 Example API Calls

### Using cURL

```bash
# Top Protein Foods
curl "http://localhost:5000/api/analytics/top-protein?limit=5&offset=0&sortBy=desc"

# Top Fiber Foods with Pagination
curl "http://localhost:5000/api/analytics/top-fiber?limit=10&offset=10"

# Top Vitamin C Foods
curl "http://localhost:5000/api/analytics/top-vitamin-c?limit=5"

# Category Distribution
curl "http://localhost:5000/api/analytics/category-distribution"

# Nutrient Distribution sorted by Protein
curl "http://localhost:5000/api/analytics/nutrient-distribution?limit=15&sortBy=avgProtein"

# Top Healthy Foods
curl "http://localhost:5000/api/analytics/top-healthy-foods?limit=10&minScore=0.7"

# Plant vs Animal Split
curl "http://localhost:5000/api/analytics/plant-vs-animal"

# Processing Level Distribution
curl "http://localhost:5000/api/analytics/processing-level-distribution"
```

### Using Postman

1. Create collection: "Food Analytics"
2. Add requests for each endpoint
3. Set `base_url` = `http://localhost:5000`
4. Use variables for `limit`, `offset`, `sortBy`

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": [
    {
      "code": "too_big",
      "maximum": 100,
      "type": "number",
      "path": ["limit"],
      "message": "Number must be less than or equal to 100"
    }
  ]
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Failed to fetch top protein foods: Database connection error"
}
```

---

## 📊 Performance Notes

- All endpoints are optimized for the 7083+ food dataset
- Category distribution computed once and cached
- Nutrient aggregations computed on-demand
- Pagination supported with configurable limits
- Sorting done in-memory for flexibility

---

## 🔄 Query Examples & Patterns

### Pagination Pattern
```bash
# First page
?limit=20&offset=0

# Second page
?limit=20&offset=20

# Third page
?limit=20&offset=40
```

### Sorting Pattern
```bash
# Descending (highest first)
?sortBy=desc

# Ascending (lowest first)
?sortBy=asc
```

### Combined Pattern
```bash
# Get 15 items, skip 30, sorted ascending
?limit=15&offset=30&sortBy=asc
```

---

## 📋 Summary

| Endpoint | Method | Purpose | Pagination |
|----------|--------|---------|-----------|
| /top-protein | GET | Ranked protein content | ✅ |
| /top-fiber | GET | Ranked fiber content | ✅ |
| /top-vitamin-c | GET | Ranked vitamin C | ✅ |
| /top-vitamin-a | GET | Ranked vitamin A | ✅ |
| /top-calcium | GET | Ranked calcium | ✅ |
| /category-distribution | GET | Foods per category | ❌ |
| /nutrient-distribution | GET | Avg nutrients/category | ❌ |
| /top-healthy-foods | GET | Health scored foods | ✅ |
| /plant-vs-animal | GET | Classification split | ❌ |
| /processing-level-distribution | GET | Processing levels | ❌ |

**All 10 endpoints ready for production! ✅**
