import React, { useState } from 'react';

interface ModelNode {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'nlp';
  description: string;
}

const AVAILABLE_MODELS: ModelNode[] = [
  { id: 'yolo', name: 'YOLOv8 Object Detection', type: 'video', description: 'Real-time multi-class object localizer.' },
  { id: 'face', name: 'Face Detector', type: 'video', description: 'Facial boundary localizer.' },
  { id: 'whisper', name: 'Whisper Speech-to-Text', type: 'audio', description: 'Audio segment transcriber.' },
  { id: 'sentiment', name: 'BERT Sentiment Classifier', type: 'audio', description: 'Analyze emotional context.' },
  { id: 'ner', name: 'NER Classifier', type: 'nlp', description: 'Named Entity extractor.' },
  { id: 'toxicity', name: 'Toxicity Filter', type: 'nlp', description: 'Abusive text filter.' },
];

export const PipelineBuilder: React.FC = () => {
  const [selectedModels, setSelectedModels] = useState<string[]>(['yolo']);

  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter(id => id !== modelId));
    } else {
      setSelectedModels([...selectedModels, modelId]);
    }
  };

  return (
    <div style={{ backgroundColor: '#16161e', border: '1px solid #3b4261', padding: '20px', borderRadius: '8px' }}>
      <h3 style={{ color: '#7aa2f7', marginTop: 0, marginBottom: '8px' }}>🛠️ Pipeline Builder</h3>
      <p style={{ margin: '0 0 16px 0', fontSize: '13px' }}>Select models to compose your multi-modal AI inference graph:</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {AVAILABLE_MODELS.map(model => {
          const active = selectedModels.includes(model.id);
          return (
            <div 
              key={model.id}
              onClick={() => toggleModel(model.id)}
              style={{
                border: active ? '1px solid #50fa7b' : '1px solid #3b4261',
                padding: '12px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: active ? '#1a2b25' : '#1e1e2e',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ color: active ? '#50fa7b' : '#c0caf5' }}>{model.name}</b>
                <span style={{ fontSize: '11px', color: '#ff9e64', textTransform: 'uppercase' }}>{model.type}</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a9b1d6' }}>{model.description}</p>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '20px', borderTop: '1px solid #3b4261', paddingTop: '16px' }}>
        <button 
          onClick={() => alert(`Pipeline updated with: ${selectedModels.join(', ')}`)}
          style={{
            backgroundColor: '#7aa2f7',
            color: '#16161e',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Save Pipeline Configuration
        </button>
      </div>
    </div>
  );
};
