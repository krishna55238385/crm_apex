# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "server" {
  name              = "/ecs/${var.project_name}-${var.environment}-server"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-server-logs"
  }
}

resource "aws_cloudwatch_log_group" "studio" {
  name              = "/ecs/${var.project_name}-${var.environment}-studio"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-studio-logs"
  }
}

# IAM Role for ECS Task Execution
resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-${var.environment}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-task-execution-role"
  }
}

# Attach AWS managed policy for ECS task execution
resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Policy for Secrets Manager access
resource "aws_iam_role_policy" "secrets_access" {
  name = "${var.project_name}-${var.environment}-secrets-access"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:GetSecretValue"
      ]
      Resource = var.secrets_arns
    }]
  })
}

# IAM Role for ECS Task (application runtime)
resource "aws_iam_role" "ecs_task" {
  name = "${var.project_name}-${var.environment}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-task-role"
  }
}

# Server Task Definition
resource "aws_ecs_task_definition" "server" {
  family                   = "${var.project_name}-${var.environment}-server"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.server_cpu
  memory                   = var.server_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "server"
    image     = "${var.server_image}:latest"
    essential = true

    portMappings = [{
      containerPort = 3000
      protocol      = "tcp"
    }]

    environment = [
      {
        name  = "NODE_ENV"
        value = "production"
      },
      {
        name  = "PORT"
        value = "3000"
      },
      {
        name  = "DATABASE_URL"
        value = var.db_connection_string
      },
      {
        name  = "REDIS_URL"
        value = var.redis_url
      },
      {
        name  = "FIREBASE_PROJECT_ID"
        value = var.firebase_project_id
      },
      {
        name  = "GEMINI_API_KEY"
        value = var.gemini_api_key
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.server.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }
  }])

  tags = {
    Name = "${var.project_name}-${var.environment}-server-task"
  }
}

# Studio Task Definition
resource "aws_ecs_task_definition" "studio" {
  family                   = "${var.project_name}-${var.environment}-studio"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.studio_cpu
  memory                   = var.studio_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "studio"
    image     = "${var.studio_image}:latest"
    essential = true

    portMappings = [{
      containerPort = 3000
      protocol      = "tcp"
    }]

    environment = [
      {
        name  = "NODE_ENV"
        value = "production"
      },
      {
        name  = "PORT"
        value = "3000"
      },
      {
        name  = "NEXT_PUBLIC_API_URL"
        value = "http://${var.alb_dns_name}/api"
      },
      {
        name  = "INTERNAL_API_URL"
        value = "http://${var.alb_dns_name}/api"
      },
      {
        name  = "NEXT_PUBLIC_FIREBASE_API_KEY"
        value = var.firebase_api_key
      },
      {
        name  = "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
        value = var.firebase_auth_domain
      },
      {
        name  = "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        value = var.firebase_project_id
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.studio.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])

  tags = {
    Name = "${var.project_name}-${var.environment}-studio-task"
  }
}

# Server ECS Service
resource "aws_ecs_service" "server" {
  name            = "${var.project_name}-${var.environment}-server"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.server.arn
  desired_count   = var.server_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.server_target_group_arn
    container_name   = "server"
    container_port   = 3000
  }

  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }

  depends_on = [var.alb_listener_arn]

  tags = {
    Name = "${var.project_name}-${var.environment}-server-service"
  }
}

# Studio ECS Service
resource "aws_ecs_service" "studio" {
  name            = "${var.project_name}-${var.environment}-studio"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.studio.arn
  desired_count   = var.studio_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.studio_target_group_arn
    container_name   = "studio"
    container_port   = 3000
  }

  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }

  depends_on = [var.alb_listener_arn]

  tags = {
    Name = "${var.project_name}-${var.environment}-studio-service"
  }
}

# Auto Scaling Target for Server
resource "aws_appautoscaling_target" "server" {
  max_capacity       = var.server_max_count
  min_capacity       = var.server_min_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.server.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Auto Scaling Policy for Server (CPU-based)
resource "aws_appautoscaling_policy" "server_cpu" {
  name               = "${var.project_name}-${var.environment}-server-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.server.resource_id
  scalable_dimension = aws_appautoscaling_target.server.scalable_dimension
  service_namespace  = aws_appautoscaling_target.server.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# Auto Scaling Target for Studio
resource "aws_appautoscaling_target" "studio" {
  max_capacity       = var.studio_max_count
  min_capacity       = var.studio_min_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.studio.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Auto Scaling Policy for Studio (CPU-based)
resource "aws_appautoscaling_policy" "studio_cpu" {
  name               = "${var.project_name}-${var.environment}-studio-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.studio.resource_id
  scalable_dimension = aws_appautoscaling_target.studio.scalable_dimension
  service_namespace  = aws_appautoscaling_target.studio.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
