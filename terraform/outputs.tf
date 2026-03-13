output "instance_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.web.public_ip
}

output "instance_private_ip" {
  description = "Private IP of the EC2 instance"
  value       = aws_instance.web.private_ip
}

output "app_url" {
  description = "Application URL"
  value       = "http://${aws_instance.web.public_ip}:3000"
}

output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.web.id
}
