# Food Analytics Backend API

A production-ready TypeScript/Express backend for food analytics with integrated ML modules for health classification, diet recommendations, and chatbot functionality.

## 🎯 Features

### Core Features
- ✅ Complete food database (7083 records with 38 nutrition columns)
- ✅ RESTful API with pagination support
- ✅ TypeScript with full type safety
- ✅ Prisma ORM with MySQL
- ✅ Zod validation for all DTOs
- ✅ Error handling middleware
- ✅ Clean architecture (Controller → Service → Repository)

### ML Modules (Ready for Deployment)
1. **Module 3.1: Health Classification**
   - Classifies foods as HEALTHY / NEUTRAL / UNHEALTHY
   - Provides health score and personalized explanations
   - Rule-based (ready for ML model integration)

2. **Module 3.2: Diet Type Classification**
   - Multi-label classification (10 diet types)
   - Supports: Keto, Vegan, Vegetarian, Paleo, Low Sodium, Diabetes-friendly, Muscle Gain, Weight Loss, Gluten-free, Dairy-free
   - Individual scoring for each diet type

3. **Module 3.3: Content-based Recommendations**
   - Cosine similarity-based food recommendations
   - Finds alternative foods with similar nutritional profiles
   - Configurable result limits

4. **Module 3.4: Personalized Diet Recommendations**
   - Hybrid system combining rule-based + ML scoring
   - Goal-aware recommendations (muscle gain, weight loss, energy, etc.)
   - Activity level and restriction support

### Chatbot Service
- Unified chatbot integrating all ML modules
- Natural language intent detection
- Context-aware responses
- Food name extraction from queries

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or pnpm

### Installation

```bash
# 1. Install dependencies
cd be
npm install

# 2. Create MySQL database
mysql -u root -p
mysql> CREATE DATABASE food_analytics;
mysql> EXIT;

# 3. Push Prisma schema
npx prisma db push

# 4. Seed database with food data
npm run seed

# 5. Start development server
npm run dev
```

Visit `http://localhost:5000` to verify the server is running.

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Food Management (`/foods`)

**List Foods (Paginated)**
```
GET /foods?page=1&limit=10
```
Returns: Paginated list with 7083 food records

**Get Food Details**
```
GET /foods/:id
```
Returns: Single food object with all nutrition data

**Search Foods**
```
GET /foods/search?description=chicken
```
Returns: Array of matching foods

**Create Food** (Admin)
```
POST /foods
Content-Type: application/json

{
  "description": "Grilled Chicken Breast",
  "category": "Poultry",
  "nutrientDataBankNumber": 12345,
  "protein": 31,
  "carbohydrate": 0,
  "fiber": 0,
  "totalLipid": 3.6,
  ...
}
```

#### 2. ML Modules (`/ml`)

**Module 3.1: Health Classification**
```
POST /ml/health-classification
Content-Type: application/json

{
  "foodId": 1
}

Response:
{
  "success": true,
  "data": {
    "classification": "HEALTHY",
    "score": 0.85,
    "explanation": [
      "High protein content (25g) - good for muscle building",
      "Low sugar content (1g) - won't cause blood sugar spikes"
    ],
    "recommendations": [
      "Continue enjoying this food as part of a balanced diet"
    ]
  }
}
```

**Module 3.2: Diet Classification**
```
POST /ml/diet-classification
Content-Type: application/json

{
  "foodId": 1
}

Response:
{
  "success": true,
  "data": {
    "dietTypes": [
      {
        "type": "KETO",
        "score": 0.92,
        "reason": "Low carbs and adequate fats make this suitable for keto"
      }
    ],
    "suitableDiets": ["KETO", "MUSCLEGAIN", "PALEO"],
    "unsuitableDiets": ["HIGHCARB"]
  }
}
```

**Module 3.3: Recommendations**
```
POST /ml/recommendations
Content-Type: application/json

{
  "foodId": 1,
  "limit": 5
}

Response:
{
  "success": true,
  "data": {
    "originalFood": {
      "id": 1,
      "description": "Salmon"
    },
    "recommendations": [
      {
        "id": 42,
        "description": "Tuna",
        "similarity": 0.87,
        "reason": "Very similar nutritional profile - excellent substitute"
      }
    ]
  }
}
```

**Module 3.4: Personalized Recommendations**
```
POST /ml/personalized-diet
Content-Type: application/json

{
  "goals": ["MUSCLEGAIN", "ENERGY"],
  "restrictions": ["VEGETARIAN"],
  "activityLevel": "ACTIVE",
  "limit": 10
}

Response:
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": 5,
        "description": "Chicken Breast",
        "score": 0.95,
        "matchedGoals": ["MUSCLEGAIN"],
        "matchedRestrictions": ["VEGETARIAN"],
        "explanation": [
          "Excellent protein source (31g) for building muscle"
        ]
      }
    ],
    "context": {
      "goals": ["MUSCLEGAIN", "ENERGY"],
      "restrictions": ["VEGETARIAN"],
      "activityLevel": "ACTIVE"
    }
  }
}
```

#### 3. Chatbot (`/chatbot`)

**Ask Chatbot**
```
POST /chatbot/ask
Content-Type: application/json

{
  "message": "Is salmon healthy?",
  "context": {
    "userGoals": ["MUSCLEGAIN"],
    "dietRestrictions": [],
    "activityLevel": "ACTIVE"
  }
}

Response:
{
  "success": true,
  "data": {
    "message": "🥗 **Salmon** is **HEALTHY**.\n\nHealth Score: 85/100\n\n**Key Points:**\n• High protein content (25g) - good for muscle building\n• Rich in Vitamin D (570 IU) - supports bone health\n\n**Recommendations:**\n• Continue enjoying this food as part of a balanced diet",
    "context": { ... }
  }
}
```

**Chatbot Query Examples**
- "Is chicken healthy?"
- "Is this keto-friendly?"
- "What can I use instead of salmon?"
- "What should I eat for muscle gain?"
- "Tell me about broccoli's nutrition"
- "Is this suitable for vegans?"
- "Any alternatives to eggs?"

## 📁 Project Structure

```
be/
├── prisma/
│   ├── schema.prisma              # Database schema (ALL 38 nutrition columns)
│   └── seed.ts                    # CSV seeding script
├── src/
│   ├── app.ts                     # Express app with middleware
│   ├── server.ts                  # Server entry point
│   ├── config/
│   │   └── prisma.ts              # Prisma client configuration
│   ├── dtos/                      # Data Transfer Objects + Zod validation
│   │   ├── food.dto.ts
│   │   ├── ml-health.dto.ts
│   │   ├── ml-diet.dto.ts
│   │   └── ml-recommendation.dto.ts
│   ├── middleware/
│   │   └── errorHandler.ts        # Global error handling
│   ├── repositories/
│   │   └── food.repository.ts     # Data access layer
│   ├── services/                  # Business logic
│   │   ├── food.service.ts        # Food CRUD operations
│   │   ├── ml-health.service.ts   # Module 3.1 logic
│   │   ├── ml-diet.service.ts     # Module 3.2 logic
│   │   ├── ml-recommendation.service.ts  # Module 3.3 logic
│   │   ├── ml-personalized.service.ts    # Module 3.4 logic
│   │   └── chatbot.service.ts     # Chatbot integration
│   ├── controllers/               # Route handlers
│   │   ├── food.controller.ts
│   │   ├── ml.controller.ts
│   │   └── chatbot.controller.ts
│   └── routes/                    # Express routers
│       ├── food.route.ts
│       ├── ml.route.ts
│       └── chatbot.route.ts
├── package.json
├── tsconfig.json
├── .env
├── .env.example
├── SETUP.md                       # Detailed setup guide
└── README.md                      # This file

database/
└── food.csv                       # 7083 food records with 38 nutrition columns
```

## 🛠️ Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Type checking
npx tsc --noEmit

# Prisma database push
npm run prisma:push

# Prisma database migrations
npm run prisma:migrate

# Open Prisma Studio (GUI database explorer)
npm run prisma:studio

# Seed database from CSV
npm run seed
```

## 🔐 Security Features

- ✅ Input validation with Zod schemas
- ✅ Error handling prevents information leakage
- ✅ CORS configuration
- ✅ Type-safe queries (Prisma prevents SQL injection)
- ✅ Environment variables for sensitive data
- ✅ Morgan logging for request tracking

### Security Checklist
- [ ] Update `JWT_SECRET` in production
- [ ] Change database credentials
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Implement authentication for admin endpoints
- [ ] Restrict CORS origins for production
- [ ] Enable database backups

## 📊 Performance

### Database
- 7083 food records pre-loaded
- Indexed queries on description and category
- Pagination with configurable limits (default: 10, max: 100)

### Recommendations
- Cosine similarity calculation: O(n) - scales with food count
- Caching recommended for production use
- Batch processing support for multiple queries

### Chatbot
- Intent detection via regex patterns
- Can upgrade to LLM-based intent recognition
- Context persistence across conversation

## 🚀 Deployment

### Docker (Recommended)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
PORT=5000
DATABASE_URL=mysql://prod_user:secure_pass@prod_host:3306/food_analytics
JWT_SECRET=your_secret_key_here
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

## 🧪 Testing

### Using cURL

```bash
# Health check
curl http://localhost:5000/

# Get foods
curl http://localhost:5000/api/foods?page=1&limit=5

# Health classification
curl -X POST http://localhost:5000/api/ml/health-classification \
  -H "Content-Type: application/json" \
  -d '{"foodId": 1}'

# Chatbot
curl -X POST http://localhost:5000/api/chatbot/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Is salmon healthy?"}'
```

### Using Postman

1. Import the API collection (create from endpoints above)
2. Set `base_url` = `http://localhost:5000/api`
3. Test each endpoint

## 📈 Monitoring

```bash
# View logs
tail -f logs/app.log

# Database statistics
npm run prisma:studio

# Memory usage
node --max-old-space-size=4096 dist/server.js
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Follow TypeScript best practices
3. Add Zod validation for new DTOs
4. Update tests and documentation
5. Create pull request to `main`

## 📝 License

MIT

## 📞 Support

For issues or questions:
1. Check `/SETUP.md` for setup issues
2. Review API responses for error messages
3. Enable Morgan logging for request debugging
4. Check database connection in `.env`

## 🎯 Roadmap

- [ ] Replace rule-based ML with trained models
- [ ] Add user authentication & profiles
- [ ] Implement meal planning features
- [ ] Add shopping list generation
- [ ] Integrate nutrition tracking
- [ ] Mobile app API optimization
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard

---

**Status**: Production-ready ✅ | Last Updated: 2026-05-29
