#!/bin/bash

# Post-Deployment Verification Script
# This script verifies that the deployment is working correctly

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get deployment URL from argument or use default
DEPLOYMENT_URL="${1:-http://localhost:3000}"

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

echo "🔍 Post-Deployment Verification"
echo "=================================="
echo "Deployment URL: $DEPLOYMENT_URL"
echo ""

# Check if URL is accessible
echo "🌐 Checking Deployment Accessibility..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    success "Deployment is accessible (HTTP $HTTP_CODE)"
else
    error "Deployment is not accessible (HTTP $HTTP_CODE)"
    echo "Please verify the deployment URL: $DEPLOYMENT_URL"
fi

# Check health endpoint
echo ""
echo "🏥 Checking Health Endpoint..."
HEALTH_URL="${DEPLOYMENT_URL}/api/health"
HEALTH_RESPONSE=$(curl -s "$HEALTH_URL" || echo "")

if [ -n "$HEALTH_RESPONSE" ]; then
    if echo "$HEALTH_RESPONSE" | grep -q "status.*ok" || echo "$HEALTH_RESPONSE" | grep -q "\"status\".*\"ok\""; then
        success "Health endpoint is responding correctly"
    else
        warning "Health endpoint responded but status is not 'ok'"
        echo "Response: $HEALTH_RESPONSE"
    fi
else
    error "Health endpoint is not responding"
fi

# Check if Convex connection is working
echo ""
echo "🔷 Checking Convex Connection..."
if echo "$HEALTH_RESPONSE" | grep -q "convex.*true" || echo "$HEALTH_RESPONSE" | grep -q "\"convex\".*true"; then
    success "Convex connection is working"
else
    warning "Convex connection status unclear from health check"
fi

# Check main page
echo ""
echo "📄 Checking Main Page..."
MAIN_PAGE=$(curl -s "$DEPLOYMENT_URL" || echo "")

if [ -n "$MAIN_PAGE" ]; then
    if echo "$MAIN_PAGE" | grep -q "<!DOCTYPE html\|<html"; then
        success "Main page is loading"
    else
        warning "Main page response is unexpected"
    fi
else
    error "Main page is not loading"
fi

# Check login page
echo ""
echo "🔐 Checking Login Page..."
LOGIN_URL="${DEPLOYMENT_URL}/login"
LOGIN_PAGE=$(curl -s "$LOGIN_URL" || echo "")

if [ -n "$LOGIN_PAGE" ]; then
    if echo "$LOGIN_PAGE" | grep -q "<!DOCTYPE html\|<html"; then
        success "Login page is accessible"
    else
        warning "Login page response is unexpected"
    fi
else
    error "Login page is not accessible"
fi

# Check API endpoints (basic check)
echo ""
echo "🔌 Checking Critical API Endpoints..."

# Check CSRF endpoint
CSRF_URL="${DEPLOYMENT_URL}/api/csrf"
CSRF_RESPONSE=$(curl -s "$CSRF_URL" || echo "")
if [ -n "$CSRF_RESPONSE" ]; then
    success "CSRF endpoint is responding"
else
    warning "CSRF endpoint is not responding"
fi

# Check if HTTPS is enabled (if not localhost)
if [[ ! "$DEPLOYMENT_URL" =~ "localhost" ]] && [[ ! "$DEPLOYMENT_URL" =~ "127.0.0.1" ]]; then
    echo ""
    echo "🔒 Checking HTTPS..."
    if [[ "$DEPLOYMENT_URL" =~ "https://" ]]; then
        success "HTTPS is enabled"
        
        # Check SSL certificate
        SSL_INFO=$(echo | openssl s_client -connect "${DEPLOYMENT_URL#https://}" -servername "${DEPLOYMENT_URL#https://}" 2>/dev/null | grep -i "verify return code" || echo "")
        if [ -n "$SSL_INFO" ]; then
            if echo "$SSL_INFO" | grep -q "0 (ok)"; then
                success "SSL certificate is valid"
            else
                warning "SSL certificate verification issue"
            fi
        fi
    else
        warning "HTTPS is not enabled. Consider enabling for production."
    fi
fi

# Performance check
echo ""
echo "⚡ Checking Response Times..."
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$DEPLOYMENT_URL" || echo "999")

if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    success "Response time is good (${RESPONSE_TIME}s)"
elif (( $(echo "$RESPONSE_TIME < 5.0" | bc -l) )); then
    warning "Response time is acceptable (${RESPONSE_TIME}s) but could be improved"
else
    error "Response time is slow (${RESPONSE_TIME}s)"
fi

# Summary
echo ""
echo "=================================="
echo "📊 Verification Summary"
echo "=================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Deployment is healthy.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Deployment is accessible, but $WARNINGS warning(s) found.${NC}"
    echo "Review warnings above. Deployment may need attention."
    exit 0
else
    echo -e "${RED}❌ Deployment verification failed with $ERRORS error(s) and $WARNINGS warning(s).${NC}"
    echo "Please investigate and fix the issues above."
    exit 1
fi

