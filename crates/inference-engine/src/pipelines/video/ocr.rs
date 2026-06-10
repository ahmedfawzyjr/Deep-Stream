use std::io;

pub struct OcrResult {
    pub text: String,
    pub confidence: f32,
    pub bbox: [f32; 4],
}

pub struct OcrEngine {
    lang: String,
}

impl OcrEngine {
    pub fn new(lang: &str) -> Self {
        Self {
            lang: lang.to_string(),
        }
    }

    pub fn extract_text(&self, rgb_data: &[u8], width: usize, height: usize) -> Result<Vec<OcrResult>, io::Error> {
        if rgb_data.is_empty() || width == 0 || height == 0 {
            return Err(io::Error::new(io::ErrorKind::InvalidInput, "empty data"));
        }

        // Mock text bounding boxes detected on video frame
        Ok(vec![
            OcrResult {
                text: "DEEPSTREAM SYSTEM ACTIVE".to_string(),
                confidence: 0.98,
                bbox: [50.0, 400.0, 300.0, 30.0],
            }
        ])
    }
}
