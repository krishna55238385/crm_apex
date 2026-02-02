output "server_repository_url" {
  description = "Server ECR repository URL"
  value       = aws_ecr_repository.server.repository_url
}

output "studio_repository_url" {
  description = "Studio ECR repository URL"
  value       = aws_ecr_repository.studio.repository_url
}

output "server_repository_name" {
  description = "Server ECR repository name"
  value       = aws_ecr_repository.server.name
}

output "studio_repository_name" {
  description = "Studio ECR repository name"
  value       = aws_ecr_repository.studio.name
}
