# AWS Deployment Guide

Complete guide for deploying ApexAI CRM to AWS using ECS Fargate and Terraform.

## Prerequisites

### 1. AWS Account Setup

You'll need an AWS account with the following permissions:
- IAM (to create roles and policies)
- VPC (to create network resources)
- ECS (to create clusters and services)
- RDS (to create MySQL database)
- ElastiCache (to create Redis cluster)
- ECR (to store Docker images)
- Application Load Balancer
- CloudWatch (for logs and monitoring)
- Secrets Manager (for secure credential storage)

### 2. Install Required Tools

**AWS CLI:**
```bash
# macOS
brew install awscli

# Verify installation
aws --version
```

**Terraform:**
```bash
# macOS
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Verify installation
terraform --version
```

**Docker:**
- Download and install Docker Desktop from https://www.docker.com/products/docker-desktop

### 3. Configure AWS Credentials

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format (e.g., `json`)

Verify configuration:
```bash
aws sts get-caller-identity
```

---

## Deployment Steps

### Step 1: Prepare Terraform Variables

1. Navigate to the terraform directory:
```bash
cd infrastructure/terraform
```

2. Copy the example variables file:
```bash
cp terraform.tfvars.example terraform.tfvars
```

3. Edit `terraform.tfvars` with your actual values:
```bash
# Use your preferred editor
nano terraform.tfvars
# or
code terraform.tfvars
```

**Important:** Update these values:
- `firebase_project_id` - Your Firebase project ID
- `gemini_api_key` - Your Google Gemini API key
- `firebase_api_key` - Your Firebase API key
- `firebase_auth_domain` - Your Firebase auth domain
- `openai_api_key` - (Optional) Your OpenAI API key

### Step 2: Deploy Infrastructure

Run the deployment script:
```bash
cd ../..  # Back to project root
./infrastructure/scripts/deploy.sh dev
```

This script will:
1. ✅ Initialize Terraform
2. ✅ Validate configuration
3. ✅ Show you a plan of changes
4. ⏸️ Ask for confirmation
5. ✅ Create all AWS resources (~15-20 minutes)

**Expected resources created:**
- VPC with public and private subnets
- NAT Gateway and Internet Gateway
- RDS MySQL database
- ElastiCache Redis cluster
- ECS Fargate cluster
- Application Load Balancer
- ECR repositories
- CloudWatch log groups
- IAM roles and policies
- Secrets Manager secrets

### Step 3: Build and Push Docker Images

After infrastructure is deployed:
```bash
./infrastructure/scripts/build-and-push.sh
```

This script will:
1. ✅ Build server Docker image
2. ✅ Build studio Docker image
3. ✅ Push images to ECR
4. ✅ Update ECS services with new images

**Note:** First deployment may take 3-5 minutes for tasks to become healthy.

### Step 4: Access Your Application

Get the application URL:
```bash
cd infrastructure/terraform
terraform output alb_url
```

Visit the URL in your browser. Example:
```
http://apexai-crm-dev-alb-1234567890.us-east-1.elb.amazonaws.com
```

---

## Monitoring and Logs

### View Application Logs

**Server logs:**
```bash
aws logs tail /ecs/apexai-crm-dev-server --follow
```

**Studio logs:**
```bash
aws logs tail /ecs/apexai-crm-dev-studio --follow
```

### Check ECS Service Status

```bash
aws ecs describe-services \
  --cluster apexai-crm-dev-cluster \
  --services apexai-crm-dev-server apexai-crm-dev-studio
```

### View Running Tasks

```bash
aws ecs list-tasks \
  --cluster apexai-crm-dev-cluster \
  --service-name apexai-crm-dev-server
```

---

## CI/CD with GitHub Actions

### Setup GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

1. `AWS_ACCESS_KEY_ID` - Your AWS access key
2. `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
3. `AWS_ACCOUNT_ID` - Your AWS account ID (12-digit number)

### Automatic Deployments

Once configured, pushes to branches will trigger automatic deployments:
- `main` branch → Production environment
- `develop` branch → Development environment

---

## Cost Estimation

### Development Environment (~$150-200/month)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| **RDS MySQL** | db.t3.micro (20GB) | ~$15 |
| **ElastiCache Redis** | cache.t3.micro | ~$12 |
| **ECS Fargate** | 4 tasks (512 CPU, 1GB RAM) | ~$50 |
| **Application Load Balancer** | 1 ALB | ~$20 |
| **NAT Gateway** | 1 NAT Gateway | ~$35 |
| **Data Transfer** | Moderate usage | ~$10 |
| **CloudWatch Logs** | 7-day retention | ~$5 |
| **ECR Storage** | ~10 images | ~$1 |

### Production Environment (~$300-500/month)

- Multi-AZ RDS: ~$30
- Larger instance types: +$100
- More ECS tasks: +$100
- Additional monitoring: +$20

### Cost Optimization Tips

1. **Use Reserved Instances** for RDS (save 30-40%)
2. **Enable auto-scaling** to scale down during low traffic
3. **Use S3 for static assets** instead of serving from ECS
4. **Set up CloudWatch alarms** to monitor costs
5. **Delete unused ECR images** regularly

---

## Updating Your Application

### Manual Update

```bash
./infrastructure/scripts/build-and-push.sh
```

### Via GitHub Actions

Simply push to `main` or `develop` branch:
```bash
git add .
git commit -m "Update application"
git push origin main
```

---

## Scaling Your Application

### Manual Scaling

Update `terraform.tfvars`:
```hcl
server_desired_count = 4  # Increase from 2 to 4
studio_desired_count = 4
```

Apply changes:
```bash
cd infrastructure/terraform
terraform apply
```

### Auto-Scaling

Auto-scaling is already configured! Services will automatically scale between min and max counts based on CPU utilization (target: 70%).

---

## Troubleshooting

### Issue: Tasks keep restarting

**Check logs:**
```bash
aws logs tail /ecs/apexai-crm-dev-server --follow
```

**Common causes:**
- Database connection issues
- Missing environment variables
- Application crashes

### Issue: Can't access application

**Check ALB health:**
```bash
aws elbv2 describe-target-health \
  --target-group-arn $(terraform output -raw server_target_group_arn)
```

**Common causes:**
- Security group misconfiguration
- Health check endpoint failing
- Tasks not running

### Issue: Database connection timeout

**Verify security groups:**
```bash
# Check if ECS tasks can reach RDS
aws ec2 describe-security-groups \
  --group-ids $(terraform output -raw rds_security_group_id)
```

---

## Destroying Infrastructure

**⚠️ WARNING: This will delete all resources and data!**

```bash
./infrastructure/scripts/destroy.sh dev
```

Type `destroy` when prompted to confirm.

---

## Next Steps

1. **Set up custom domain:**
   - Register domain in Route 53
   - Create ACM certificate
   - Update ALB listener for HTTPS

2. **Enable monitoring:**
   - Set up CloudWatch dashboards
   - Configure alarms for errors
   - Enable X-Ray tracing

3. **Implement backups:**
   - Verify RDS automated backups
   - Set up cross-region replication
   - Test restore procedures

4. **Security hardening:**
   - Enable WAF on ALB
   - Implement VPC Flow Logs
   - Set up AWS Config rules

---

## Support

For issues or questions:
1. Check CloudWatch logs
2. Review ECS service events
3. Verify Terraform outputs
4. Check GitHub Actions logs (for CI/CD issues)
