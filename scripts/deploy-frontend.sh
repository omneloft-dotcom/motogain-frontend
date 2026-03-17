#!/bin/bash
#
# Frontend Production Deployment Script
#
# This script builds the frontend locally and deploys it to production
# with atomic symlink switching for zero-downtime updates.
#
# Usage:
#   From your local machine (apps/motogain-frontend/):
#   ./scripts/deploy-frontend.sh
#
# Requirements:
#   - SSH access to production server configured
#   - rsync installed
#   - Server: /var/www/usecordy directory exists
#
# Author: MotoGain DevOps
# Last Updated: 2026-03-17

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_HOST="${DEPLOY_HOST:-usecordy.com}"
REMOTE_DIR="/var/www/usecordy"
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)
RELEASE_DIR="$REMOTE_DIR/releases/$TIMESTAMP"
MAX_RELEASES=3  # Keep last 3 releases for rollback

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Frontend Production Deployment Script             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Pre-flight checks
echo -e "${YELLOW}[1/9] Running pre-flight checks...${NC}"

# Check we're in the frontend directory
if [ ! -f "package.json" ] || [ ! -f "vite.config.js" ]; then
  echo -e "${RED}❌ Error: Must run from frontend root directory${NC}"
  echo -e "   Expected: apps/motogain-frontend/"
  echo -e "   Current:  $(pwd)"
  exit 1
fi

# Check SSH connectivity
echo "   Testing SSH connection to $DEPLOY_USER@$DEPLOY_HOST..."
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes $DEPLOY_USER@$DEPLOY_HOST "echo 'SSH OK'" > /dev/null 2>&1; then
  echo -e "${RED}❌ Error: Cannot connect to $DEPLOY_USER@$DEPLOY_HOST${NC}"
  echo -e "   Configure SSH key-based auth or set DEPLOY_HOST/DEPLOY_USER environment variables"
  echo -e "   Example: export DEPLOY_HOST=your-server.com DEPLOY_USER=deploy"
  exit 1
fi

echo -e "${GREEN}✅ Pre-flight checks passed${NC}"

# Clean any previous build
echo ""
echo -e "${YELLOW}[2/9] Cleaning previous build...${NC}"
rm -rf dist/
echo "   ✅ Cleaned dist/"

# Install dependencies
echo ""
echo -e "${YELLOW}[3/9] Installing dependencies...${NC}"
npm install

# Build for production
echo ""
echo -e "${YELLOW}[4/9] Building for production...${NC}"
npm run build

# Verify build succeeded
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
  echo -e "${RED}❌ Error: Build failed - dist/index.html not found${NC}"
  exit 1
fi

# Calculate build size
BUILD_SIZE=$(du -sh dist/ | awk '{print $1}')
FILE_COUNT=$(find dist/ -type f | wc -l)
echo -e "   ${GREEN}✅ Build successful${NC}"
echo "   📦 Build size: $BUILD_SIZE"
echo "   📄 File count: $FILE_COUNT"

# Confirm deployment
echo ""
echo -e "${YELLOW}Deploy to: $DEPLOY_USER@$DEPLOY_HOST:$REMOTE_DIR${NC}"
echo -e "${YELLOW}Release:   $TIMESTAMP${NC}"
read -p "$(echo -e ${YELLOW}Continue? [y/N]:${NC} )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Deployment cancelled${NC}"
  exit 0
fi

# Create release directory on server
echo ""
echo -e "${YELLOW}[5/9] Creating release directory on server...${NC}"
ssh $DEPLOY_USER@$DEPLOY_HOST "mkdir -p $RELEASE_DIR"
echo "   ✅ Created $RELEASE_DIR"

# Upload build to server
echo ""
echo -e "${YELLOW}[6/9] Uploading build to server...${NC}"
rsync -avz --progress dist/ $DEPLOY_USER@$DEPLOY_HOST:$RELEASE_DIR/
echo -e "   ${GREEN}✅ Upload complete${NC}"

# Atomic symlink switch (zero-downtime)
echo ""
echo -e "${YELLOW}[7/9] Switching to new release (atomic)...${NC}"

# On server: backup current as previous, then point current to new release
ssh $DEPLOY_USER@$DEPLOY_HOST bash <<EOF
set -e

# If current exists, save it as previous
if [ -L "$REMOTE_DIR/current" ]; then
  CURRENT_TARGET=\$(readlink $REMOTE_DIR/current)
  ln -sfn \$CURRENT_TARGET $REMOTE_DIR/previous
  echo "   💾 Saved previous release for rollback"
fi

# Atomic switch: point current to new release
ln -sfn $RELEASE_DIR $REMOTE_DIR/current
echo "   ✅ Switched current -> releases/$TIMESTAMP"

# Verify symlink
CURRENT_LINK=\$(readlink $REMOTE_DIR/current)
if [ "\$CURRENT_LINK" = "$RELEASE_DIR" ]; then
  echo "   ✅ Symlink verification passed"
else
  echo "   ❌ Symlink verification failed"
  exit 1
fi
EOF

# Cleanup old releases
echo ""
echo -e "${YELLOW}[8/9] Cleaning up old releases...${NC}"

ssh $DEPLOY_USER@$DEPLOY_HOST bash <<EOF
set -e
cd $REMOTE_DIR/releases

# Keep only the latest MAX_RELEASES releases
RELEASE_COUNT=\$(ls -1t | wc -l)
if [ \$RELEASE_COUNT -gt $MAX_RELEASES ]; then
  echo "   Found \$RELEASE_COUNT releases, keeping latest $MAX_RELEASES"
  ls -1t | tail -n +\$((MAX_RELEASES + 1)) | xargs rm -rf
  echo "   ✅ Cleaned old releases"
else
  echo "   ✅ Only \$RELEASE_COUNT releases, no cleanup needed"
fi
EOF

# Verify deployment
echo ""
echo -e "${YELLOW}[9/9] Verifying deployment...${NC}"

# Test HTTP response
HEALTH_URL="https://usecordy.com"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
  echo -e "   ${GREEN}✅ Site responding (HTTP $HTTP_CODE)${NC}"
else
  echo -e "   ${YELLOW}⚠️  Site returned HTTP $HTTP_CODE${NC}"
  echo "   Manually verify: $HEALTH_URL"
fi

# Success summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║             Deployment Successful! ✅                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Details:${NC}"
echo "   Release:      $TIMESTAMP"
echo "   Build size:   $BUILD_SIZE"
echo "   File count:   $FILE_COUNT"
echo "   Live at:      $HEALTH_URL"
echo ""
echo -e "${BLUE}🔄 Rollback Command:${NC}"
echo -e "   ${GREEN}./scripts/rollback-frontend.sh${NC}"
echo ""
echo -e "${BLUE}🔍 Verify in Browser:${NC}"
echo -e "   ${GREEN}$HEALTH_URL${NC}"
echo -e "   (Press Ctrl+Shift+R to force cache refresh)"
echo ""
echo -e "${GREEN}Deployment completed at: $(date)${NC}"
