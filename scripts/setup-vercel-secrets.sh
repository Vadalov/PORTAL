#!/bin/bash

# PORTAL - Vercel Credentials Setup
# Bu script Vercel credentials'larını kontrol eder

echo "🔐 Vercel Credentials Kurulum Rehberi"
echo "======================================"
echo ""

# Verilen bilgiler
PROJECT_ID="prj_RbJu4morCkUWtBy1lCzmR8IjXmuY"
TOKEN="O8kt0pyb6w7tyeJPSra7V1eZ"

echo "✅ Vercel Project ID: $PROJECT_ID"
echo "✅ Vercel Token: $TOKEN"
echo ""

# Organization ID'yi almak için
echo "📋 Vercel Organization ID'yi almak için:"
echo ""
echo "Yöntem 1 - Vercel CLI:"
echo "  1. Terminal'de: vercel link"
echo "  2. Projeyi seç"
echo "  3. Ardından: cat .vercel/project.json"
echo "  4. 'orgId' değerini kopyala"
echo ""
echo "Yöntem 2 - Vercel Dashboard:"
echo "  1. https://vercel.com/dashboard adresine git"
echo "  2. Settings → General"
echo "  3. 'Team ID' veya 'Personal Account ID' değerini kopyala"
echo ""

read -p "Organization ID'yi gir (örn: team_xxxx veya user_xxxx): " ORG_ID

if [ -z "$ORG_ID" ]; then
    echo ""
    echo "⚠️  Organization ID boş!"
    echo "Önce Organization ID'yi almanız gerekiyor."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 GitHub Secrets Değerleri:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "VERCEL_TOKEN=$TOKEN"
echo "VERCEL_PROJECT_ID=$PROJECT_ID"
echo "VERCEL_ORG_ID=$ORG_ID"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 GitHub'a Secrets Eklemek İçin:"
echo ""
echo "1. https://github.com/Vadalov/PORTAL/settings/secrets/actions adresine git"
echo ""
echo "2. 'New repository secret' butonuna tıkla"
echo ""
echo "3. Şu secrets'ları ekle:"
echo ""
echo "   Secret 1:"
echo "   Name:  VERCEL_TOKEN"
echo "   Value: $TOKEN"
echo ""
echo "   Secret 2:"
echo "   Name:  VERCEL_PROJECT_ID"
echo "   Value: $PROJECT_ID"
echo ""
echo "   Secret 3:"
echo "   Name:  VERCEL_ORG_ID"
echo "   Value: $ORG_ID"
echo ""
echo "4. Her biri için 'Add secret' butonuna tıkla"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Secrets eklendikten sonra:"
echo "   • GitHub Actions otomatik çalışacak"
echo "   • main branch'e push yapınca production deploy"
echo "   • PR açınca preview deploy"
echo ""
echo "📖 Test etmek için:"
echo "   git add ."
echo "   git commit -m 'feat: vercel deployment setup'"
echo "   git push origin main"
echo ""
