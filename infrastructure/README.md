# AWS Deployment - Quick Start

## 🚀 One-Command Deployment

```bash
# 1. Set up your variables
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your Firebase and API keys

# 2. Deploy infrastructure
cd ../..
./infrastructure/scripts/deploy.sh dev

# 3. Build and deploy application
./infrastructure/scripts/build-and-push.sh
```

## 📋 Prerequisites

- AWS CLI configured with credentials
- Terraform installed
- Docker installed
- Firebase project credentials

## 📚 Documentation

- **[Complete Setup Guide](./docs/deployment/aws-setup-guide.md)** - Step-by-step deployment instructions
- **[Architecture Diagram](./docs/deployment/architecture-diagram.md)** - Infrastructure overview and design

## 💰 Estimated Costs

- **Development**: ~$150-200/month
- **Production**: ~$300-500/month

## 🔧 Common Commands

```bash
# View application URL
cd infrastructure/terraform && terraform output alb_url

# View logs
aws logs tail /ecs/apexai-crm-dev-server --follow

# Update application
./infrastructure/scripts/build-and-push.sh

# Destroy infrastructure
./infrastructure/scripts/destroy.sh dev
```

## 🏗️ Infrastructure Components

- ✅ VPC with public/private subnets
- ✅ RDS MySQL 8.0
- ✅ ElastiCache Redis 7.0
- ✅ ECS Fargate cluster
- ✅ Application Load Balancer
- ✅ Auto-scaling (2-10 tasks)
- ✅ CloudWatch logging
- ✅ AWS Secrets Manager
- ✅ GitHub Actions CI/CD

## 🔐 Security

- Private subnets for database and application
- Secrets stored in AWS Secrets Manager
- Security groups with least-privilege access
- Encryption at rest for RDS and ECR

## 📊 Monitoring

```bash
# ECS service status
aws ecs describe-services \
  --cluster apexai-crm-dev-cluster \
  --services apexai-crm-dev-server apexai-crm-dev-studio

# View CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=apexai-crm-dev-server \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

## 🆘 Support

See [Troubleshooting Guide](./docs/deployment/aws-setup-guide.md#troubleshooting) for common issues.
