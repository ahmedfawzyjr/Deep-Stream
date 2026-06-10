pub struct ToxicityClassification {
    pub is_toxic: bool,
    pub score: f32,
}

pub struct ToxicityClassifier {
    threshold: f32,
}

impl ToxicityClassifier {
    pub fn new(threshold: f32) -> Self {
        Self { threshold }
    }

    pub fn classify(&self, text: &str) -> ToxicityClassification {
        let text_lower = text.to_lowercase();
        
        // Simple toxic word keyword matching
        let mut score = 0.05;
        let bad_words = vec!["toxic", "abuse", "hate", "kill", "insult"];
        for word in bad_words {
            if text_lower.contains(word) {
                score += 0.4;
            }
        }

        if score > 1.0 {
            score = 1.0;
        }

        ToxicityClassification {
            is_toxic: score >= self.threshold,
            score,
        }
    }
}
