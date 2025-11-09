#!/bin/bash

# PORTAL - Vercel Rollback Script
# Deployment sorun çıkarırsa önceki versiyona dön

set -e

echo "🔄 PORTAL Vercel Rollback"
echo "========================="
echo ""

# Renkler
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vercel CLI kontrolü
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}✗ Vercel CLI bulunamadı!${NC}"
    echo "Yüklemek için: npm install -g vercel"
    exit 1
fi

# Son deploymentları listele
echo -e "${BLUE}Son deploymentlar:${NC}"
echo ""
vercel ls --prod 2>/dev/null || vercel ls

echo ""
echo -e "${YELLOW}⚠ DİKKAT: Rollback yapmak üzeresiniz!${NC}"
echo ""

# Rollback onayı
read -p "$(echo -e ${RED}Rollback yapmak istediğinizden emin misiniz? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Rollback iptal edildi.${NC}"
    exit 0
fi

# Rollback URL sorgusu
echo ""
read -p "$(echo -e ${BLUE}Rollback yapılacak deployment URL'i girin: ${NC})" DEPLOYMENT_URL

if [ -z "$DEPLOYMENT_URL" ]; then
    echo -e "${RED}✗ URL boş olamaz!${NC}"
    exit 1
fi

# Rollback işlemi
echo ""
echo -e "${BLUE}Rollback başlatılıyor...${NC}"

if vercel rollback "$DEPLOYMENT_URL" --yes; then
    echo ""
    echo -e "${GREEN}✓ Rollback başarılı!${NC}"
    echo ""
    echo "Sonraki adımlar:"
    echo "1. Production URL'i kontrol edin"
    echo "2. Health check yapın: curl https://your-project.vercel.app/api/health"
    echo "3. Hatayı düzeltin ve yeniden deploy edin"
else
    echo ""
    echo -e "${RED}✗ Rollback başarısız!${NC}"
    echo ""
    echo "Manuel rollback için:"
    echo "1. Vercel Dashboard'a gidin"
    echo "2. Deployments sekmesine tıklayın"
    echo "3. Çalışan bir deployment bulun"
    echo "4. '...' menüsünden 'Promote to Production' seçin"
    exit 1
fi
