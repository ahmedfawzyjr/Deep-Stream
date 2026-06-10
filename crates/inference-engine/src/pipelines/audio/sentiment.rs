pub struct AudioSentimentScore {
    pub label: String, // e.g. "POSITIVE", "NEUTRAL", "NEGATIVE"
    pub score: f32,
}

pub struct AudioSentimentClassifier {
    // Model fields placeholder
}

impl AudioSentimentClassifier {
    pub fn new() -> Self {
        Self {}
    }

    pub fn classify(&self, transcription: &str) -> AudioSentimentScore {
        if transcription.is_empty() {
            return AudioSentimentScore {
                label: "NEUTRAL".to_string(),
                score: 0.5,
            };
        }

        // Quick mock logic matching words
        let t_lower = transcription.to_lowercase();
        if t_lower.contains("welcome") || t_lower.contains("good") || t_lower.contains("awesome") {
            AudioSentimentScore {
                label: "POSITIVE".to_string(),
                score: 0.92,
            }
        } else if t_lower.contains("bad") || t_lower.contains("error") || t_lower.contains("toxic") {
            AudioSentimentScore {
                label: "NEGATIVE".to_string(),
                score: 0.88,
            }
        } else {
            AudioSentimentScore {
                label: "NEUTRAL".to_string(),
                score: 0.65,
            }
        }
    }
}
