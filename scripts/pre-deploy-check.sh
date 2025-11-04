#!/bin/bash

# Pre-Deployment Check Script
# This script verifies that everything is ready for production deployment

set -e  # Exit on error

echo "🚀 Starting Pre-Deployment Checks..."
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0
WARNINGS=0

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# Function to print error
error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

# Check if Node.js is installed
echo "📦 Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 20 ]; then
        success "Node.js version $(node -v) is compatible"
    else
        error "Node.js version $(node -v) is too old. Required: 20+"
    fi
else
    error "Node.js is not installed"
fi

# Check if npm is installed
echo ""
echo "📦 Checking npm version..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v | cut -d'.' -f1)
    if [ "$NPM_VERSION" -ge 9 ]; then
        success "npm version $(npm -v) is compatible"
    else
        error "npm version $(npm -v) is too old. Required: 9+"
    fi
else
    error "npm is not installed"
fi

# Check environment variables
echo ""
echo "🔐 Checking Environment Variables..."

# Check if .env.production exists
if [ -f ".env.production" ]; then
    success ".env.production file exists"
    
    # Check required variables
    source .env.production 2>/dev/null || true
    
    if [ -z "$NEXT_PUBLIC_CONVEX_URL" ]; then
        error "NEXT_PUBLIC_CONVEX_URL is not set"
    else
        success "NEXT_PUBLIC_CONVEX_URL is set"
    fi
    
    if [ -z "$CSRF_SECRET" ]; then
        error "CSRF_SECRET is not set"
    elif [ ${#CSRF_SECRET} -lt 32 ]; then
        error "CSRF_SECRET is too short (must be at least 32 characters)"
    else
        success "CSRF_SECRET is set and meets length requirement"
    fi
    
    if [ -z "$SESSION_SECRET" ]; then
        error "SESSION_SECRET is not set"
    elif [ ${#SESSION_SECRET} -lt 32 ]; then
        error "SESSION_SECRET is too short (must be at least 32 characters)"
    else
        success "SESSION_SECRET is set and meets length requirement"
    fi
    
    if [ -z "$SENTRY_DSN" ] && [ -z "$NEXT_PUBLIC_SENTRY_DSN" ]; then
        warning "Sentry DSN is not set (optional but recommended)"
    else
        success "Sentry DSN is configured"
    fi
else
    warning ".env.production file not found. Using .env.local or system environment variables"
fi

# Check Convex CLI
echo ""
echo "🔷 Checking Convex CLI..."
if command -v npx &> /dev/null; then
    if npx convex --version &> /dev/null; then
        success "Convex CLI is available"
    else
        warning "Convex CLI might not be installed. Run: npm install -g convex"
    fi
else
    warning "npx is not available"
fi

# Check dependencies
echo ""
echo "📚 Checking Dependencies..."
if [ -d "node_modules" ]; then
    success "node_modules directory exists"
    
    # Check if critical packages are installed
    if [ -d "node_modules/next" ]; then
        success "Next.js is installed"
    else
        error "Next.js is not installed. Run: npm install"
    fi
    
    if [ -d "node_modules/convex" ]; then
        success "Convex SDK is installed"
    else
        error "Convex SDK is not installed. Run: npm install"
    fi
else
    error "node_modules not found. Run: npm install"
fi

# Run TypeScript type check
echo ""
echo "🔍 Running TypeScript Type Check..."
if npm run typecheck &> /dev/null; then
    success "TypeScript type check passed"
else
    error "TypeScript type check failed. Run: npm run typecheck"
fi

# Run linting
echo ""
echo "🔍 Running ESLint..."
if npm run lint -- --max-warnings 0 &> /dev/null; then
    success "ESLint check passed"
else
    error "ESLint check failed. Run: npm run lint"
fi

# Run tests
echo ""
echo "🧪 Running Tests..."
if npm run test:run &> /dev/null; then
    success "Tests passed"
else
    error "Tests failed. Run: npm run test:run"
fi

# Test production build
echo ""
echo "🏗️  Testing Production Build..."
if npm run build &> /dev/null; then
    success "Production build successful"
    
    # Check if .next directory exists
    if [ -d ".next" ]; then
        success ".next build directory created"
    else
        error ".next build directory not found"
    fi
else
    error "Production build failed. Run: npm run build"
fi

# Check for security issues
echo ""
echo "🔒 Checking Security..."

# Check for console.log in production code (basic check)
if grep -r "console\.log" src --include="*.ts" --include="*.tsx" | grep -v "console.log(JSON.stringify" | grep -v "//" &> /dev/null; then
    warning "Found console.log statements in source code (should be removed in production)"
else
    success "No console.log statements found (or properly handled)"
fi

# Check for hardcoded secrets (basic check)
if grep -r "password.*=.*['\"][^'\"]\{8,\}" src --include="*.ts" --include="*.tsx" &> /dev/null; then
    warning "Potential hardcoded passwords found. Review code."
else
    success "No obvious hardcoded secrets found"
fi

# Summary
echo ""
echo "=================================="
echo "📊 Summary"
echo "=================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  All critical checks passed, but $WARNINGS warning(s) found.${NC}"
    echo "Review warnings above before deploying."
    exit 0
else
    echo -e "${RED}❌ Deployment check failed with $ERRORS error(s) and $WARNINGS warning(s).${NC}"
    echo "Please fix the errors above before deploying."
    exit 1
fi

