# Prisma Client Update Instructions

## Issue
The Prisma client needs to be regenerated after updating the schema to include the new `PostReview` model.

## Solution

### Step 1: Stop the Backend Server
If your backend server is running, stop it first:
- Press `Ctrl+C` in the terminal where the server is running
- Or close the terminal/process

### Step 2: Regenerate Prisma Client
Run one of these commands in the `Backend` directory:

**Option A (Recommended):**
```bash
cd Backend
npx prisma generate
```

**Option B (If Option A fails):**
```bash
cd Backend
npm run prisma:generate
```

**Option C (Manual cleanup):**
```bash
cd Backend
rm -rf node_modules/.prisma
npx prisma generate
```

### Step 3: Restart the Backend Server
```bash
cd Backend
npm run dev
```

## What Changed

The database schema has been updated:
- ✅ `PostLike` table → `PostReview` table
- ✅ `Post.likes` → `Post.averageRating`
- ✅ `Post.comments` → `Post.totalReviews`
- ✅ Added `PostReview.rating` (1-5 stars)
- ✅ Added `PostReview.review` (optional text)

## Verification

After regenerating, you should be able to:
1. Rate posts with 1-5 stars
2. Write optional reviews
3. See average ratings on posts
4. View total review counts

## Troubleshooting

### Error: "Cannot read properties of undefined (reading 'findUnique')"
This means the Prisma client hasn't been regenerated yet. Follow steps above.

### Error: "EPERM: operation not permitted"
The backend server is still running. Stop it completely and try again.

### Error: "Prisma schema not found"
Make sure you're in the `Backend` directory when running commands.

## Alternative: Database Reset (⚠️ Will lose data)

If you want to start fresh:
```bash
cd Backend
npx prisma migrate reset
npx prisma generate
```

This will:
- Drop all tables
- Run all migrations
- Regenerate Prisma client
- ⚠️ **Delete all data**
