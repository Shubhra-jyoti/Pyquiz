#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "📦 Installing dependencies..."
npm install

echo "🔄 Generating Prisma Client..."
npx prisma generate

echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build script completed successfully!"
