variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "apexai-crm"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# Database Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "crm"
}

# Cache Configuration
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

# ECS Configuration
variable "server_cpu" {
  description = "CPU units for server container (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "server_memory" {
  description = "Memory for server container in MB"
  type        = number
  default     = 1024
}

variable "studio_cpu" {
  description = "CPU units for studio container"
  type        = number
  default     = 512
}

variable "studio_memory" {
  description = "Memory for studio container in MB"
  type        = number
  default     = 1024
}

variable "server_desired_count" {
  description = "Desired number of server tasks"
  type        = number
  default     = 2
}

variable "studio_desired_count" {
  description = "Desired number of studio tasks"
  type        = number
  default     = 2
}

variable "server_min_count" {
  description = "Minimum number of server tasks for auto-scaling"
  type        = number
  default     = 2
}

variable "server_max_count" {
  description = "Maximum number of server tasks for auto-scaling"
  type        = number
  default     = 10
}

variable "studio_min_count" {
  description = "Minimum number of studio tasks for auto-scaling"
  type        = number
  default     = 2
}

variable "studio_max_count" {
  description = "Maximum number of studio tasks for auto-scaling"
  type        = number
  default     = 10
}

# Secrets
variable "firebase_project_id" {
  description = "Firebase project ID"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Google Gemini API key"
  type        = string
  sensitive   = true
}

variable "firebase_api_key" {
  description = "Firebase API key"
  type        = string
  sensitive   = true
}

variable "firebase_auth_domain" {
  description = "Firebase auth domain"
  type        = string
  sensitive   = true
}

variable "openai_api_key" {
  description = "OpenAI API key (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

# Tags
variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "ApexAI-CRM"
    ManagedBy   = "Terraform"
  }
}
