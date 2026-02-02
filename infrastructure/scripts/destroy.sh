#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${RED}========================================${NC}"
echo -e "${RED}  Destroying AWS Infrastructure${NC}"
echo -e "${RED}========================================${NC}"
echo ""

# Check if environment is provided
ENVIRONMENT=${1:-dev}
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Warning
echo -e "${RED}WARNING: This will destroy all AWS resources!${NC}"
echo -e "${RED}This action cannot be undone.${NC}"
echo ""
read -p "Are you absolutely sure? Type 'destroy' to confirm: " -r
echo ""

if [[ ! $REPLY == "destroy" ]]; then
    echo -e "${GREEN}Destruction cancelled.${NC}"
    exit 0
fi

# Navigate to terraform directory
cd "$(dirname "$0")/../terraform"

# Destroy infrastructure
echo -e "${YELLOW}Destroying infrastructure...${NC}"
terraform destroy

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Infrastructure Destroyed${NC}"
echo -e "${GREEN}========================================${NC}"
