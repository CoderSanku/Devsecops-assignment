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

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name = "devsecops-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "devsecops-igw"
  }
}

# ⚠️ VULNERABILITY 1 (AWS-0164): Subnet auto-assigns public IP
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = {
    Name = "devsecops-public-subnet"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = {
    Name = "devsecops-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ⚠️ VULNERABILITY 2 (AWS-0107): SSH open to entire internet
# ⚠️ VULNERABILITY 3 (AWS-0104): Unrestricted egress to all IPs
resource "aws_security_group" "web" {
  name        = "devsecops-sg"
  description = "Security group for web server"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH from anywhere - INSECURE"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "App port"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound traffic - INSECURE"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "devsecops-sg"
  }
}

# ⚠️ VULNERABILITY 4 (AWS-0131): Root volume not encrypted
# ⚠️ VULNERABILITY 5 (AWS-0028): IMDSv2 not required
resource "aws_instance" "web" {
  ami                    = var.ami_id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = var.key_name

  root_block_device {
    volume_size = 20
    encrypted   = false
  }

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y docker
    systemctl start docker
    systemctl enable docker
    docker run -d -p 3000:3000 node:18-alpine node -e "
      const http = require('http');
      http.createServer((req,res) => {
        res.writeHead(200);
        res.end('DevSecOps App Running!');
      }).listen(3000);
    "
  EOF

  tags = {
    Name = "devsecops-server"
  }
}
