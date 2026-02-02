# Network Module
module "network" {
  source = "./modules/network"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
}

# ECR Module
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

# Database Module
module "database" {
  source = "./modules/database"

  project_name        = var.project_name
  environment         = var.environment
  instance_class      = var.db_instance_class
  allocated_storage   = var.db_allocated_storage
  db_name             = var.db_name
  private_subnet_ids  = module.network.private_subnet_ids
  security_group_id   = module.network.rds_security_group_id
}

# Cache Module
module "cache" {
  source = "./modules/cache"

  project_name       = var.project_name
  environment        = var.environment
  node_type          = var.redis_node_type
  private_subnet_ids = module.network.private_subnet_ids
  security_group_id  = module.network.redis_security_group_id
}

# Secrets Module
module "secrets" {
  source = "./modules/secrets"

  project_name          = var.project_name
  environment           = var.environment
  db_username           = module.database.db_username
  db_password           = module.database.db_password
  db_endpoint           = module.database.db_endpoint
  db_name               = module.database.db_name
  db_connection_string  = module.database.db_connection_string
  firebase_project_id   = var.firebase_project_id
  firebase_api_key      = var.firebase_api_key
  firebase_auth_domain  = var.firebase_auth_domain
  gemini_api_key        = var.gemini_api_key
  openai_api_key        = var.openai_api_key
}

# ALB Module
module "alb" {
  source = "./modules/alb"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.network.vpc_id
  public_subnet_ids  = module.network.public_subnet_ids
  security_group_id  = module.network.alb_security_group_id
}

# ECS Module
module "ecs" {
  source = "./modules/ecs"

  project_name              = var.project_name
  environment               = var.environment
  aws_region                = var.aws_region
  private_subnet_ids        = module.network.private_subnet_ids
  ecs_security_group_id     = module.network.ecs_tasks_security_group_id
  server_target_group_arn   = module.alb.server_target_group_arn
  studio_target_group_arn   = module.alb.studio_target_group_arn
  alb_listener_arn          = module.alb.alb_arn
  alb_dns_name              = module.alb.alb_dns_name
  server_image              = module.ecr.server_repository_url
  studio_image              = module.ecr.studio_repository_url
  server_cpu                = var.server_cpu
  server_memory             = var.server_memory
  studio_cpu                = var.studio_cpu
  studio_memory             = var.studio_memory
  server_desired_count      = var.server_desired_count
  studio_desired_count      = var.studio_desired_count
  server_min_count          = var.server_min_count
  server_max_count          = var.server_max_count
  studio_min_count          = var.studio_min_count
  studio_max_count          = var.studio_max_count
  db_connection_string      = module.database.db_connection_string
  redis_url                 = module.cache.redis_url
  firebase_project_id       = var.firebase_project_id
  firebase_api_key          = var.firebase_api_key
  firebase_auth_domain      = var.firebase_auth_domain
  gemini_api_key            = var.gemini_api_key
  secrets_arns = [
    module.secrets.db_credentials_arn,
    module.secrets.firebase_config_arn,
    module.secrets.api_keys_arn
  ]
}
