#!/bin/bash

# Football Academy Fees Tracker - macOS Setup Script
# This script will set up everything for macOS

set -e  # Exit on error

echo "🍎 Football Academy Fees Tracker - macOS Setup"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Get current directory
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)

echo "📍 Project root: $PROJECT_ROOT"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."
echo "=============================="

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Install with: brew install node"
    exit 1
fi
print_success "Node.js $(node --version) installed"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi
print_success "npm $(npm --version) installed"

if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed!"
    echo "Install with: brew install postgresql"
    exit 1
fi
print_success "PostgreSQL $(psql --version | awk '{print $3}') installed"

echo ""

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL status..."
if ! brew services list | grep -q "postgresql.*started"; then
    print_warning "PostgreSQL is not running. Starting it..."
    brew services start postgresql
    sleep 3
    print_success "PostgreSQL started"
else
    print_success "PostgreSQL is running"
fi
echo ""

# Create database
echo "🗄️  Setting up database..."
echo "============================"

# Drop database if exists (for clean setup)
print_info "Dropping existing database (if any)..."
psql -d postgres -c "DROP DATABASE IF EXISTS fees_tracker;" 2>/dev/null || true

print_info "Creating database..."
if psql -d postgres -c "CREATE DATABASE fees_tracker;" 2>/dev/null; then
    print_success "Database 'fees_tracker' created"
else
    print_error "Failed to create database"
    exit 1
fi
echo ""

# Create backend .env file
echo "⚙️  Configuring backend..."
echo "=========================="
print_info "Creating .env file..."

cat > "$PROJECT_ROOT/backend/.env" << 'EOF'
DATABASE_URL="postgresql://pradiptom@localhost:5432/fees_tracker"
JWT_SECRET="supersecretjwtkey_change_this_in_production"
PORT=4000
EOF

print_success "Backend .env file created"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
echo "======================================"
cd "$PROJECT_ROOT/backend"

if [ ! -d "node_modules" ]; then
    npm install
    print_success "Backend dependencies installed"
else
    print_info "Backend dependencies already installed"
fi
echo ""

# Run Prisma migrations
echo "🗄️  Running database migrations..."
echo "===================================="
print_info "Creating database tables..."
npx prisma migrate dev --name init
print_success "Database migrations completed"
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
echo "==============================="
npx prisma generate
print_success "Prisma Client generated"
echo ""

# Seed database
echo "🌱 Seeding database with sample data..."
echo "========================================"
npm run prisma:seed
print_success "Database seeded successfully"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
echo "======================================="
cd "$PROJECT_ROOT/frontend"

if [ ! -d "node_modules" ]; then
    npm install
    print_success "Frontend dependencies installed"
else
    print_info "Frontend dependencies already installed"
fi
echo ""

# Verification
echo "✅ Verifying setup..."
echo "====================="

# Check database
if psql -d fees_tracker -c "\dt" | grep -q "Student"; then
    print_success "Database tables created"
else
    print_error "Database tables not found"
    exit 1
fi

# Check if sample data exists
STUDENT_COUNT=$(psql -d fees_tracker -t -c "SELECT COUNT(*) FROM \"Student\";" | xargs)
if [ "$STUDENT_COUNT" -eq 8 ]; then
    print_success "Sample data loaded ($STUDENT_COUNT students)"
else
    print_warning "Expected 8 students, found $STUDENT_COUNT"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "To run the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd $PROJECT_ROOT/backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd $PROJECT_ROOT/frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "Login credentials:"
echo "  Admin: admin@feestrack.com / admin123"
echo "  Coach: rajesh@feestrack.com / coach123"
echo ""
print_success "Ready to start! 🚀"
echo ""
echo "Useful commands:"
echo "  - View database: cd backend && npx prisma studio"
echo "  - Reset database: psql -d postgres -c 'DROP DATABASE fees_tracker;' && ./setup-macos.sh"
echo ""


