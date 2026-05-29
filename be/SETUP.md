# Food Analytics Backend - Setup Guide

## ✅ Completed: Phase 1 Review & Fixes

### Issues Fixed

1. **✅ app.ts - Middleware Order**
   - Fixed: Moved express.json() BEFORE routes
   - Impact: JSON parsing now works correctly for all endpoints

2. **✅ food.service.ts - Type Safety**
   - Fixed: Created DTOs with Zod validation
   - Impact: Full TypeScript type checking enabled

3. **✅ food.controller.ts - Error Handling**
   - Fixed: Added try-catch blocks and HTTP status codes
   - Impact: Proper error responses for clients

4. **✅ food.controller.ts - Pagination**
   - Fixed: Implemented limit/offset pagination
   - Impact: Can handle large datasets efficiently

5. **✅ Prisma Schema - All Nutrition Columns**
   - Fixed: Added ALL 38 columns from food.csv
   - Impact: ML models have complete nutritional data

6. **✅ Project Structure**
   - Added: DTOs, Repositories, Middleware, Services
   - Impact: Clean architecture implemented

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+
- npm or pnpm

### Step 1: Install Dependencies

```bash
cd be
npm install
# or
pnpm install
```

### Step 2: Configure Environment

Copy `.env` file (already configured):

```env
PORT=5000
DATABASE_URL="mysql://root:123456@localhost:3306/food_analytics"
JWT_SECRET=mysecretkey
```

**⚠️ Important**: Update credentials for production!

### Step 3: Create MySQL Database

```bash
mysql -u root -p
mysql> CREATE DATABASE food_analytics;
mysql> EXIT;
```

### Step 4: Push Prisma Schema to Database

```bash
npx prisma db push
```

### Step 5: Seed Database with Food CSV

```bash
npm run seed
```

This loads all 7083 food records from `database/food.csv`.

### Step 6: Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`

---

## 📚 API Endpoints

### 1. Food Management (`/api/foods`)

**GET /api/foods?page=1&limit=10**
- Get paginated list of foods
- Returns: Array of foods with pagination info

**GET /api/foods/:id**
- Get single food by ID
- Returns: Food object with all nutrition data

**GET /api/foods/search?description=chicken**
- Search foods by description
- Returns: Array of matching foods

**POST /api/foods**
- Create new food (admin only)
- Body: Food DTO with nutrition values
- Returns: Created food object

---

### 2. ML Modules (`/api/ml`)

#### Module 3.1: Health Classification

**POST /api/ml/health-classification**

```json
{
  "foodId": 1
  // OR provide nutrition values directly
  // "protein": 25,
  // "carbohydrate": 5,
  // "fiber": 2,
  // "totalLipid": 10,
  // "sugarTotal": 1,
  // "sodium": 100,
  // "cholesterol": 50,
  // "vitaminC": 5,
  // "iron": 2,
  // "calcium": 50
}
```

Returns:
```json
{
  "classification": "HEALTHY",
  "score": 0.85,
  "explanation": ["High protein", "Low sugar"],
  "recommendations": ["Continue enjoying..."]
}
```

---

#### Module 3.2: Diet Type Classification

**POST /api/ml/diet-classification**

```json
{
  "foodId": 1
}
```

Returns:
```json
{
  "dietTypes": [
    {
      "type": "KETO",
      "score": 0.92,
      "reason": "Low carbs and adequate fats..."
    }
  ],
  "suitableDiets": ["KETO", "MUSCLEGAIN"],
  "unsuitableDiets": ["HIGHCARB"]
}
```

---

#### Module 3.3: Content-based Recommendations

**POST /api/ml/recommendations**

```json
{
  "foodId": 1,
  "limit": 5
}
```

Returns:
```json
{
  "originalFood": {
    "id": 1,
    "description": "Salmon"
  },
  "recommendations": [
    {
      "id": 42,
      "description": "Tuna",
      "similarity": 0.87,
      "reason": "Very similar nutritional profile"
    }
  ]
}
```

---

#### Module 3.4: Personalized Diet Recommendation

**POST /api/ml/personalized-diet**

```json
{
  "goals": ["MUSCLEGAIN", "ENERGY"],
  "restrictions": ["VEGETARIAN"],
  "activityLevel": "ACTIVE",
  "limit": 10
}
```

Returns:
```json
{
  "recommendations": [
    {
      "id": 5,
      "description": "Chicken Breast",
      "score": 0.95,
      "matchedGoals": ["MUSCLEGAIN"],
      "explanation": ["Excellent protein source..."]
    }
  ],
  "context": {
    "goals": ["MUSCLEGAIN"],
    "restrictions": []
  }
}
```

---

### 3. Chatbot Integration (`/api/chatbot`)

**POST /api/chatbot/ask**

```json
{
  "message": "Is salmon healthy?",
  "context": {
    "userGoals": ["MUSCLEGAIN"],
    "dietRestrictions": [],
    "activityLevel": "ACTIVE"
  }
}
```

Returns:
```json
{
  "success": true,
  "data": {
    "message": "🥗 **Salmon** is **HEALTHY**...",
    "context": { ... }
  }
}
```

Chatbot examples:
- "Is chicken healthy?"
- "Is this keto-friendly?"
- "What can I use instead of salmon?"
- "What should I eat for muscle gain?"
- "Tell me about broccoli's nutrition"

---

## 📁 Project Structure

```
be/
├── prisma/
│   ├── schema.prisma          (Database schema - ALL 38 nutrition columns)
│   └── seed.ts                (CSV seeding script)
├── src/
│   ├── app.ts                 (Express app setup - FIXED middleware order)
│   ├── server.ts              (Server entry point)
│   ├── config/
│   │   └── prisma.ts          (Prisma client)
│   ├── dtos/                  (Data Transfer Objects with Zod validation)
│   │   ├── food.dto.ts
│   │   ├── ml-health.dto.ts
│   │   ├── ml-diet.dto.ts
│   │   └── ml-recommendation.dto.ts
│   ├── middleware/
│   │   └── errorHandler.ts    (Error handling & async handler)
│   ├── repositories/
│   │   └── food.repository.ts (Data access layer)
│   ├── services/              (Business logic)
│   │   ├── food.service.ts
│   │   ├── ml-health.service.ts    (Module 3.1)
│   │   ├── ml-diet.service.ts      (Module 3.2)
│   │   ├── ml-recommendation.service.ts (Module 3.3)
│   │   ├── ml-personalized.service.ts   (Module 3.4)
│   │   └── chatbot.service.ts       (Chatbot integration)
│   ├── controllers/           (Route handlers)
│   │   ├── food.controller.ts
│   │   ├── ml.controller.ts
│   │   └── chatbot.controller.ts
│   └── routes/                (Express routers)
│       ├── food.route.ts
│       ├── ml.route.ts
│       └── chatbot.route.ts
├── package.json
├── tsconfig.json
├── .env
└── .env.example

database/
└── food.csv                   (7083 food records with 38 columns)
```

---

## 🧪 Testing Endpoints

### Using cURL

```bash
# Get foods
curl http://localhost:5000/api/foods?page=1&limit=10

# Classify health
curl -X POST http://localhost:5000/api/ml/health-classification \
  -H "Content-Type: application/json" \
  -d '{"foodId": 1}'

# Get recommendations
curl -X POST http://localhost:5000/api/ml/recommendations \
  -H "Content-Type: application/json" \
  -d '{"foodId": 1, "limit": 5}'

# Chat with bot
curl -X POST http://localhost:5000/api/chatbot/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Is salmon healthy?"}'
```

### Using Postman

1. Import collection from `/be/postman/collection.json` (create if needed)
2. Configure environment with `BASE_URL=http://localhost:5000`
3. Test each endpoint

---

## 🔄 Development Commands

```bash
# Development server with hot reload
npm run dev

# Type check
npx tsc --noEmit

# Build for production
npm run build

# Start production build
npm start

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run seed
```

---

## 🚨 Troubleshooting

### Database Connection Issues

```bash
# Check MySQL is running
mysql -u root -p

# Verify DATABASE_URL in .env
# mysql://username:password@localhost:3306/food_analytics

# Recreate database if needed
mysql> DROP DATABASE food_analytics;
mysql> CREATE DATABASE food_analytics;
```

### Seed Script Issues

```bash
# If seed fails, ensure CSV exists
ls -la database/food.csv

# Run with verbose output
npm run seed -- --debug
```

### Port Already in Use

```bash
# Change PORT in .env
PORT=5001

# Or kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

---

## 📊 Performance Tips

1. **Pagination**: Always use pagination for large datasets
   - Default: 10 items per page
   - Max: 100 items per page

2. **Caching**: Recommendation queries can be cached
   - Similar foods don't change often
   - Cache for 24 hours minimum

3. **Database Indexing**: Add indexes for common queries
   ```prisma
   description  String? @db.VarChar(255) @index
   category     String? @index
   ```

4. **Compression**: Enable gzip in production
   ```typescript
   app.use(compression());
   ```

---

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` in production
- [ ] Update database credentials
- [ ] Enable HTTPS
- [ ] Add rate limiting middleware
- [ ] Implement authentication for admin endpoints
- [ ] Validate all inputs (already done with Zod)
- [ ] Add CORS restrictions for production
- [ ] Use environment variables for all secrets

---

## 📝 Notes

- All nutrition data is mapped from the 38 columns in food.csv
- ML modules use rule-based scoring (can be replaced with trained ML models)
- Chatbot uses NLP pattern matching (can be upgraded to LLM)
- Database has 7083 food records ready for analytics

---

## 🤝 Support

For issues or questions, check:
- `/PROGRESS.md` - Development progress
- Database schema in `/prisma/schema.prisma`
- API DTOs in `/src/dtos/`
