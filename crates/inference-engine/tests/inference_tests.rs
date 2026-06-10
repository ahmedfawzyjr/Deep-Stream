use inference_engine::runtime::gpu::AntiGravityRuntime;
use inference_engine::pipelines::video::yolo::YoloDetector;

#[tokio::test]
async fn test_runtime_inference() {
    let runtime = AntiGravityRuntime::new().await.unwrap();
    let input = vec![1.0, 2.0, 3.0];
    let output = runtime.infer(input).await.unwrap();
    assert_eq!(output.len(), 3);
}

#[test]
fn test_yolo_detection() {
    let detector = YoloDetector::new("/models/yolo.onnx").unwrap();
    let frame = vec![0u8; 10];
    let detections = detector.detect(&frame).unwrap();
    assert!(detections.len() > 0);
    assert_eq!(detections[0].label, "person");
}
