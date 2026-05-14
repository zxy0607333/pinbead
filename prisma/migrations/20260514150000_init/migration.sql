-- CreateEnum
CREATE TYPE "admin_role" AS ENUM ('ADMIN');

-- CreateEnum
CREATE TYPE "content_status" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "pattern_difficulty" AS ENUM ('beginner', 'easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "pattern_source_type" AS ENUM ('original', 'ai_assisted', 'public_domain', 'licensed', 'user_submission');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "admin_role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patterns" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "categoryId" TEXT,
    "difficulty" "pattern_difficulty" NOT NULL DEFAULT 'beginner',
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "colorCount" INTEGER NOT NULL DEFAULT 0,
    "beadCount" INTEGER NOT NULL DEFAULT 0,
    "paletteId" TEXT NOT NULL,
    "cellsJson" JSONB NOT NULL,
    "previewImageUrl" TEXT,
    "downloadImageUrl" TEXT,
    "sourceType" "pattern_source_type" NOT NULL DEFAULT 'original',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guides" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_status_sortOrder_idx" ON "categories"("status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "patterns_slug_key" ON "patterns"("slug");

-- CreateIndex
CREATE INDEX "patterns_status_publishedAt_idx" ON "patterns"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "patterns_categoryId_status_idx" ON "patterns"("categoryId", "status");

-- CreateIndex
CREATE INDEX "patterns_difficulty_idx" ON "patterns"("difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "guides_slug_key" ON "guides"("slug");

-- CreateIndex
CREATE INDEX "guides_status_publishedAt_idx" ON "guides"("status", "publishedAt");

-- AddForeignKey
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
