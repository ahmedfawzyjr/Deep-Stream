variable "project_id" {
  type        = string
  description = "The GCP project ID to deploy into"
  default     = "deepstream-staging"
}

variable "region" {
  type        = string
  description = "GCP region"
  default     = "europe-west1"
}

variable "zone" {
  type        = string
  description = "GCP zone"
  default     = "europe-west1-b"
}

variable "node_count" {
  type        = number
  description = "Number of GKE node replicas"
  default     = 3
}
