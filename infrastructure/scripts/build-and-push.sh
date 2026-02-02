#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Building and Pushing Docker Images${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Navigate to project root
cd "$(dirname "$0")/../../"

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo -e "${YELLOW}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"
echo -e "${YELLOW}AWS Region: ${AWS_REGION}${NC}"
echo ""

# Login to ECR
echo -e "${YELLOW}Logging in to Amazon ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Get repository URLs from Terraform
cd infrastructure/terraform
SERVER_REPO=$(terraform output -raw ecr_server_repository_url)
STUDIO_REPO=$(terraform output -raw ecr_studio_repository_url)
cd ../../

echo -e "${GREEN}✓ Logged in to ECR${NC}"
echo ""

# Build Server Image
echo -e "${YELLOW}Building server image...${NC}"
docker build -t apexai-crm-server:latest ./server
docker tag apexai-crm-server:latest ${SERVER_REPO}:latest
docker tag apexai-crm-server:latest ${SERVER_REPO}:$(git rev-parse --short HEAD || echo "manual")

echo -e "${GREEN}✓ Server image built${NC}"
echo ""

# Build Studio Image
echo -e "${YELLOW}Building studio image...${NC}"
docker build -t apexai-crm-studio:latest ./studio
docker tag apexai-crm-studio:latest ${STUDIO_REPO}:latest
docker tag apexai-crm-studio:latest ${STUDIO_REPO}:$(git rev-parse --short HEAD || echo "manual")

echo -e "${GREEN}✓ Studio image built${NC}"
echo ""

# Push Server Image
echo -e "${YELLOW}Pushing server image to ECR...${NC}"
docker push ${SERVER_REPO}:latest
docker push ${SERVER_REPO}:$(git rev-parse --short HEAD || echo "manual")

echo -e "${GREEN}✓ Server image pushed${NC}"
echo ""

# Push Studio Image
echo -e "${YELLOW}Pushing studio image to ECR...${NC}"
docker push ${STUDIO_REPO}:latest
docker push ${STUDIO_REPO}:$(git rev-parse --short HEAD || echo "manual")

echo -e "${GREEN}✓ Studio image pushed${NC}"
echo ""

# Update ECS services
echo -e "${YELLOW}Updating ECS services...${NC}"
cd infrastructure/terraform
CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
SERVER_SERVICE=$(terraform output -raw server_service_name)
STUDIO_SERVICE=$(terraform output -raw studio_service_name)

aws ecs update-service --cluster ${CLUSTER_NAME} --service ${SERVER_SERVICE} --force-new-deployment --region ${AWS_REGION} > /dev/null
aws ecs update-service --cluster ${CLUSTER_NAME} --service ${STUDIO_SERVICE} --force-new-deployment --region ${AWS_REGION} > /dev/null

echo -e "${GREEN}✓ ECS services updated${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Build and Push Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Your application is being deployed...${NC}"
echo -e "${YELLOW}It may take 2-3 minutes for the new tasks to become healthy.${NC}"
echo ""
echo "Monitor deployment status:"
echo "  aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVER_SERVICE} ${STUDIO_SERVICE} --region ${AWS_REGION}"
