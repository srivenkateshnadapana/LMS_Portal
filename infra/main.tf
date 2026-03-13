terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    supabase = {
      source = "supabase/supabase"
    }
  }
}

# Cloudflare for Zero-Trust Tunnels
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Example: Cloudflare Tunnel for backend-go
resource "cloudflare_tunnel" "lms_backend" {
  name = "lms-backend-tunnel"
  secret = var.tunnel_secret
}

# AWS for Redis (ElastiCache) or EKS for K8s labs
provider "aws" {
  region = var.aws_region
}

# Supabase Project (or self-hosted Postgres)
# Note: Use Supabase CLI for full integration; this is starter
# terraform import supabase_project.lms ...

variable "cloudflare_api_token" {}
variable "tunnel_secret" {}
variable "aws_region" {
  default = "us-east-1"
}

output "tunnel_id" {
  value = cloudflare_tunnel.lms_backend.id
}
