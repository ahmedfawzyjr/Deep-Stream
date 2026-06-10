class SdkDetection {
  final String label;
  final double confidence;
  final List<double> bbox;

  SdkDetection({
    required this.label,
    required this.confidence,
    required this.bbox,
  });

  factory SdkDetection.fromJson(Map<String, dynamic> json) {
    return SdkDetection(
      label: json['label'] ?? '',
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0.0,
      bbox: List<double>.from((json['bbox'] as List? ?? []).map((e) => (e as num).toDouble())),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'label': label,
      'confidence': confidence,
      'bbox': bbox,
    };
  }
}
