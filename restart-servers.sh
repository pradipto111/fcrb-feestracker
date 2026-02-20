#!/bin/bash

echo "🔄 Restarting Backend and Frontend..."
echo "====================================="
echo ""

# Stop existing servers
echo "⏹️  Stopping existing servers..."
lsof -ti:4000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 2
echo "✅ Servers stopped"
echo ""

# Start backend
echo "🚀 Starting backend..."
cd "$(dirname "$0")/backend"
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
echo ""

# Wait for backend
echo "⏳ Waiting for backend to be ready..."
sleep 5
echo ""

# Start frontend
echo "🚀 Starting frontend..."
cd "$(dirname "$0")/frontend"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo ""

echo "🎉 Both servers are starting!"
echo "=============================="
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:4000"
echo ""
echo "📄 Logs:"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo "🔐 Login as Admin:"
echo "   Email: admin@fcrb.com"
echo "   Password: 20fc24rb!"
echo ""
echo "✨ New Features:"
echo "   - Admin can create centers (Admin → Centers tab)"
echo "   - Admin can add students with payment frequency"
echo "   - Student login feature"
echo "   - 2 academies, 5 students with realistic data"
echo ""


