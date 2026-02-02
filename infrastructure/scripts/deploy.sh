#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ApexAI CRM - AWS Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if environment is provided
ENVIRONMENT=${1:-dev}
echo -e "${YELLOW}Deploying to environment: ${ENVIRONMENT}${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Terraform is not installed. Please install it first.${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites installed${NC}"
echo ""

# Navigate to terraform directory
cd "$(dirname "$0")/../terraform"

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo -e "${YELLOW}terraform.tfvars not found. Creating from example...${NC}"
    cp terraform.tfvars.example terraform.tfvars
    echo -e "${RED}Please edit terraform.tfvars with your actual values and run this script again.${NC}"
    exit 1
fi

# Initialize Terraform
echo -e "${YELLOW}Initializing Terraform...${NC}"
terraform init

# Validate Terraform configuration
echo -e "${YELLOW}Validating Terraform configuration...${NC}"
terraform validate

# Plan infrastructure changes
echo -e "${YELLOW}Planning infrastructure changes...${NC}"
terraform plan -out=tfplan

# Ask for confirmation
echo ""
read -p "Do you want to apply these changes? (yes/no): " -r
echo ""
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 1
fi

# Apply infrastructure changes
echo -e "${YELLOW}Applying infrastructure changes...${NC}"
terraform apply tfplan

# Get ECR repository URLs
echo -e "${YELLOW}Getting ECR repository URLs...${NC}"
SERVER_REPO=$(terraform output -raw ecr_server_repository_url)
STUDIO_REPO=$(terraform output -raw ecr_studio_repository_url)
AWS_REGION=$(terraform output -raw aws_region || echo "us-east-1")

echo -e "${GREEN}✓ Infrastructure deployed successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Build and push Docker images:"
echo "   cd ../../"
echo "   ./infrastructure/scripts/build-and-push.sh"
echo ""
echo "2. Access your application:"
terraform output deployment_instructions

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
