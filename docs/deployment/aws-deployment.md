# AWS Deployment Guide

Complete guide for deploying the CRM application to AWS using Terraform and ECS Fargate.

---

## 📋 Prerequisites

### Required Tools
- AWS CLI configured with credentials
- Terraform >= 1.0
- Docker
- Git

### AWS Account Setup
- AWS account with appropriate permissions
- IAM user with AdministratorAccess (or specific permissions)
- AWS CLI configured: `aws configure`

---

## 🚀 Deployment Steps

### Step 1: Configure Terraform Variables

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
# AWS Configuration
aws_region = "us-east-1"
environment = "prod"  # or "dev"
project_name = "apexai-crm"

# Network
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

# Database
db_instance_class = "db.t3.medium"  # prod
db_allocated_storage = 100

# Cache
redis_node_type = "cache.t3.small"  # prod

# ECS
server_cpu = 1024
server_memory = 2048
studio_cpu = 1024
studio_memory = 2048

# Scaling
server_desired_count = 3
server_min_count = 2
server_max_count = 10

# Secrets (REQUIRED)
firebase_project_id = "your-project-id"
firebase_api_key = "your-api-key"
firebase_auth_domain = "your-auth-domain"
gemini_api_key = "your-gemini-key"
```

---

### Step 2: Deploy Infrastructure

```bash
# From project root
./infrastructure/scripts/deploy.sh prod
```

This script will:
1. Initialize Terraform
2. Create VPC and networking
3. Deploy RDS MySQL (Multi-AZ)
4. Deploy ElastiCache Redis
5. Create ECS cluster
6. Set up Application Load Balancer
7. Configure auto-scaling
8. Set up CloudWatch logging

**Duration**: ~15-20 minutes

---

### Step 3: Build and Push Docker Images

```bash
./infrastructure/scripts/build-and-push.sh
```

This will:
1. Build backend Docker image
2. Build frontend Docker image
3. Push to Amazon ECR
4. Update ECS services

**Duration**: ~10 minutes

---

### Step 4: Verify Deployment

```bash
# Get ALB URL
cd infrastructure/terraform
terraform output alb_url

# Test health endpoint
curl http://<alb-url>/health

# Expected response:
# {"status":"OK"}
```

---

### Step 5: Configure DNS (Optional)

```bash
# Get ALB DNS name
terraform output alb_dns_name

# Create CNAME record in your DNS provider:
# api.yourdomain.com -> <alb-dns-name>
```

---

## 🔐 Secrets Management

All sensitive data is stored in AWS Secrets Manager:

```bash
# View secrets
aws secretsmanager list-secrets

# Get secret value
aws secretsmanager get-secret-value \
  --secret-id apexai-crm-prod-db-credentials
```

---

## 📊 Monitoring

### CloudWatch Logs

```bash
# View server logs
aws logs tail /ecs/apexai-crm-prod-server --follow

# View studio logs
aws logs tail /ecs/apexai-crm-prod-studio --follow
```

### ECS Service Status

```bash
aws ecs describe-services \
  --cluster apexai-crm-prod-cluster \
  --services apexai-crm-prod-server apexai-crm-prod-studio
```

### Metrics

```bash
# CPU utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=apexai-crm-prod-server \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

---

## 🔄 Updates and Rollbacks

### Deploy New Version

```bash
# Build and push new images
./infrastructure/scripts/build-and-push.sh

# ECS will automatically deploy new version
```

### Rollback

```bash
# Option 1: Redeploy previous image tag
aws ecs update-service \
  --cluster apexai-crm-prod-cluster \
  --service apexai-crm-prod-server \
  --force-new-deployment

# Option 2: Use Terraform
cd infrastructure/terraform
terraform apply -var="server_image_tag=previous-tag"
```

---

## 🧹 Cleanup

To destroy all infrastructure:

```bash
./infrastructure/scripts/destroy.sh prod
```

**Warning**: This will delete all resources including databases!

---

## 💰 Cost Optimization

### Production (~$431/month)
- Use Reserved Instances for RDS (save 30-40%)
- Use Savings Plans for ECS (save 20-30%)
- Enable S3 lifecycle policies
- Use CloudFront for static assets

### Development (~$171/month)
- Use smaller instance types
- Stop services during off-hours
- Use single-AZ RDS
- Limit auto-scaling

---

## 🔧 Troubleshooting

### ECS Tasks Not Starting

```bash
# Check task logs
aws ecs describe-tasks \
  --cluster apexai-crm-prod-cluster \
  --tasks <task-id>

# Check stopped tasks
aws ecs list-tasks \
  --cluster apexai-crm-prod-cluster \
  --desired-status STOPPED
```

### Database Connection Issues

```bash
# Verify security group rules
aws ec2 describe-security-groups \
  --group-ids <rds-security-group-id>

# Test connection from ECS task
aws ecs execute-command \
  --cluster apexai-crm-prod-cluster \
  --task <task-id> \
  --command "mysql -h <rds-endpoint> -u admin -p"
```

### High Costs

```bash
# Check cost by service
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

---

## 📚 Additional Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
