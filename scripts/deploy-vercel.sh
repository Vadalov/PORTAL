#!/bin/bash

# PORTAL - Vercel + Convex Hızlı Deploy Script
# Bu script deployment sürecini otomatikleştirir

set -e

echo "🚀 PORTAL Vercel + Convex Deployment"
echo "===================================="
echo ""

# Renkler
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Convex CLI kontrolü
echo -e "${BLUE}[1/6]${NC} Convex CLI kontrolü..."
if ! command -v convex &> /dev/null; then
    echo -e "${YELLOW}⚠ Convex CLI bulunamadı. Yükleniyor...${NC}"
    npm install -g convex
fi
echo -e "${GREEN}✓ Convex CLI hazır${NC}"
echo ""

# 2. Convex Login
echo -e "${BLUE}[2/6]${NC} Convex hesabınıza giriş yapılıyor..."
echo -e "${YELLOW}Tarayıcınızda açılan sayfadan giriş yapın...${NC}"
npx convex login
echo -e "${GREEN}✓ Convex girişi başarılı${NC}"
echo ""

# 3. Convex Production Deploy
echo -e "${BLUE}[3/6]${NC} Convex backend production deploy..."
echo -e "${YELLOW}Bu işlem 1-2 dakika sürebilir...${NC}"
CONVEX_URL=$(npx convex deploy --prod | grep -oP 'https://[^\s]+' | tail -1)

if [ -z "$CONVEX_URL" ]; then
    echo -e "${RED}✗ Convex deploy başarısız!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Convex deploy başarılı!${NC}"
echo -e "   Production URL: ${GREEN}$CONVEX_URL${NC}"
echo ""

# 4. Vercel CLI kontrolü
echo -e "${BLUE}[4/6]${NC} Vercel CLI kontrolü..."
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠ Vercel CLI bulunamadı. Yükleniyor...${NC}"
    npm install -g vercel
fi
echo -e "${GREEN}✓ Vercel CLI hazır${NC}"
echo ""

# 5. Secrets oluştur
echo -e "${BLUE}[5/6]${NC} Security secrets oluşturuluyor..."
CSRF_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${GREEN}✓ Secrets oluşturuldu${NC}"
echo ""

# 6. Ortam değişkenlerini göster
echo -e "${BLUE}[6/6]${NC} Vercel ortam değişkenleri:"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Aşağıdaki değişkenleri Vercel Dashboard'a ekleyin:${NC}"
echo ""
echo "NEXT_PUBLIC_CONVEX_URL=$CONVEX_URL"
echo "BACKEND_PROVIDER=convex"
echo "NEXT_PUBLIC_BACKEND_PROVIDER=convex"
echo "CSRF_SECRET=$CSRF_SECRET"
echo "SESSION_SECRET=$SESSION_SECRET"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Vercel deploy başlat
echo -e "${GREEN}Vercel deploy için:${NC}"
echo "1. https://vercel.com/new adresine gidin"
echo "2. GitHub repository'nizi import edin (Vadalov/PORTAL)"
echo "3. Yukarıdaki ortam değişkenlerini ekleyin"
echo "4. 'Deploy' butonuna tıklayın"
echo ""

# Dosyaya kaydet
cat > .env.vercel << EOF
# Vercel Environment Variables
# Copy these to Vercel Dashboard → Settings → Environment Variables

NEXT_PUBLIC_CONVEX_URL=$CONVEX_URL
BACKEND_PROVIDER=convex
NEXT_PUBLIC_BACKEND_PROVIDER=convex
CSRF_SECRET=$CSRF_SECRET
SESSION_SECRET=$SESSION_SECRET

# Optional variables (add if needed):
# NEXT_PUBLIC_APP_NAME=Dernek Yönetim Sistemi
# NEXT_PUBLIC_APP_VERSION=1.0.0
# NEXT_PUBLIC_ENABLE_REALTIME=true
# SMTP_HOST=
# SMTP_PORT=
# TWILIO_ACCOUNT_SID=
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
EOF

echo -e "${GREEN}✓ Ortam değişkenleri .env.vercel dosyasına kaydedildi${NC}"
echo ""

# İsteğe bağlı: Otomatik Vercel deploy
read -p "$(echo -e ${YELLOW}Vercel deploy otomatik başlatılsın mı? [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Vercel deploy başlatılıyor...${NC}"
    vercel --prod
    echo -e "${GREEN}✓ Vercel deploy tamamlandı!${NC}"
else
    echo -e "${YELLOW}Manuel deploy için 'vercel --prod' komutunu çalıştırın${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment hazır!${NC}"
echo ""
echo -e "Sonraki adımlar:"
echo "1. Vercel dashboard'da deployment'ı izleyin"
echo "2. Deploy tamamlandıktan sonra health check yapın:"
echo "   curl https://your-project.vercel.app/api/health"
echo "3. Login sayfasını test edin"
echo ""
echo -e "${BLUE}Detaylı rehber için: docs/VERCEL_DEPLOYMENT.md${NC}"
