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

# VULNERABILITY 1: map_public_ip_on_launch = false
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = false
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

  # VULNERABILITY 2: SSH restricted to specific IP
  ingress {
    description = "SSH restricted to specific IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["192.168.1.0/24"]
  }

  # VULNERABILITY 3: App port restricted to specific IP
  ingress {
    description = "App port restricted to specific IP"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["192.168.1.0/24"]
  }

  # VULNERABILITY 4: Restricted egress
  egress {
    description = "Restricted outbound"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["8.8.8.8/32"]
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

  # VULNERABILITY 5: IMDSv2 required
  metadata_options {
    http_tokens   = "required"
    http_endpoint = "enabled"
  }

  # VULNERABILITY 6: Encrypted root volume
  root_block_device {
    volume_size = 20
    encrypted   = true
  }

  tags = { Name = "devsecops-server" }
}