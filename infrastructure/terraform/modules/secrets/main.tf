# AWS Secrets Manager - Database Credentials
resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "${var.project_name}-${var.environment}-db-credentials"
  description = "Database credentials for RDS MySQL"

  tags = {
    Name = "${var.project_name}-${var.environment}-db-credentials"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    endpoint = var.db_endpoint
    database = var.db_name
    connection_string = var.db_connection_string
  })
}

# AWS Secrets Manager - Firebase Configuration
resource "aws_secretsmanager_secret" "firebase_config" {
  name        = "${var.project_name}-${var.environment}-firebase-config"
  description = "Firebase configuration"

  tags = {
    Name = "${var.project_name}-${var.environment}-firebase-config"
  }
}

resource "aws_secretsmanager_secret_version" "firebase_config" {
  secret_id = aws_secretsmanager_secret.firebase_config.id
  secret_string = jsonencode({
    project_id  = var.firebase_project_id
    api_key     = var.firebase_api_key
    auth_domain = var.firebase_auth_domain
  })
}

# AWS Secrets Manager - API Keys
resource "aws_secretsmanager_secret" "api_keys" {
  name        = "${var.project_name}-${var.environment}-api-keys"
  description = "API keys for external services"

  tags = {
    Name = "${var.project_name}-${var.environment}-api-keys"
  }
}

resource "aws_secretsmanager_secret_version" "api_keys" {
  secret_id = aws_secretsmanager_secret.api_keys.id
  secret_string = jsonencode({
    gemini_api_key = var.gemini_api_key
    openai_api_key = var.openai_api_key
  })
}
