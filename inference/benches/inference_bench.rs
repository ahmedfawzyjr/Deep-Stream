use criterion::{black_box, criterion_group, criterion_main, Criterion};
use deepstream_inference::engine::InferenceEngine;
use std::path::Path;

fn bench_inference(c: &mut Criterion) {
    let model_path = "../models/match_predictor_v1.onnx";
    if !Path::new(model_path).exists() {
        eprintln!("ONNX model not found at {}, skipping benchmark", model_path);
        return;
    }

    let engine = InferenceEngine::new(model_path, 15).expect("Failed to load model");
    let dummy_features = vec![
        8.0, 6.0, 4.0, 2.0, 0.85, 0.78, 55.0, 45.0, 1.8, 0.9, 0.6, 0.4, 1.5, 1.1, 3.0,
    ];

    c.bench_function("bench_single_prediction", |b| {
        b.iter(|| engine.predict(black_box(&dummy_features)))
    });

    c.bench_function("bench_batch_10", |b| {
        b.iter(|| {
            for _ in 0..10 {
                let _ = engine.predict(black_box(&dummy_features));
            }
        })
    });

    c.bench_function("bench_batch_100", |b| {
        b.iter(|| {
            for _ in 0..100 {
                let _ = engine.predict(black_box(&dummy_features));
            }
        })
    });
}

criterion_group!(benches, bench_inference);
criterion_main!(benches);
