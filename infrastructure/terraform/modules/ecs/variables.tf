variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "server_target_group_arn" {
  description = "ARN of server target group"
  type        = string
}

variable "studio_target_group_arn" {
  description = "ARN of studio target group"
  type        = string
}

variable "alb_listener_arn" {
  description = "ARN of ALB listener (for dependency)"
  type        = string
}

variable "alb_dns_name" {
  description = "DNS name of ALB"
  type        = string
}

variable "server_image" {
  description = "Docker image URL for server"
  type        = string
}

variable "studio_image" {
  description = "Docker image URL for studio"
  type        = string
}

variable "server_cpu" {
  description = "CPU units for server"
  type        = number
}

variable "server_memory" {
  description = "Memory for server in MB"
  type        = number
}

variable "studio_cpu" {
  description = "CPU units for studio"
  type        = number
}

variable "studio_memory" {
  description = "Memory for studio in MB"
  type        = number
}

variable "server_desired_count" {
  description = "Desired count of server tasks"
  type        = number
}

variable "studio_desired_count" {
  description = "Desired count of studio tasks"
  type        = number
}

variable "server_min_count" {
  description = "Minimum count of server tasks"
  type        = number
}

variable "server_max_count" {
  description = "Maximum count of server tasks"
  type        = number
}

variable "studio_min_count" {
  description = "Minimum count of studio tasks"
  type        = number
}

variable "studio_max_count" {
  description = "Maximum count of studio tasks"
  type        = number
}

variable "db_connection_string" {
  description = "Database connection string"
  type        = string
  sensitive   = true
}

variable "redis_url" {
  description = "Redis connection URL"
  type        = string
}

variable "firebase_project_id" {
  description = "Firebase project ID"
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

variable "gemini_api_key" {
  description = "Gemini API key"
  type        = string
  sensitive   = true
}

variable "secrets_arns" {
  description = "List of Secrets Manager ARNs"
  type        = list(string)
}
