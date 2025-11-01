#!/bin/bash

# Appwrite Deployment Quick Start Script
# Bu script Appwrite deployment için gerekli temel kontrollleri yapar
# This script performs basic checks required for Appwrite deployment

set -e

echo "🚀 Appwrite Deployment Quick Start"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local dosyası bulunamadı!"
    echo "   Lütfen .env.example dosyasını kopyalayıp .env.local olarak kaydedin"
    echo "   ve gerekli değişkenleri doldurun."
    echo ""
    echo "   Komut: cp .env.example .env.local"
    echo ""
    exit 1
fi

echo "✅ .env.local dosyası bulundu"

# Check if required variables are set
source .env.local 2>/dev/null || true

if [ -z "$NEXT_PUBLIC_APPWRITE_ENDPOINT" ]; then
    echo "❌ NEXT_PUBLIC_APPWRITE_ENDPOINT tanımlı değil!"
    echo "   Lütfen .env.local dosyasında bu değişkeni tanımlayın."
    exit 1
fi

if [ -z "$NEXT_PUBLIC_APPWRITE_PROJECT_ID" ]; then
    echo "❌ NEXT_PUBLIC_APPWRITE_PROJECT_ID tanımlı değil!"
    echo "   Lütfen .env.local dosyasında bu değişkeni tanımlayın."
    exit 1
fi

if [ -z "$APPWRITE_API_KEY" ]; then
    echo "❌ APPWRITE_API_KEY tanımlı değil!"
    echo "   Lütfen .env.local dosyasında bu değişkeni tanımlayın."
    exit 1
fi

echo "✅ Gerekli environment değişkenleri tanımlı"
echo ""

# Check if appwrite.json exists
if [ ! -f "appwrite.json" ]; then
    echo "❌ appwrite.json dosyası bulunamadı!"
    exit 1
fi

echo "✅ appwrite.json dosyası bulundu"
echo ""

# Update projectId in appwrite.json if it's empty
if grep -q '"projectId": ""' appwrite.json; then
    echo "⚠️  appwrite.json içinde projectId boş!"
    echo "   ProjectId'yi otomatik olarak güncelliyoruz..."
    
    # For macOS compatibility
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"projectId\": \"\"/\"projectId\": \"$NEXT_PUBLIC_APPWRITE_PROJECT_ID\"/" appwrite.json
    else
        sed -i "s/\"projectId\": \"\"/\"projectId\": \"$NEXT_PUBLIC_APPWRITE_PROJECT_ID\"/" appwrite.json
    fi
    
    echo "✅ ProjectId güncellendi: $NEXT_PUBLIC_APPWRITE_PROJECT_ID"
    echo ""
fi

# Ask user which deployment method to use
echo "Deployment yöntemini seçin:"
echo "1) Otomatik kurulum (setup-appwrite.ts script - Önerilen)"
echo "2) Appwrite CLI ile deploy (appwrite.json kullanarak)"
echo "3) İptal"
echo ""
read -p "Seçiminiz (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "🔄 Otomatik kurulum başlatılıyor..."
        echo ""
        npm run appwrite:setup
        echo ""
        echo "✨ Otomatik kurulum tamamlandı!"
        echo ""
        echo "📝 Sonraki adımlar:"
        echo "   1. npm run dev - Development server'ı başlat"
        echo "   2. http://localhost:3000 - Uygulamayı tarayıcıda aç"
        echo "   3. Appwrite Console'dan collection'ları kontrol et"
        ;;
    2)
        echo ""
        echo "📦 Appwrite CLI kontrol ediliyor..."
        
        # Check if appwrite CLI is available
        if ! command -v appwrite &> /dev/null && ! npx appwrite --version &> /dev/null; then
            echo "❌ Appwrite CLI bulunamadı!"
            echo "   Lütfen önce Appwrite CLI'yi yükleyin:"
            echo "   npm install -g appwrite-cli"
            exit 1
        fi
        
        echo "✅ Appwrite CLI bulundu"
        echo ""
        echo "🔐 Appwrite'a giriş yapılıyor..."
        echo ""
        
        npx appwrite login --endpoint "$NEXT_PUBLIC_APPWRITE_ENDPOINT"
        
        echo ""
        echo "🚀 Deployment başlatılıyor..."
        echo ""
        
        npm run appwrite:deploy
        
        echo ""
        echo "✨ Deployment tamamlandı!"
        echo ""
        echo "📝 Sonraki adımlar:"
        echo "   1. npm run dev - Development server'ı başlat"
        echo "   2. http://localhost:3000 - Uygulamayı tarayıcıda aç"
        echo "   3. Appwrite Console'dan deployment'ı kontrol et"
        ;;
    3)
        echo ""
        echo "👋 Deployment iptal edildi"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Geçersiz seçim!"
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo "🎉 Deployment işlemi başarıyla tamamlandı!"
echo ""
echo "Daha fazla bilgi için: APPWRITE_DEPLOYMENT.md dosyasına bakın"
echo ""
