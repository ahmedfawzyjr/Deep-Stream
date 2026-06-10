pub struct NamedEntity {
    pub word: String,
    pub category: String, // e.g. "PERSON", "ORG", "LOC"
    pub confidence: f32,
}

pub struct NamedEntityRecognizer {
    // Session placeholder
}

impl NamedEntityRecognizer {
    pub fn new() -> Self {
        Self {}
    }

    pub fn extract_entities(&self, text: &str) -> Vec<NamedEntity> {
        let mut entities = Vec::new();

        // Mock entity detection based on common capitalized names in text
        if text.contains("DeepStream") {
            entities.push(NamedEntity {
                word: "DeepStream".to_string(),
                category: "ORG".to_string(),
                confidence: 0.95,
            });
        }
        if text.contains("Ahmed") {
            entities.push(NamedEntity {
                word: "Ahmed".to_string(),
                category: "PERSON".to_string(),
                confidence: 0.99,
            });
        }

        entities
    }
}
