# Terraform Backend Configuration
# 
# IMPORTANT: Before using this backend, you need to create:
# 1. S3 bucket for state storage
# 2. DynamoDB table for state locking
#
# Run these commands first:
# aws s3api create-bucket --bucket apexai-crm-terraform-state --region us-east-1
# aws dynamodb create-table \
#   --table-name apexai-crm-terraform-locks \
#   --attribute-definitions AttributeName=LockID,AttributeType=S \
#   --key-schema AttributeName=LockID,KeyType=HASH \
#   --billing-mode PAY_PER_REQUEST \
#   --region us-east-1
#
# Uncomment the backend configuration below after creating these resources:

# terraform {
#   backend "s3" {
#     bucket         = "apexai-crm-terraform-state"
#     key            = "terraform.tfstate"
#     region         = "us-east-1"
#     encrypt        = true
#     dynamodb_table = "apexai-crm-terraform-locks"
#   }
# }
