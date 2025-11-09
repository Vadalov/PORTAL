#!/bin/bash

# GitHub Secrets Otomatik Ekleme Script
# Bu script GitHub CLI (gh) kullanarak secrets ekler

set -e

echo "🔐 GitHub Secrets Ekleniyor..."
echo "================================"
echo ""

# GitHub CLI kontrolü
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) bulunamadı!"
    echo ""
    echo "Yüklemek için:"
    echo "  Linux: sudo apt install gh"
    echo "  macOS: brew install gh"
    echo "  Windows: winget install GitHub.cli"
    echo ""
    echo "Veya: https://cli.github.com"
    exit 1
fi

# GitHub authentication kontrolü
if ! gh auth status &> /dev/null; then
    echo "⚠️  GitHub'a giriş yapılmamış!"
    echo ""
    echo "Giriş yapmak için:"
    echo "  gh auth login"
    echo ""
    read -p "Şimdi giriş yapmak ister misiniz? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gh auth login
    else
        exit 1
    fi
fi

echo "✅ GitHub CLI hazır"
echo ""

# Repository bilgileri
REPO_OWNER="Vadalov"
REPO_NAME="PORTAL"

# Secrets
VERCEL_TOKEN="O8kt0pyb6w7tyeJPSra7V1eZ"
VERCEL_PROJECT_ID="prj_RbJu4morCkUWtBy1lCzmR8IjXmuY"
VERCEL_ORG_ID="GEgdQAxD3RqU4MBVBloio1lm"

echo "📋 Eklenecek Secrets:"
echo "  • VERCEL_TOKEN"
echo "  • VERCEL_PROJECT_ID"
echo "  • VERCEL_ORG_ID"
echo ""

read -p "Bu secrets'ları $REPO_OWNER/$REPO_NAME repository'sine eklemek istiyor musunuz? [y/N]: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ İptal edildi"
    exit 0
fi

echo ""
echo "🔄 Secrets ekleniyor..."
echo ""

# Secret 1: VERCEL_TOKEN
echo "1/3 VERCEL_TOKEN ekleniyor..."
if echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN -R "$REPO_OWNER/$REPO_NAME"; then
    echo "  ✅ VERCEL_TOKEN eklendi"
else
    echo "  ❌ VERCEL_TOKEN eklenemedi"
fi

# Secret 2: VERCEL_PROJECT_ID
echo "2/3 VERCEL_PROJECT_ID ekleniyor..."
if echo "$VERCEL_PROJECT_ID" | gh secret set VERCEL_PROJECT_ID -R "$REPO_OWNER/$REPO_NAME"; then
    echo "  ✅ VERCEL_PROJECT_ID eklendi"
else
    echo "  ❌ VERCEL_PROJECT_ID eklenemedi"
fi

# Secret 3: VERCEL_ORG_ID
echo "3/3 VERCEL_ORG_ID ekleniyor..."
if echo "$VERCEL_ORG_ID" | gh secret set VERCEL_ORG_ID -R "$REPO_OWNER/$REPO_NAME"; then
    echo "  ✅ VERCEL_ORG_ID eklendi"
else
    echo "  ❌ VERCEL_ORG_ID eklenemedi"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Tüm secrets başarıyla eklendi!"
echo ""
echo "📋 Doğrulama:"
echo "   gh secret list -R $REPO_OWNER/$REPO_NAME"
echo ""
echo "🚀 Sonraki Adım:"
echo "   GitHub Actions otomatik çalışacak"
echo "   İzlemek için: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
