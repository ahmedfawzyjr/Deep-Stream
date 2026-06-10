pub struct Detection {
    pub label: String,
    pub confidence: f32,
    pub bbox: [f32; 4], // [x, y, w, h]
}

pub struct YoloDetector {
    pub input_shape: (usize, usize),
}

impl YoloDetector {
    pub fn new(model_path: &str) -> Result<Self, String> {
        tracing::info!("Loading YOLO model from {}", model_path);
        Ok(Self {
            input_shape: (640, 640),
        })
    }

    pub fn detect(&self, _frame_bytes: &[u8]) -> Result<Vec<Detection>, String> {
        // Mock inference detections
        Ok(vec![
            Detection {
                label: "person".to_string(),
                confidence: 0.92,
                bbox: [50.0, 50.0, 120.0, 200.0],
            },
            Detection {
                label: "car".to_string(),
                confidence: 0.85,
                bbox: [300.0, 150.0, 250.0, 150.0],
            },
        ])
    }
}
