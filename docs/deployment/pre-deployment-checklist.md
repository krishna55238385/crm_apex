# AWS Deployment Pre-Flight Checklist

Complete this checklist before deploying to AWS to ensure a smooth deployment.

---

## ✅ Prerequisites Check

### 1. AWS Account & Credentials

- [ ] **AWS Account Created**
  - Have an active AWS account
  - Billing information configured
  - Free tier or budget alerts set up (recommended)

- [ ] **AWS CLI Installed**
  ```bash
  aws --version
  # Should show: aws-cli/2.x.x or higher
  ```

- [ ] **AWS Credentials Configured**
  ```bash
  aws configure list
  # Should show your access key and region
  ```

- [ ] **AWS Credentials Valid**
  ```bash
  aws sts get-caller-identity
  # Should return your Account ID, UserId, and Arn
  ```

- [ ] **IAM Permissions Verified**
  - Your AWS user/role has permissions for:
    - ✓ VPC, EC2, ECS, RDS, ElastiCache
    - ✓ ECR, ALB, CloudWatch, Secrets Manager
    - ✓ IAM (to create roles)

### 2. Required Tools

- [ ] **Terraform Installed**
  ```bash
  terraform --version
  # Should show: Terraform v1.0.0 or higher
  ```

- [ ] **Docker Installed & Running**
  ```bash
  docker --version
  docker ps
  # Should show Docker version and running containers
  ```

- [ ] **Git Installed** (for version tagging)
  ```bash
  git --version
  ```

---

## 🔐 Configuration Check

### 3. Environment Variables & Secrets

- [ ] **Firebase Configuration Ready**
  - [ ] Firebase project created
  - [ ] Firebase project ID: `crm-d7d25` ✓
  - [ ] Firebase API key available
  - [ ] Firebase auth domain available
  - [ ] Firebase service account credentials (if needed)

- [ ] **API Keys Available**
  - [ ] Google Gemini API key: `AIzaSyCzH-siZ5JNDP4nWnl7cux25iJ9xRs8wDY` ✓
  - [ ] OpenAI API key (optional)

- [ ] **Terraform Variables File Created**
  ```bash
  cd infrastructure/terraform
  ls terraform.tfvars
  # Should exist and contain your actual values
  ```

- [ ] **Review terraform.tfvars**
  - [ ] `firebase_project_id` is correct
  - [ ] `gemini_api_key` is correct
  - [ ] `firebase_api_key` is correct
  - [ ] `firebase_auth_domain` is correct
  - [ ] `aws_region` is set (default: us-east-1)
  - [ ] `environment` is set (dev or prod)

---

## 🏗️ Infrastructure Validation

### 4. Terraform Configuration

- [ ] **Terraform Files Present**
  ```bash
  cd /Users/krishnaprasad/Documents/CRM/infrastructure/terraform
  ls *.tf
  # Should show: main.tf, variables.tf, outputs.tf, versions.tf, backend.tf
  ```

- [ ] **Terraform Modules Present**
  ```bash
  ls modules/
  # Should show: alb, cache, database, ecr, ecs, network, secrets
  ```

- [ ] **Terraform Initialize (Dry Run)**
  ```bash
  terraform init
  # Should complete without errors
  ```

- [ ] **Terraform Validate**
  ```bash
  terraform validate
  # Should show: "Success! The configuration is valid."
  ```

- [ ] **Terraform Plan (Review)**
  ```bash
  terraform plan
  # Review the resources that will be created
  # Should show ~50-60 resources to be created
  ```

---

## 🐳 Application Check

### 5. Docker Images

- [ ] **Server Dockerfile Exists**
  ```bash
  ls /Users/krishnaprasad/Documents/CRM/server/Dockerfile
  ```

- [ ] **Studio Dockerfile Exists**
  ```bash
  ls /Users/krishnaprasad/Documents/CRM/studio/Dockerfile
  ```

- [ ] **Server Builds Locally** (Optional but recommended)
  ```bash
  cd /Users/krishnaprasad/Documents/CRM/server
  docker build -t test-server .
  # Should complete successfully
  ```

- [ ] **Studio Builds Locally** (Optional but recommended)
  ```bash
  cd /Users/krishnaprasad/Documents/CRM/studio
  docker build -t test-studio .
  # Should complete successfully
  ```

### 6. Database Schema

- [ ] **Prisma Schema Exists**
  ```bash
  ls /Users/krishnaprasad/Documents/CRM/server/prisma/schema.prisma
  ```

- [ ] **Prisma Migrations Ready**
  ```bash
  ls /Users/krishnaprasad/Documents/CRM/server/prisma/migrations/
  # Should contain migration files
  ```

---

## 💰 Cost & Budget Check

### 7. Cost Awareness

- [ ] **Understand Monthly Costs**
  - Development: ~$150-200/month
  - Production: ~$300-500/month

- [ ] **AWS Budget Alert Set** (Recommended)
  ```bash
  # Set up in AWS Console → Billing → Budgets
  # Create alert for $200/month (dev) or $500/month (prod)
  ```

- [ ] **Understand Resource Costs**
  - NAT Gateway: ~$35/month (largest single cost)
  - RDS MySQL: ~$15/month (dev)
  - ECS Fargate: ~$50/month (4 tasks)
  - ALB: ~$20/month
  - ElastiCache: ~$12/month

---

## 🚀 Deployment Scripts

### 8. Scripts Ready

- [ ] **Deployment Script Executable**
  ```bash
  ls -la /Users/krishnaprasad/Documents/CRM/infrastructure/scripts/deploy.sh
  # Should show: -rwxr-xr-x (executable)
  ```

- [ ] **Build Script Executable**
  ```bash
  ls -la /Users/krishnaprasad/Documents/CRM/infrastructure/scripts/build-and-push.sh
  # Should show: -rwxr-xr-x (executable)
  ```

- [ ] **Destroy Script Executable**
  ```bash
  ls -la /Users/krishnaprasad/Documents/CRM/infrastructure/scripts/destroy.sh
  # Should show: -rwxr-xr-x (executable)
  ```

---

## 🔒 Security Review

### 9. Security Best Practices

- [ ] **No Hardcoded Secrets in Code**
  - Check that `.env` files are in `.gitignore`
  - Verify no API keys in source code

- [ ] **Terraform State Security** (Optional for first deployment)
  - [ ] S3 bucket created for remote state (optional)
  - [ ] DynamoDB table created for state locking (optional)
  - Note: Can use local state for first deployment

- [ ] **Review Security Groups**
  - Database and Redis will be in private subnets ✓
  - Only ALB will be publicly accessible ✓

---

## 📝 Documentation Review

### 10. Documentation Check

- [ ] **Read Deployment Guide**
  - [ ] Reviewed `/Users/krishnaprasad/Documents/CRM/docs/deployment/aws-setup-guide.md`

- [ ] **Understand Architecture**
  - [ ] Reviewed `/Users/krishnaprasad/Documents/CRM/docs/deployment/architecture-diagram.md`

- [ ] **Understand Rollback Process**
  - Know how to destroy infrastructure if needed
  - Understand that data will be lost on destroy

---

## 🎯 Final Checks

### 11. Pre-Deployment Verification

- [ ] **Local Application Working**
  ```bash
  # Verify your app works locally first
  cd /Users/krishnaprasad/Documents/CRM
  docker-compose up
  # Test at http://localhost:9002
  ```

- [ ] **Git Repository Clean** (Recommended)
  ```bash
  git status
  # Commit any pending changes
  git add .
  git commit -m "Pre-deployment commit"
  ```

- [ ] **Backup Important Data**
  - If you have local database data you want to keep
  - Export any important configurations

### 12. Time & Availability

- [ ] **Allocate Sufficient Time**
  - Infrastructure deployment: ~20-30 minutes
  - Application build & push: ~5-10 minutes
  - Testing & verification: ~10-15 minutes
  - **Total: ~45-60 minutes**

- [ ] **Stable Internet Connection**
  - Deployment requires uploading Docker images (~500MB-1GB)

- [ ] **Ready to Monitor**
  - Have terminal ready for viewing logs
  - AWS Console open (optional)

---

## 🚦 Ready to Deploy?

### If ALL boxes are checked above:

```bash
# You're ready! Run these commands:

cd /Users/krishnaprasad/Documents/CRM

# 1. Deploy infrastructure
./infrastructure/scripts/deploy.sh dev

# 2. Build and push application
./infrastructure/scripts/build-and-push.sh

# 3. Get your application URL
cd infrastructure/terraform
terraform output alb_url
```

### If ANY boxes are NOT checked:

**Stop!** Complete the missing items before deploying.

Common missing items:
1. **terraform.tfvars not configured** → Copy from example and fill in values
2. **AWS credentials not set** → Run `aws configure`
3. **Terraform not installed** → Run `brew install terraform`
4. **Docker not running** → Start Docker Desktop

---

## 🆘 Quick Troubleshooting

### Common Pre-Deployment Issues

**Issue: AWS credentials not working**
```bash
aws configure
# Re-enter your credentials
aws sts get-caller-identity  # Verify
```

**Issue: Terraform validation fails**
```bash
cd infrastructure/terraform
terraform init
terraform validate
# Check error messages
```

**Issue: Docker build fails**
```bash
# Check Docker is running
docker ps

# Try building manually
cd server
docker build -t test .
```

**Issue: Missing terraform.tfvars**
```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit with your values
```

---

## 📞 Need Help?

- Review [AWS Setup Guide](./aws-setup-guide.md)
- Check [Architecture Documentation](./architecture-diagram.md)
- Review [Walkthrough](../../.gemini/antigravity/brain/2f68d951-a5b6-4a9b-835f-483e1614f8fc/walkthrough.md)

---

## ✅ Checklist Summary

**Total Items:** 50+  
**Estimated Time to Complete:** 15-30 minutes  
**Critical Items:** AWS credentials, Terraform variables, Docker running  

**Once complete, you're ready to deploy! 🚀**
