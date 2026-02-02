output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "server_target_group_arn" {
  description = "ARN of server target group"
  value       = aws_lb_target_group.server.arn
}

output "studio_target_group_arn" {
  description = "ARN of studio target group"
  value       = aws_lb_target_group.studio.arn
}
