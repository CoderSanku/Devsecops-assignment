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
  tags = { Name = "devsecops-igw" }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true        # VULNERABILITY 1: Auto-assigns public IP
  tags = { Name = "devsecops-public-subnet" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"           # FIXED: was 10.0.0.0/16 (your bug)
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "devsecops-rt" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ===== SECURITY GROUP (with intentional vulnerabilities) =====

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

  # VULNERABILITY 4: All outbound traffic unrestricted to internet
  egress {
    description = "All outbound unrestricted"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "devsecops-sg" }
}

# ===== EC2 INSTANCE (with intentional vulnerabilities) =====

resource "aws_instance" "web" {
  ami                    = var.ami_id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = var.key_name

  # VULNERABILITY 5: IMDSv1 allowed (metadata service not secured)
  metadata_options {
    http_tokens   = "optional"          # should be "required"
    http_endpoint = "enabled"
  }

  # VULNERABILITY 6: Unencrypted root volume
  root_block_device {
    volume_size = 20
    encrypted   = false                 # should be true
  }

  tags = { Name = "devsecops-server" }
}
```

**What Trivy will now detect:**

| # | Vulnerability | Severity |
|---|--------------|----------|
| 1 | SSH port 22 open to `0.0.0.0/0` | CRITICAL |
| 2 | App port open to `0.0.0.0/0` | HIGH |
| 3 | Unrestricted egress `0.0.0.0/0` | HIGH |
| 4 | IMDSv1 enabled (`http_tokens = optional`) | HIGH |
| 5 | Unencrypted root volume | HIGH |
| 6 | `map_public_ip_on_launch = true` | HIGH |

**Key fix:** Route table now uses `0.0.0.0/0` → Terraform apply will succeed.

**Now your pipeline flow will work correctly:**
```
Trivy scans → finds 6 vulns → Human approves → 
Groq AI fixes all → Trivy rescans → 0 vulns → 
Human approves deploy → Terraform apply → SUCCESS ✅
