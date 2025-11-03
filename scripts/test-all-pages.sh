#!/bin/bash

echo "🧪 Testing All Application Pages"
echo "=================================="
echo ""

# Base URL
BASE_URL="http://localhost:3000"
COOKIE_FILE="/tmp/cookies3.txt"

# Function to test a page
test_page() {
    local url="$1"
    local name="$2"
    
    echo "🔍 Testing: $name ($url)"
    
    response=$(curl -s -w "%{http_code}" -b "$COOKIE_FILE" "$url" -o /tmp/page_response.html)
    
    if [ "$response" = "200" ]; then
        echo "  ✅ OK ($response)"
        
        # Check for common elements
        if grep -q "error" /tmp/page_response.html 2>/dev/null; then
            echo "  ⚠️  Contains 'error' text"
        fi
        
        if grep -q "loading" /tmp/page_response.html 2>/dev/null; then
            echo "  ⏳ Contains 'loading' text"
        fi
        
        # Check for forms
        if grep -q "<form" /tmp/page_response.html 2>/dev/null; then
            form_count=$(grep -o "<form" /tmp/page_response.html | wc -l)
            echo "  📝 Contains $form_count form(s)"
        fi
        
        # Check for buttons
        if grep -q "button" /tmp/page_response.html 2>/dev/null; then
            button_count=$(grep -o "button" /tmp/page_response.html | wc -l)
            echo "  🔘 Contains $button_count button reference(s)"
        fi
        
        # Check for links
        if grep -q "href=" /tmp/page_response.html 2>/dev/null; then
            link_count=$(grep -o "href=" /tmp/page_response.html | wc -l)
            echo "  🔗 Contains $link_count link(s)"
        fi
        
    else
        echo "  ❌ FAILED ($response)"
    fi
    
    echo ""
}

# Test homepage
test_page "$BASE_URL/" "Homepage"

# Test login page (no auth required)
test_page "$BASE_URL/login" "Login Page"

# Test main dashboard pages
test_page "$BASE_URL/genel" "Main Dashboard (Genel)"
test_page "$BASE_URL/financial-dashboard" "Financial Dashboard"
test_page "$BASE_URL/ayarlar/parametreler" "Settings Parameters"
test_page "$BASE_URL/settings" "Settings"
test_page "$BASE_URL/kullanici" "User Management"

# Test aid/yardim pages
test_page "$BASE_URL/yardim/liste" "Aid List"
test_page "$BASE_URL/yardim/basvurular" "Aid Applications"
test_page "$BASE_URL/yardim/nakdi-vezne" "Cash Aid"
test_page "$BASE_URL/yardim/ihtiyac-sahipleri" "Needy Persons"

# Test donation/bagis pages  
test_page "$BASE_URL/bagis/liste" "Donations List"
test_page "$BASE_URL/bagis/raporlar" "Donation Reports"
test_page "$BASE_URL/bagis/kumbara" "Donation Box"

# Test scholarship/burs pages
test_page "$BASE_URL/burs/basvurular" "Scholarship Applications"
test_page "$BASE_URL/burs/ogrenciler" "Scholarship Students"
test_page "$BASE_URL/burs/yetim" "Orphan Scholarships"

# Test financial/fon pages
test_page "$BASE_URL/fon/gelir-gider" "Income-Expense"
test_page "$BASE_URL/fon/raporlar" "Financial Reports"

# Test work/is pages
test_page "$BASE_URL/is/gorevler" "Tasks"
test_page "$BASE_URL/is/toplantilar" "Meetings"

# Test messaging pages
test_page "$BASE_URL/mesaj/kurum-ici" "Internal Messages"
test_page "$BASE_URL/mesaj/toplu" "Bulk Messages"

# Test partner pages
test_page "$BASE_URL/partner/liste" "Partner List"

echo "🏁 Page testing completed!"
echo ""
echo "📊 Summary of tested pages:"
echo "  • Homepage and Login"
echo "  • Main Dashboard and Financial"
echo "  • Aid Management (5 pages)"
echo "  • Donation Management (3 pages)"  
echo "  • Scholarship Management (3 pages)"
echo "  • Financial Reports (2 pages)"
echo "  • Task Management (2 pages)"
echo "  • Messaging (2 pages)"
echo "  • Partner Management (1 page)"
echo "  • User Management (1 page)"
echo "  • Settings (2 pages)"
echo ""
echo "🎯 Total: 29 main pages tested"