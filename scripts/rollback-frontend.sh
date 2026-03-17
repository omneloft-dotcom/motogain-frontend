#!/bin/bash
#
# Frontend Rollback Script
#
# This script rolls back the frontend to the previous release
# by switching the 'current' symlink to 'previous'.
#
# Usage:
#   From your local machine (apps/motogain-frontend/):
#   ./scripts/rollback-frontend.sh
#
# Author: MotoGain DevOps
# Last Updated: 2026-03-17

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_HOST="${DEPLOY_HOST:-usecordy.com}"
REMOTE_DIR="/var/www/usecordy"

echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║             Frontend Rollback Script                       ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check SSH connectivity
echo -e "${YELLOW}[1/3] Checking server connection...${NC}"
if ! ssh -o ConnectTimeout=5 $DEPLOY_USER@$DEPLOY_HOST "echo 'SSH OK'" > /dev/null 2>&1; then
  echo -e "${RED}❌ Error: Cannot connect to $DEPLOY_USER@$DEPLOY_HOST${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Connected to server${NC}"

# Get current and previous release info
echo ""
echo -e "${YELLOW}[2/3] Checking release status...${NC}"

RELEASE_INFO=$(ssh $DEPLOY_USER@$DEPLOY_HOST bash <<'EOF'
set -e
cd /var/www/usecordy

# Check if previous release exists
if [ ! -L "previous" ]; then
  echo "ERROR:No previous release available for rollback"
  exit 1
fi

# Get paths
CURRENT_PATH=$(readlink current 2>/dev/null || echo "none")
PREVIOUS_PATH=$(readlink previous 2>/dev/null || echo "none")

# Extract timestamps from paths
CURRENT_RELEASE=$(basename $CURRENT_PATH 2>/dev/null || echo "unknown")
PREVIOUS_RELEASE=$(basename $PREVIOUS_PATH 2>/dev/null || echo "unknown")

echo "CURRENT:$CURRENT_RELEASE"
echo "PREVIOUS:$PREVIOUS_RELEASE"
EOF
)

# Parse response
if [[ $RELEASE_INFO == ERROR:* ]]; then
  ERROR_MSG=$(echo "$RELEASE_INFO" | cut -d':' -f2-)
  echo -e "${RED}❌ $ERROR_MSG${NC}"
  exit 1
fi

CURRENT_RELEASE=$(echo "$RELEASE_INFO" | grep "^CURRENT:" | cut -d':' -f2)
PREVIOUS_RELEASE=$(echo "$RELEASE_INFO" | grep "^PREVIOUS:" | cut -d':' -f2)

echo "   Current:  $CURRENT_RELEASE"
echo "   Previous: $PREVIOUS_RELEASE"
echo ""

# Confirm rollback
echo -e "${RED}⚠️  WARNING: This will rollback frontend to previous release${NC}"
read -p "$(echo -e ${YELLOW}Continue? [y/N]:${NC} )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Rollback cancelled"
  exit 0
fi

# Perform rollback
echo ""
echo -e "${YELLOW}[3/3] Rolling back...${NC}"

ssh $DEPLOY_USER@$DEPLOY_HOST bash <<EOF
set -e
cd $REMOTE_DIR

# Save current as backup
CURRENT_TARGET=\$(readlink current)
ln -sfn \$CURRENT_TARGET backup-before-rollback

# Atomic rollback: point current to previous
PREVIOUS_TARGET=\$(readlink previous)
ln -sfn \$PREVIOUS_TARGET current

echo "   ✅ Rolled back: current -> \$PREVIOUS_TARGET"
EOF

# Verify
echo ""
echo -e "${YELLOW}Verifying rollback...${NC}"
HEALTH_URL="https://usecordy.com"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
  echo -e "   ${GREEN}✅ Site responding (HTTP $HTTP_CODE)${NC}"
else
  echo -e "   ${YELLOW}⚠️  Site returned HTTP $HTTP_CODE${NC}"
fi

# Success
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Rollback Successful! ✅                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Rollback Details:${NC}"
echo "   Rolled back from: $CURRENT_RELEASE"
echo "   Rolled back to:   $PREVIOUS_RELEASE"
echo "   Backup saved as:  backup-before-rollback"
echo ""
echo -e "${BLUE}🔍 Verify in Browser:${NC}"
echo -e "   ${GREEN}$HEALTH_URL${NC}"
echo -e "   (Press Ctrl+Shift+R to force cache refresh)"
echo ""
echo -e "${YELLOW}💡 To re-deploy the rolled-back version:${NC}"
echo -e "   ${GREEN}./scripts/deploy-frontend.sh${NC}"
echo ""
