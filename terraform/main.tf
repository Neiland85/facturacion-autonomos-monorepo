terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "tributariapp-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "TributariApp"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC y Networking
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  azs         = var.availability_zones
}

# EKS Cluster
module "eks" {
  source = "./modules/eks"
  
  cluster_name    = "tributariapp-${var.environment}"
  cluster_version = "1.28"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
  
  node_groups = {
    main = {
      desired_capacity = 2
      max_capacity     = 10
      min_capacity     = 1
      
      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
    }
  }
}

# RDS PostgreSQL
module "rds" {
  source = "./modules/rds"
  
  identifier        = "tributariapp-${var.environment}"
  engine_version    = "15.4"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.database_subnets
  
  database_name = "tributariapp"
  username      = "tributariapp"
  password      = var.database_password
}

# Redis ElastiCache
module "redis" {
  source = "./modules/redis"
  
  cluster_id = "tributariapp-${var.environment}"
  node_type  = "cache.t3.micro"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  name               = "tributariapp-${var.environment}"
  vpc_id             = module.vpc.vpc_id
  public_subnets     = module.vpc.public_subnets
  private_subnets    = module.vpc.private_subnets
  certificate_arn    = var.certificate_arn
}

# ECR Repositories
resource "aws_ecr_repository" "api_facturas" {
  name                 = "tributariapp/api-facturas"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "api_tax_calculator" {
  name                 = "tributariapp/api-tax-calculator"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "tributariapp/frontend"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "api_facturas" {
  name              = "/aws/eks/tributariapp-${var.environment}/api-facturas"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "api_tax_calculator" {
  name              = "/aws/eks/tributariapp-${var.environment}/api-tax-calculator"
  retention_in_days = 30
}

# Route53 DNS
module "route53" {
  source = "./modules/route53"
  
  domain_name = var.domain_name
  environment = var.environment
  
  alb_dns_name = module.alb.alb_dns_name
  alb_zone_id  = module.alb.alb_zone_id
}
