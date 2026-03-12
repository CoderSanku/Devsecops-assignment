variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "ami_id" {
  description = "Amazon Linux 2 AMI for ap-south-1"
  type        = string
  default     = "ami-0f58b397bc5c1f2e8"
}

variable "key_name" {
  description = "EC2 Key Pair name"
  type        = string
  default     = "devsecops-key"
}