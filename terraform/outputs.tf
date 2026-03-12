output "instance_public_ip" {
  description = "Public IP of the web server"
  value       = aws_instance.web.public_ip
}

output "app_url" {
  description = "Application URL"
  value       = "http://${aws_instance.web.public_ip}:3000"
}

