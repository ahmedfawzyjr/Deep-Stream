resource "google_compute_network" "custom_vpc" {
  name                    = "deepkick-staging-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "custom_subnet" {
  name          = "deepkick-staging-subnet"
  ip_cidr_range = "10.0.0.0/20"
  region        = var.region
  network       = google_compute_network.custom_vpc.id

  secondary_ip_range {
    range_name    = "gke-pods-range"
    ip_cidr_range = "192.168.0.0/18"
  }

  secondary_ip_range {
    range_name    = "gke-services-range"
    ip_cidr_range = "192.168.64.0/22"
  }
}

resource "google_compute_router" "router" {
  name    = "deepkick-router"
  region  = var.region
  network = google_compute_network.custom_vpc.id
}

resource "google_compute_router_nat" "nat" {
  name                               = "deepkick-nat"
  router                             = google_compute_router.router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}
