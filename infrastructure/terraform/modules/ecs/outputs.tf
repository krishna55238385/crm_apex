output "cluster_id" {
  description = "ECS cluster ID"
  value       = aws_ecs_cluster.main.id
}

output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "server_service_name" {
  description = "Server service name"
  value       = aws_ecs_service.server.name
}

output "studio_service_name" {
  description = "Studio service name"
  value       = aws_ecs_service.studio.name
}

output "server_log_group" {
  description = "CloudWatch log group for server"
  value       = aws_cloudwatch_log_group.server.name
}

output "studio_log_group" {
  description = "CloudWatch log group for studio"
  value       = aws_cloudwatch_log_group.studio.name
}

output "task_execution_role_arn" {
  description = "ECS task execution role ARN"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "task_role_arn" {
  description = "ECS task role ARN"
  value       = aws_iam_role.ecs_task.arn
}
