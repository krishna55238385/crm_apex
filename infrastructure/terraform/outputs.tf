output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "alb_url" {
  description = "URL to access the application"
  value       = "http://${module.alb.alb_dns_name}"
}

output "ecr_server_repository_url" {
  description = "ECR repository URL for server image"
  value       = module.ecr.server_repository_url
}

output "ecr_studio_repository_url" {
  description = "ECR repository URL for studio image"
  value       = module.ecr.studio_repository_url
}

output "rds_endpoint" {
  description = "RDS MySQL endpoint"
  value       = module.database.db_endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.cache.redis_endpoint
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "server_service_name" {
  description = "ECS server service name"
  value       = module.ecs.server_service_name
}

output "studio_service_name" {
  description = "ECS studio service name"
  value       = module.ecs.studio_service_name
}

output "cloudwatch_log_group_server" {
  description = "CloudWatch log group for server"
  value       = module.ecs.server_log_group
}

output "cloudwatch_log_group_studio" {
  description = "CloudWatch log group for studio"
  value       = module.ecs.studio_log_group
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.network.vpc_id
}

output "deployment_instructions" {
  description = "Next steps after infrastructure deployment"
  value       = <<-EOT
    
    ========================================
    🎉 Infrastructure Deployed Successfully!
    ========================================
    
    Application URL: http://${module.alb.alb_dns_name}
    
    Next Steps:
    1. Build and push Docker images:
       cd /Users/krishnaprasad/Documents/CRM
       ./infrastructure/scripts/build-and-push.sh
    
    2. Access your application:
       Frontend: http://${module.alb.alb_dns_name}
       Backend API: http://${module.alb.alb_dns_name}/api/health
    
    3. View logs:
       aws logs tail ${module.ecs.server_log_group} --follow
       aws logs tail ${module.ecs.studio_log_group} --follow
    
    4. Monitor ECS services:
       aws ecs describe-services --cluster ${module.ecs.cluster_name} --services ${module.ecs.server_service_name}
    
    ========================================
  EOT
}
