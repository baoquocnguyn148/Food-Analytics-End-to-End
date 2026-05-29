# NutriHub — Nền Tảng Phân Tích Dinh Dưỡng

Ứng dụng phân tích dinh dưỡng full-stack với cơ sở dữ liệu hơn 7.000 thực phẩm, bốn module ML, trợ lý hội thoại AI và dashboard Next.js hiện đại.

---

## Mục Lục

- [Tổng Quan](#tổng-quan)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
- [Biến Môi Trường](#biến-môi-trường)
- [Thiết Lập Cơ Sở Dữ Liệu](#thiết-lập-cơ-sở-dữ-liệu)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Tài Liệu API](#tài-liệu-api)
- [Các Module ML](#các-module-ml)
- [Danh Sách Scripts](#danh-sách-scripts)
- [Triển Khai](#triển-khai)

---

## Tổng Quan

NutriHub cung cấp toàn bộ pipeline từ dữ liệu CSV thô đến trải nghiệm dinh dưỡng cá nhân hoá tương tác:

- **Danh Mục Thực Phẩm** — tìm kiếm và duyệt 7.083 thực phẩm với 38 thuộc tính dinh dưỡng
- **Dashboard Phân Tích** — biểu đồ phân phối danh mục, xếp hạng dưỡng chất, phân tích macro
- **Phân Tích ML** — phân loại sức khoẻ, tương thích chế độ ăn, gợi ý thực phẩm tương tự và đề xuất cá nhân hoá
- **Trợ Lý Hội Thoại (NutriBot)** — chatbot tích hợp cả bốn module ML, hỗ trợ cả tiếng Anh lẫn tiếng Việt
- **Tài Khoản Người Dùng** — xác thực JWT với refresh-token rotation, quản lý hồ sơ và lịch sử hoạt động

---

## Công Nghệ Sử Dụng

| Tầng | Công nghệ | Phiên bản |
|---|---|---|
| Backend runtime | Node.js | 18+ |
| Backend framework | Express | 5.x |
| Ngôn ngữ | TypeScript | 6.x (BE) / 5.x (FE) |
| ORM | Prisma | 6.x |
| Cơ sở dữ liệu | PostgreSQL | 14+ |
| Frontend framework | Next.js (App Router) | 15.x |
| Thư viện UI | React | 19 |
| Styling | Tailwind CSS | 4.x |
| Thành phần UI | Radix UI + shadcn/ui | latest |
| Validation | Zod | 4.x |
| Cache | Redis (tuỳ chọn) | 7.x |
| Tài liệu API | Swagger UI | 5.x |

---

## Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────┐
│                    Next.js (fe/)                    │
│  Trang: Foods · Analytics · Chat · Profile · Auth   │
│  State: Auth context · Token store (localStorage)   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼──────────────────────────────┐
│                   Express (be/)                     │
│  Middleware: Helmet · CORS · Rate-limit · Sanitize  │
│  Routes: Auth · Food · ML · Chatbot · Analytics     │
│          Profile · History · Health · Metrics       │
└────────────┬──────────────────────────┬─────────────┘
             │                          │
    ┌────────▼───────┐        ┌─────────▼────────┐
    │   PostgreSQL   │        │  Redis (tuỳ chọn) │
    │  qua Prisma    │        │  Cache response   │
    └────────────────┘        └──────────────────┘
```

**Backend** tuân theo kiến trúc phân tầng nghiêm ngặt: Controller → Service → Repository. Logic ML nằm trong các service riêng biệt, được gọi từ cả REST endpoint lẫn chatbot service.

---

## Yêu Cầu Hệ Thống

- Node.js 18 trở lên
- PostgreSQL 14 trở lên
- (Tuỳ chọn) Redis 7 — ứng dụng hoạt động bình thường nếu không có Redis (`REDIS_ENABLED=false`)
- npm hoặc pnpm

---

## Hướng Dẫn Cài Đặt

### 1. Clone và cài đặt dependencies

```bash
git clone <repo-url>
cd Food-Analytics-End-to-End

# Backend
cd be && npm install

# Frontend
cd ../fe && npm install
```

### 2. Cấu hình biến môi trường

```bash
# Backend
cp be/.env.example be/.env
# Chỉnh sửa be/.env — xem mục Biến Môi Trường bên dưới

# Frontend
cp fe/.env.example fe/.env.local
# Chỉnh sửa fe/.env.local
```

### 3. Thiết lập cơ sở dữ liệu

```bash
cd be

# Chạy migration
npx prisma migrate dev --name init

# Tạo Prisma client
npx prisma generate

# Nhập 7.083 thực phẩm từ database/food.csv
npm run seed
```

### 4. Chạy môi trường development

```bash
# Terminal 1 — backend (cổng 5000)
cd be && npm run dev

# Terminal 2 — frontend (cổng 3000)
cd fe && npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).  
Tài liệu Swagger: [http://localhost:5000/swagger](http://localhost:5000/swagger)

---

## Biến Môi Trường

### Backend — `be/.env`

```env
# Máy chủ
NODE_ENV=development
PORT=5000

# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/food_analytics"

# JWT — dùng chuỗi ngẫu nhiên dài trong môi trường production
JWT_SECRET=thay-doi-trong-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=thay-doi-trong-production-2
JWT_REFRESH_EXPIRES_IN=7d

# CORS — nhiều origin cách nhau bằng dấu phẩy
CORS_ORIGIN=http://localhost:3000

# Redis cache (đặt false để tắt)
REDIS_ENABLED=false
REDIS_URL=redis://localhost:6379
CACHE_TTL=300

# Logging
LOG_LEVEL=info
LOG_DIR=logs
```

### Frontend — `fe/.env.local`

```env
# Phải trỏ đến địa chỉ backend mà trình duyệt có thể truy cập
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_TELEMETRY_DISABLED=1
```

> **Truy cập mạng nội bộ:** Nếu frontend được truy cập qua địa chỉ IP mạng LAN (ví dụ: `192.168.x.x:3000`), hãy đặt `NEXT_PUBLIC_API_URL` thành địa chỉ IP và cổng của backend, đồng thời thêm origin đó vào `CORS_ORIGIN` trong `be/.env`.

---

## Thiết Lập Cơ Sở Dữ Liệu

Schema Prisma nằm tại [be/prisma/schema.prisma](be/prisma/schema.prisma).

### Các Model

| Model | Mô tả |
|---|---|
| `User` | Thông tin xác thực và vai trò (`USER` / `ADMIN`) |
| `UserProfile` | Tuổi, giới tính, cân nặng, chiều cao, mức độ hoạt động, mục tiêu |
| `RefreshToken` | Refresh token đã được hash (có thể xoay vòng và thu hồi) |
| `Food` | 38 cột dinh dưỡng + khoá duy nhất `nutrientDataBankNumber` |
| `RecommendationLog` | Ghi lại mỗi lần gợi ý thực phẩm kèm điểm số |
| `ChatSession` | Nhóm các tin nhắn hội thoại theo người dùng |
| `ChatMessage` | Từng lượt hội thoại trong session |

### Migration

```bash
cd be

# Development — tạo file migration và áp dụng ngay
npx prisma migrate dev --name <mô-tả>

# Production — chỉ áp dụng migration đã có sẵn
npx prisma migrate deploy

# Xem và chỉnh sửa dữ liệu trực tiếp
npx prisma studio
```

### Seed Dữ Liệu

Script seed đọc file `database/food.csv` (7.083 bản ghi, 38 cột) và nhập hàng loạt vào bảng `Food`.

```bash
cd be && npm run seed
```

---

## Cấu Trúc Dự Án

```
Food-Analytics-End-to-End/
├── database/
│   └── food.csv                   # 7.083 thực phẩm (38 cột dinh dưỡng)
│
├── be/                            # Express backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── analytics/             # Module tính năng Analytics
│   │   │   ├── controllers/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   ├── auth/                  # Module tính năng Auth
│   │   │   ├── controllers/
│   │   │   ├── dtos/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   ├── history/               # Lịch sử gợi ý & hội thoại
│   │   ├── profile/               # Quản lý hồ sơ người dùng
│   │   ├── health/                # Endpoint kiểm tra tình trạng
│   │   ├── monitoring/            # Prometheus metrics
│   │   ├── controllers/           # Controller dùng chung (food, ml, chatbot)
│   │   ├── services/
│   │   │   ├── food.service.ts
│   │   │   ├── chatbot.service.ts
│   │   │   ├── ml-health.service.ts
│   │   │   ├── ml-diet.service.ts
│   │   │   ├── ml-recommendation.service.ts
│   │   │   └── ml-personalized.service.ts
│   │   ├── repositories/
│   │   │   └── food.repository.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── cacheMiddleware.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── sanitize.ts
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── logger.ts
│   │   │   ├── prisma.ts
│   │   │   └── swagger.ts
│   │   ├── dtos/                  # Zod validation schemas
│   │   ├── types/
│   │   │   └── express.d.ts       # Mở rộng Express Request (req.user)
│   │   └── app.ts                 # Khởi tạo Express app
│   ├── server.ts                  # Điểm vào ứng dụng
│   ├── tsconfig.json
│   └── package.json
│
└── fe/                            # Next.js frontend
    ├── app/
    │   ├── layout.tsx             # Layout gốc (providers)
    │   ├── page.tsx               # Trang chủ
    │   ├── foods/
    │   │   ├── page.tsx           # Danh mục & tìm kiếm thực phẩm
    │   │   └── [id]/page.tsx      # Chi tiết thực phẩm
    │   ├── analytics/page.tsx     # Dashboard phân tích
    │   ├── chat/page.tsx          # Giao diện chatbot NutriBot
    │   ├── recommend/page.tsx     # Gợi ý cá nhân hoá
    │   ├── history/page.tsx       # Lịch sử gợi ý & hội thoại
    │   ├── profile/page.tsx       # Hồ sơ người dùng
    │   ├── login/page.tsx
    │   └── register/page.tsx
    ├── components/
    │   ├── ui/                    # Thành phần shadcn/ui
    │   ├── food-card.tsx
    │   └── nav-bar.tsx
    ├── lib/
    │   ├── api.ts                 # Client HTTP có kiểu dữ liệu (tất cả endpoint)
    │   ├── auth-context.tsx       # Trạng thái auth + xác minh token
    │   ├── token-store.ts         # Wrapper localStorage
    │   └── types.ts               # Kiểu TypeScript dùng chung
    ├── next.config.mjs
    ├── tsconfig.json
    └── package.json
```

---

## Tài Liệu API

Tất cả endpoint đều có tiền tố là host `NEXT_PUBLIC_API_URL`. Tài liệu tương tác có tại `/swagger`.

### Xác Thực

| Phương thức | Đường dẫn | Xác thực | Mô tả |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Tạo tài khoản |
| `POST` | `/api/auth/login` | — | Đăng nhập, nhận access + refresh token |
| `POST` | `/api/auth/refresh` | — | Làm mới access token bằng refresh token |
| `POST` | `/api/auth/logout` | — | Thu hồi refresh token |
| `GET` | `/api/auth/me` | Bearer | Lấy thông tin người dùng hiện tại |

### Thực Phẩm

| Phương thức | Đường dẫn | Xác thực | Mô tả |
|---|---|---|---|
| `GET` | `/api/foods` | — | Danh sách phân trang (`?page=1&limit=12`) |
| `GET` | `/api/foods/search` | — | Tìm kiếm theo tên (`?description=chicken`) |
| `GET` | `/api/foods/:id` | — | Chi tiết một thực phẩm với đầy đủ dữ liệu dinh dưỡng |
| `POST` | `/api/foods` | — | Tạo bản ghi thực phẩm mới |

### Các Module ML

| Phương thức | Đường dẫn | Xác thực | Mô tả |
|---|---|---|---|
| `POST` | `/api/ml/health-classification` | — | Kết quả HEALTHY / NEUTRAL / UNHEALTHY |
| `POST` | `/api/ml/diet-classification` | — | Điểm tương thích đa nhãn chế độ ăn |
| `POST` | `/api/ml/recommendations` | — | Thực phẩm tương tự dựa trên nội dung |
| `POST` | `/api/ml/personalized-diet` | — | Gợi ý xếp hạng theo mục tiêu |

**Ví dụ request:**

```jsonc
// health-classification
{ "foodId": 42 }

// diet-classification
{ "foodId": 42 }

// recommendations
{ "foodId": 42, "limit": 5 }

// personalized-diet
{
  "goals": ["MUSCLEGAIN", "GENERAL_HEALTH"],
  "restrictions": ["LOWSODIUM"],
  "activityLevel": "ACTIVE",
  "limit": 8
}
```

### Chatbot

| Phương thức | Đường dẫn | Xác thực | Mô tả |
|---|---|---|---|
| `POST` | `/api/chatbot/ask` | — | Gửi tin nhắn, nhận phản hồi nhận thức ngữ cảnh |

```jsonc
// Request
{
  "message": "Is salmon healthy?",
  "context": {
    "lastFoodId": 123,
    "conversationHistory": [
      { "role": "user", "content": "Tell me about salmon" },
      { "role": "assistant", "content": "..." }
    ]
  }
}

// Response
{
  "success": true,
  "data": {
    "message": "🟢 **Salmon** — HEALTHY (78/100)\n\n...",
    "context": { "lastFoodId": 123, "lastFoodName": "salmon", ... }
  }
}
```

### Analytics

Tất cả endpoint analytics đều là `GET`, công khai và được cache Redis khi bật Redis.

| Đường dẫn | Mô tả |
|---|---|
| `/api/analytics/category-distribution` | Số lượng thực phẩm theo danh mục |
| `/api/analytics/top-protein` | Thực phẩm giàu protein nhất (`?limit=10`) |
| `/api/analytics/top-fiber` | Thực phẩm giàu chất xơ nhất |
| `/api/analytics/top-vitamin-c` | Thực phẩm giàu vitamin C nhất |
| `/api/analytics/top-healthy-foods` | Thực phẩm có điểm sức khoẻ cao nhất |

### Hồ Sơ & Lịch Sử

| Phương thức | Đường dẫn | Xác thực | Mô tả |
|---|---|---|---|
| `GET` | `/api/profile` | Bearer | Lấy hồ sơ người dùng |
| `PUT` | `/api/profile` | Bearer | Tạo hoặc cập nhật hồ sơ |
| `GET` | `/api/recommendations/history` | Bearer | Lịch sử gợi ý phân trang |
| `GET` | `/api/chat/history` | Bearer | Danh sách phiên hội thoại phân trang |
| `GET` | `/api/chat/history/:id` | Bearer | Một phiên hội thoại với toàn bộ tin nhắn |

### Kiểm Tra Hệ Thống & Giám Sát

| Đường dẫn | Mô tả |
|---|---|
| `GET /health` | Kiểm tra ứng dụng đang chạy |
| `GET /health/db` | Kiểm tra kết nối cơ sở dữ liệu |
| `GET /health/redis` | Kiểm tra kết nối Redis |
| `GET /metrics` | Metrics định dạng Prometheus |

---

## Các Module ML

Tất cả module đều là TypeScript service thuần tuý với thuật toán rule-based. Được thiết kế để có thể thay thế bằng model đã huấn luyện (XGBoost, Random Forest hoặc Transformer) mà không cần thay đổi interface.

### Module 3.1 — Phân Loại Sức Khoẻ

Phân loại thực phẩm thành `HEALTHY`, `NEUTRAL` hoặc `UNHEALTHY` dựa trên điểm dinh dưỡng có trọng số (0–100). Trả về giải thích và các khuyến nghị thực tế.

**Các yếu tố tính điểm:** protein (+), chất xơ (+), vitamin C (+), canxi (+), sắt (+), đường (−), natri (−), tổng chất béo (−), cholesterol (−).

### Module 3.2 — Phân Loại Chế Độ Ăn

Chấm điểm đa nhãn cho 10 loại chế độ ăn:

`KETO` · `VEGAN` · `VEGETARIAN` · `PALEO` · `LOWSODIUM` · `DIABETICFRIENDLY` · `MUSCLEGAIN` · `WEIGHTLOSS` · `GLUTENFREE` · `DAIRYFREE`

Mỗi loại trả về điểm số (0–1) và lý do dễ đọc.

### Module 3.3 — Gợi Ý Dựa Trên Nội Dung

Tìm thực phẩm có dinh dưỡng tương tự bằng **cosine similarity** trên vector dinh dưỡng 15 chiều (protein, carbs, chất béo, chất xơ, đường, canxi, sắt, natri, vitamin C, vitamin A, B12, cholesterol, nước, kẽm, phốt pho).

### Module 3.4 — Gợi Ý Chế Độ Ăn Cá Nhân Hoá

Kết hợp tính điểm theo mục tiêu với các hạn chế chế độ ăn tuỳ chọn để xếp hạng toàn bộ thực phẩm và trả về top-N phù hợp nhất.

**Mục tiêu:** `MUSCLEGAIN` · `WEIGHTLOSS` · `ENERGY` · `ENDURANCE` · `RECOVERY` · `GENERAL_HEALTH`  
**Hạn chế:** bất kỳ trong 10 loại chế độ ăn từ Module 3.2  
**Mức độ hoạt động:** `SEDENTARY` · `LIGHT` · `MODERATE` · `ACTIVE` · `VERY_ACTIVE`

### Chatbot — NutriBot

Tầng hội thoại định tuyến câu hỏi người dùng đến module ML phù hợp dựa trên nhận diện ý định. Hỗ trợ tiếng Anh và tiếng Việt — tự động phát hiện ngôn ngữ và trả lời cùng ngôn ngữ đó.

| Ý định | Ví dụ câu hỏi |
|---|---|
| Kiểm tra sức khoẻ | `"Is chicken healthy?"` / `"salmon có tốt không?"` |
| Tương thích chế độ ăn | `"Is beef keto-friendly?"` / `"broccoli phù hợp vegan không?"` |
| Tìm thay thế | `"What can I use instead of salmon?"` / `"thay thế cho egg là gì?"` |
| Thông tin dinh dưỡng | `"Tell me about broccoli"` / `"dinh dưỡng của tuna?"` |
| Gợi ý cá nhân | `"I want to build muscle, what should I eat?"` / `"tôi muốn giảm cân, nên ăn gì?"` |

**Bộ nhớ ngữ cảnh:** mỗi phản hồi trả về object `context` đã cập nhật. Gửi lại trong request tiếp theo và NutriBot sẽ nhớ thực phẩm vừa thảo luận — cho phép hỏi tiếp như `"Nó có phù hợp keto không?"` mà không cần nhắc lại tên thực phẩm.

---

## Danh Sách Scripts

### Backend (`be/`)

```bash
npm run dev               # ts-node-dev với hot reload
npm run build             # prisma generate + tsc
npm start                 # chạy file đã biên dịch dist/server.js

npm run seed              # nhập food.csv vào PostgreSQL

npx prisma migrate dev    # tạo và áp dụng migration
npx prisma migrate deploy # áp dụng migration (CI/production)
npx prisma generate       # tái tạo Prisma client
npx prisma studio         # mở Prisma Studio (giao diện GUI)

npm test                  # chạy bộ kiểm thử Jest
```

### Frontend (`fe/`)

```bash
npm run dev               # máy chủ dev Next.js (cổng 3000)
npm run build             # build production
npm start                 # phục vụ bản build production
npm run lint              # ESLint
```

---

## Triển Khai

### Backend

```bash
cd be
npm run build             # xuất ra thư mục dist/
npm start                 # NODE_ENV=production node dist/server.js
```

Các thay đổi bắt buộc cho production:
- Đặt `NODE_ENV=production`
- Dùng giá trị dài, ngẫu nhiên và độc nhất cho `JWT_SECRET` và `JWT_REFRESH_SECRET`
- Đặt `REDIS_ENABLED=true` và cung cấp `REDIS_URL`
- Chạy `npx prisma migrate deploy` (không dùng `migrate dev`) trên cơ sở dữ liệu production

### Frontend

```bash
cd fe
npm run build
npm start                 # phục vụ trên cổng 3000
```

Đặt `NEXT_PUBLIC_API_URL` thành URL backend production **trước khi** build. Giá trị này được nhúng tĩnh vào lúc build.

### Docker (tuỳ chọn)

```bash
# từ thư mục gốc dự án
npm run docker:up         # build image và khởi động container
npm run docker:down       # dừng container
```

---

## Đóng Góp

1. Tạo branch từ `main` — dùng tiền tố `feat/`, `fix/` hoặc `chore/`
2. Giữ riêng các commit thay đổi backend và frontend
3. Chạy `npx prisma generate` sau mọi thay đổi schema
4. Đảm bảo `npm run build` thành công ở cả `be/` và `fe/` trước khi mở PR
