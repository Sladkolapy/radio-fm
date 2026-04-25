#!/bin/bash

echo "🎵 Initializing Music Player Database..."
echo "=================================="

cd "$(dirname "$0")"

if [ ! -d "../uploads/audio" ]; then
  echo "📁 Creating uploads/audio directory..."
  mkdir -p "../uploads/audio"
fi

if [ ! -d "../uploads/covers" ]; then
  echo "📁 Creating uploads/covers directory..."
  mkdir -p "../uploads/covers"
fi

echo ""
echo "🚀 Running database initialization..."
node init.js

echo ""
echo "✅ Database initialized successfully!"