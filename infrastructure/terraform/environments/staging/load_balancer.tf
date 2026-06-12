resource "google_compute_global_address" "default" {
  name = "deepkick-staging-lb-ip"
}

resource "google_compute_global_forwarding_rule" "http" {
  name       = "deepkick-staging-forwarding-rule"
  target     = google_compute_target_http_proxy.default.id
  port_range = "80"
  ip_address = google_compute_global_address.default.address
}

resource "google_compute_target_http_proxy" "default" {
  name    = "deepkick-staging-http-proxy"
  url_map = google_compute_url_map.default.id
}

resource "google_compute_url_map" "default" {
  name            = "deepkick-staging-url-map"
  default_service = google_compute_backend_service.api_backend.id
}

resource "google_compute_backend_service" "api_backend" {
  name          = "deepkick-staging-backend"
  protocol      = "HTTP"
  port_name     = "http"
  timeout_sec   = 30
  health_checks = [google_compute_health_check.default.id]

  # Primary Region: Europe
  backend {
    group           = "projects/deepkick-project/zones/europe-west1-b/networkEndpointGroups/deepkick-neg"
    balancing_mode  = "RATE"
    max_rate_per_endpoint = 1000
  }

  # Failover / Secondary Region: US
  backend {
    group           = "projects/deepkick-project/zones/us-east1-b/networkEndpointGroups/deepkick-neg"
    balancing_mode  = "RATE"
    max_rate_per_endpoint = 1000
  }
}

resource "google_compute_health_check" "default" {
  name               = "deepkick-staging-health-check"
  timeout_sec        = 5
  check_interval_sec = 5

  http_health_check {
    port         = 8080
    request_path = "/health"
  }
}
