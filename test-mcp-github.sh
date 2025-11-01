#!/bin/bash

# Quick test script for GitHub MCP Server
# Run this after setup to verify everything works

echo "🧪 Testing GitHub MCP Server Configuration"
echo "==========================================="
echo ""

# Test 1: Check token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN not set"
    echo "   Run: export GITHUB_TOKEN='your_token_here'"
    exit 1
else
    echo "✅ GITHUB_TOKEN is set"
fi

# Test 2: Check config file
if [ -f ~/.config/claude/mcp.json ]; then
    echo "✅ MCP config file exists"
else
    echo "❌ MCP config file not found"
    echo "   Run: ./setup-mcp-github.sh"
    exit 1
fi

# Test 3: Validate JSON
if jq empty ~/.config/claude/mcp.json 2>/dev/null; then
    echo "✅ MCP config is valid JSON"
else
    echo "⚠️  Cannot validate JSON (jq not installed)"
fi

# Test 4: Check npx
if command -v npx &> /dev/null; then
    echo "✅ npx is available"
else
    echo "❌ npx not found"
    exit 1
fi

# Test 5: Test GitHub API access
echo ""
echo "Testing GitHub API access..."
RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user)
if echo "$RESPONSE" | grep -q "login"; then
    USERNAME=$(echo "$RESPONSE" | grep -o '"login": *"[^"]*"' | cut -d'"' -f4)
    echo "✅ GitHub API access OK (User: $USERNAME)"
else
    echo "❌ GitHub API access failed"
    echo "   Check your token permissions"
    exit 1
fi

echo ""
echo "✅ All tests passed!"
echo ""
echo "Next steps:"
echo "1. Restart Claude Desktop"
echo "2. Try commands like:"
echo "   - 'List issues in Vadalov/PORTAL'"
echo "   - 'Show me the README from PORTAL'"
echo "   - 'Create a new branch in PORTAL'"
