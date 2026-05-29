-- PostgreSQL init migration: Food (Sprints 1-4) + Auth/Profile/History (Sprints 5-7).

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE');

-- CreateTable: Food
CREATE TABLE "Food" (
    "id" SERIAL NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "nutrientDataBankNumber" BIGINT NOT NULL,
    "alphaCarotene" DOUBLE PRECISION,
    "betaCarotene" DOUBLE PRECISION,
    "betaCryptoxanthin" DOUBLE PRECISION,
    "luteinZeaxanthin" DOUBLE PRECISION,
    "lycopene" DOUBLE PRECISION,
    "retinol" DOUBLE PRECISION,
    "carbohydrate" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "totalLipid" DOUBLE PRECISION,
    "sugarTotal" DOUBLE PRECISION,
    "fiber" DOUBLE PRECISION,
    "cholesterol" DOUBLE PRECISION,
    "water" DOUBLE PRECISION,
    "choline" DOUBLE PRECISION,
    "monoFat" DOUBLE PRECISION,
    "polyFat" DOUBLE PRECISION,
    "saturatedFat" DOUBLE PRECISION,
    "calcium" DOUBLE PRECISION,
    "copper" DOUBLE PRECISION,
    "iron" DOUBLE PRECISION,
    "magnesium" DOUBLE PRECISION,
    "phosphorus" DOUBLE PRECISION,
    "potassium" DOUBLE PRECISION,
    "sodium" DOUBLE PRECISION,
    "zinc" DOUBLE PRECISION,
    "vitaminARae" DOUBLE PRECISION,
    "vitaminB12" DOUBLE PRECISION,
    "vitaminB6" DOUBLE PRECISION,
    "vitaminC" DOUBLE PRECISION,
    "vitaminE" DOUBLE PRECISION,
    "vitaminK" DOUBLE PRECISION,
    "niacin" DOUBLE PRECISION,
    "riboflavin" DOUBLE PRECISION,
    "selenium" DOUBLE PRECISION,
    "thiamin" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Food_nutrientDataBankNumber_key" ON "Food"("nutrientDataBankNumber");

-- CreateTable: User
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateTable: UserProfile
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "age" INTEGER,
    "gender" "Gender",
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "activityLevel" "ActivityLevel",
    "goal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateTable: RefreshToken
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateTable: RecommendationLog
CREATE TABLE "RecommendationLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "RecommendationLog_userId_idx" ON "RecommendationLog"("userId");
CREATE INDEX "RecommendationLog_foodId_idx" ON "RecommendationLog"("foodId");

-- CreateTable: ChatSession
CREATE TABLE "ChatSession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ChatSession_userId_idx" ON "ChatSession"("userId");

-- CreateTable: ChatMessage
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");

-- Foreign keys
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecommendationLog" ADD CONSTRAINT "RecommendationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecommendationLog" ADD CONSTRAINT "RecommendationLog_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
