#!/bin/bash

# Football Academy Fees Tracker - Installation and Run Script
# This script will install dependencies and start both backend and frontend

set -e  # Exit on error

echo "🚀 Football Academy Fees Tracker - Installation Script"
echo "======================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo ""
    echo "Please install Node.js (v18 or higher) from:"
    echo "  - macOS: brew install node"
    echo "  - Or download from: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL:"
    echo "  - macOS: brew install postgresql"
    echo "  - Or download from: https://www.postgresql.org/"
    echo ""
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

print_success "Node.js $NODE_VERSION installed"
print_success "npm $NPM_VERSION installed"
echo ""

# Navigate to project root
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)

echo "📦 Installing Backend Dependencies..."
echo "======================================"
cd "$PROJECT_ROOT/backend"

if [ ! -f "package.json" ]; then
    print_error "Backend package.json not found!"
    exit 1
fi

npm install
print_success "Backend dependencies installed"
echo ""

echo "📦 Installing Frontend Dependencies..."
echo "======================================="
cd "$PROJECT_ROOT/frontend"

if [ ! -f "package.json" ]; then
    print_error "Frontend package.json not found!"
    exit 1
fi

npm install
print_success "Frontend dependencies installed"
echo ""

echo "🗄️  Database Setup Instructions"
echo "================================"
print_info "Before running the application, you need to:"
echo ""
echo "1. Create PostgreSQL database:"
echo "   psql -U postgres -c \"CREATE DATABASE fees_tracker;\""
echo ""
echo "2. Configure backend/.env file with your database URL"
echo ""
echo "3. Run database migrations:"
echo "   cd backend && npx prisma migrate dev --name init"
echo ""
echo "4. Generate Prisma client:"
echo "   cd backend && npx prisma generate"
echo ""
echo "5. Seed the database with sample data:"
echo "   cd backend && npm run prisma:seed"
echo ""
print_warning "These steps require PostgreSQL to be running!"
echo ""

echo "🎉 Installation Complete!"
echo "========================="
echo ""
echo "To run the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "Login credentials:"
echo "  Admin: admin@feestrack.com / admin123"
echo "  Coach: rajesh@feestrack.com / coach123"
echo ""
print_success "Ready to start! 🚀"

