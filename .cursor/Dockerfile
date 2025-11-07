# Multi-stage Dockerfile for PORTAL Cloud Agents
# Optimized for faster builds, smaller size, and better security
# Note: Code is NOT copied here - it will be cloned by the agent later.

# Stage 1: Dependencies and tools
FROM node:20.9.0-slim AS base

# Install system dependencies and development tools in a single layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    wget \
    build-essential \
    python3 \
    lsof \
    ca-certificates \
    # Playwright dependencies for E2E testing
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* /var/tmp/*

# Stage 2: Development environment
FROM base AS development

# Create a non-root user with specific UID/GID for consistency
RUN groupadd -g 1000 ubuntu && \
    useradd -m -u 1000 -g ubuntu -s /bin/bash ubuntu

# Install global npm packages efficiently in a single layer
RUN npm install -g --silent \
    npm@10.2.4 \
    typescript@5.3.2 \
    tsx@4.7.0 \
    convex@0.12.2 \
    && npm cache clean --force

# Set up environment variables
ENV NODE_ENV=development \
    PATH="/home/ubuntu/.local/bin:$PATH" \
    # Disable npm progress bar for faster installs
    npm_config_progress=false \
    # Increase npm memory for large projects
    NODE_OPTIONS="--max-old-space-size=4096"

# Set working directory
WORKDIR /home/ubuntu

# Switch to non-root user
USER ubuntu

# Create useful directories
RUN mkdir -p /home/ubuntu/.npm-global /home/ubuntu/projects

# Health check for monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node --version > /dev/null 2>&1 || exit 1

# Expose port 3000 for development server
EXPOSE 3000

# Add development scripts
COPY --chown=ubuntu:ubuntu <<EOF /home/ubuntu/.bashrc
# Development aliases
alias dev="npm run dev"
alias build="npm run build"
alias test="npm run test"
alias lint="npm run lint"
alias typecheck="npm run typecheck"
EOF

# Default command
CMD ["/bin/bash"]