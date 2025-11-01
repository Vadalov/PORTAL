#!/bin/bash

# GitHub MCP Server Setup Script for PORTAL Project
# This script configures the Model Context Protocol GitHub server

set -e

echo "🚀 GitHub MCP Server Setup"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if GitHub token is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  GITHUB_TOKEN environment variable not set${NC}"
    echo ""
    echo "Please create a GitHub Personal Access Token:"
    echo "1. Visit: https://github.com/settings/tokens/new"
    echo "2. Select scopes: repo, workflow, read:org, read:user, user:email"
    echo "3. Generate token"
    echo ""
    echo "Then set it in your environment:"
    echo "  export GITHUB_TOKEN='your_token_here'"
    echo ""
    echo "Or add to ~/.bashrc or ~/.zshrc for persistence:"
    echo "  echo 'export GITHUB_TOKEN=\"your_token_here\"' >> ~/.bashrc"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ GitHub token found${NC}"

# Create Claude config directory
CONFIG_DIR="$HOME/.config/claude"
mkdir -p "$CONFIG_DIR"
echo -e "${GREEN}✓ Created config directory: $CONFIG_DIR${NC}"

# Check if mcp.json exists
if [ -f "$CONFIG_DIR/mcp.json" ]; then
    echo -e "${YELLOW}⚠️  mcp.json already exists${NC}"
    echo "Creating backup..."
    cp "$CONFIG_DIR/mcp.json" "$CONFIG_DIR/mcp.json.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}✓ Backup created${NC}"
fi

# Create or update mcp.json
cat > "$CONFIG_DIR/mcp.json" << 'EOF'
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
EOF

echo -e "${GREEN}✓ Created mcp.json configuration${NC}"

# Update with actual token
sed -i "s/\${GITHUB_TOKEN}/$GITHUB_TOKEN/g" "$CONFIG_DIR/mcp.json"

echo ""
echo -e "${BLUE}📝 Configuration Details:${NC}"
echo "  Config file: $CONFIG_DIR/mcp.json"
echo "  Server: @modelcontextprotocol/server-github"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Restart Claude Desktop application"
echo "2. The GitHub MCP server will be available automatically"
echo "3. You can now interact with GitHub repos, issues, PRs, etc."
echo ""
echo "Example commands you can use:"
echo "  - List issues in this repository"
echo "  - Create a pull request"
echo "  - Search for code across repositories"
echo "  - Get file contents from GitHub"
echo ""
echo "For PORTAL repository: Vadalov/PORTAL"
