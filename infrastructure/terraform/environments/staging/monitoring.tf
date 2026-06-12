resource "google_monitoring_alert_policy" "latency_alert" {
  display_name = "DeepKick Latency Alert (>50ms p99)"
  combiner     = "OR"
  conditions {
    display_name = "VM Instance - Network Latency"
    condition_threshold {
      filter          = "metric.type=\"compute.googleapis.com/instance/disk/write_latency\" AND resource.type=\"gce_instance\""
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 50000 # 50 milliseconds
      trigger {
        count = 1
      }
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_PERCENTILE_99"
      }
    }
  }

  notification_channels = []
}
