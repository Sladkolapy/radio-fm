#!/bin/bash

echo "=== PingMusic Setup Script ==="
echo ""

# Backend setup
echo "Setting up Backend..."
cd backend
npm install
cd ..

# Frontend setup
echo ""
echo "Setting up Frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Backend: cd backend && npm run dev"
echo "  2. Frontend: cd frontend && npm run dev"
echo ""