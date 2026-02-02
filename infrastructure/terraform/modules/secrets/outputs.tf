output "db_credentials_arn" {
  description = "ARN of database credentials secret"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "firebase_config_arn" {
  description = "ARN of Firebase configuration secret"
  value       = aws_secretsmanager_secret.firebase_config.arn
}

output "api_keys_arn" {
  description = "ARN of API keys secret"
  value       = aws_secretsmanager_secret.api_keys.arn
}
