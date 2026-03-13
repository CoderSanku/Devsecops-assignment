terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
provider "aws" {
  region = var.aws_region
}
# ===== NETWORKING =====
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "devsecops-vpc" }
}
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "devsecops-igw" }
}
# VULNERABILITY 1: map_public_ip_on_launch = true
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags                    = { Name = "devsecops-public-subnet" }
}
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "devsecops-rt" }
}
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
# ===== SECURITY GROUP =====
resource "aws_security_group" "web" {
  name        = "devsecops-sg"
  description = "Security group for web server"
  vpc_id      = aws_vpc.main.id
  # VULNERABILITY 2: SSH open to entire internet
  ingress {
    description = "SSH open to world"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # VULNERABILITY 3: App port open to entire internet
  ingress {
    description = "App port open to world"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # VULNERABILITY 4: Unrestricted egress
  egress {
    description = "All outbound unrestricted"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "devsecops-sg" }
}
# ===== EC2 INSTANCE =====
resource "aws_instance" "web" {
  ami                    = var.ami_id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = var.key_name

  user_data = <<-USERDATA
    #!/bin/bash
    apt-get update -y
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs git
    cd /home/ubuntu
    git clone https://github.com/CoderSanku/DevSecOps-Assignment.git app
    cd app
    npm install
    nohup node app.js > /var/log/app.log 2>&1 &
  USERDATA

  # VULNERABILITY 5: IMDSv1 allowed
  metadata_options {
    http_tokens   = "optional"
    http_endpoint = "enabled"
  }
  # VULNERABILITY 6: Unencrypted root volume
  root_block_device {
    volume_size = 20
    encrypted   = false
  }
  tags = { Name = "devsecops-server" }
}
