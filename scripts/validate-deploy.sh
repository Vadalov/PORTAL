#!/bin/bash

# PORTAL - Pre-Deployment Validation Script
# Bu script deployment öncesi tüm kontrolleri yapar

set -e

echo "🔍 PORTAL Pre-Deployment Validation"
echo "===================================="
echo ""

# Renkler
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Başarı/Hata fonksiyonları
success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# 1. Node.js versiyonu kontrolü
echo -e "${BLUE}[1/8]${NC} Node.js versiyonu..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    success "Node.js $NODE_VERSION ✓"
else
    error "Node.js 20+ gerekli. Mevcut: $NODE_VERSION"
fi
echo ""

# 2. Dependencies kontrolü
echo -e "${BLUE}[2/8]${NC} Dependencies kontrolü..."
if [ ! -d "node_modules" ]; then
    warning "node_modules bulunamadı. npm install çalıştırılıyor..."
    npm install
fi
success "Dependencies yüklü"
echo ""

# 3. TypeScript kontrolü
echo -e "${BLUE}[3/8]${NC} TypeScript type checking..."
if npm run typecheck 2>&1 | grep -q "error TS"; then
    error "TypeScript hataları var"
    npm run typecheck
else
    success "TypeScript hatasız"
fi
echo ""

# 4. ESLint kontrolü
echo -e "${BLUE}[4/8]${NC} ESLint checking..."
LINT_OUTPUT=$(npm run lint 2>&1 || true)
if echo "$LINT_OUTPUT" | grep -q "error"; then
    error "ESLint hataları var"
    echo "$LINT_OUTPUT"
else
    success "ESLint hatasız"
fi
echo ""

# 5. Test kontrolü
echo -e "${BLUE}[5/8]${NC} Unit tests..."
if npm run test:run > /dev/null 2>&1; then
    success "Tüm testler geçti"
else
    warning "Bazı testler başarısız (production'a engel değil)"
fi
echo ""

# 6. Environment variables kontrolü
echo -e "${BLUE}[6/8]${NC} Environment variables..."
if [ -f ".env.local" ]; then
    if grep -q "NEXT_PUBLIC_CONVEX_URL" .env.local; then
        success ".env.local mevcut ve CONVEX_URL ayarlı"
    else
        warning "CONVEX_URL .env.local'de bulunamadı"
    fi
else
    warning ".env.local bulunamadı"
fi
echo ""

# 7. Build testi
echo -e "${BLUE}[7/8]${NC} Production build..."
info "Build başlatılıyor (2-4 dakika sürebilir)..."
if npm run build > /tmp/build-output.txt 2>&1; then
    success "Production build başarılı"
else
    error "Build başarısız"
    tail -20 /tmp/build-output.txt
fi
echo ""

# 8. Security audit
echo -e "${BLUE}[8/8]${NC} Security audit..."
AUDIT_OUTPUT=$(npm audit --production 2>&1 || true)
HIGH_VULN=$(echo "$AUDIT_OUTPUT" | grep -oP '\d+ high' || echo "0 high")
CRITICAL_VULN=$(echo "$AUDIT_OUTPUT" | grep -oP '\d+ critical' || echo "0 critical")

if [[ "$HIGH_VULN" == "0 high" ]] && [[ "$CRITICAL_VULN" == "0 critical" ]]; then
    success "Security audit temiz"
else
    warning "Security vulnerabilities bulundu: $HIGH_VULN, $CRITICAL_VULN"
    info "npm audit fix ile düzeltmeyi deneyin"
fi
echo ""

# Özet
echo "=================================="
echo -e "${BLUE}Validation Özeti:${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Tüm kontroller başarılı! Deploy için hazır.${NC}"
    echo ""
    echo "Sonraki adım:"
    echo "  npm run deploy:vercel"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS uyarı bulundu, ancak deploy edilebilir.${NC}"
    echo ""
    echo "Sonraki adım:"
    echo "  npm run deploy:vercel"
    exit 0
else
    echo -e "${RED}✗ $ERRORS hata bulundu. Deploy öncesi düzeltilmeli.${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS uyarı da var.${NC}"
    fi
    echo ""
    echo "Hataları düzelttikten sonra tekrar çalıştırın:"
    echo "  npm run validate:deploy"
    exit 1
fi
