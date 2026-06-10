import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class InferenceResult {
  final String pipelineId;
  final int sequence;
  final String timestamp;
  final double latencyMs;
  final List<dynamic> detections;

  InferenceResult({
    required this.pipelineId,
    required this.sequence,
    required this.timestamp,
    required this.latencyMs,
    required this.detections,
  });

  factory InferenceResult.fromJson(Map<String, dynamic> json) {
    return InferenceResult(
      pipelineId: json['pipeline_id'] ?? '',
      sequence: json['sequence'] ?? 0,
      timestamp: json['timestamp'] ?? '',
      latencyMs: (json['latency_ms'] as num?)?.toDouble() ?? 0.0,
      detections: json['detections'] ?? [],
    );
  }
}

class DeepStreamClient {
  final String baseUrl;
  WebSocketChannel? _channel;
  StreamController<InferenceResult>? _resultController;

  DeepStreamClient({required this.baseUrl});

  /// Establishes real-time connection to results WebSocket
  void connectToResults(String pipelineId) {
    final wsUrl = Uri.parse('$baseUrl/v1/results/live/$pipelineId');
    _channel = WebSocketChannel.connect(wsUrl);
    _resultController = StreamController<InferenceResult>.broadcast();

    _channel!.stream.listen(
      (data) {
        try {
          final decoded = jsonDecode(data as String) as Map<String, dynamic>;
          final result = InferenceResult.fromJson(decoded);
          _resultController?.add(result);
        } catch (e) {
          _resultController?.addError(e);
        }
      },
      onError: (err) => _resultController?.addError(err),
      onDone: () => _resultController?.close(),
    );
  }

  /// Live updates stream
  Stream<InferenceResult> get results {
    if (_resultController == null) {
      throw StateError("Client not connected. Call connectToResults() first.");
    }
    return _resultController!.stream;
  }

  Future<void> dispose() async {
    await _channel?.sink.close();
    await _resultController?.close();
  }
}

export 'src/models/detection.dart';
export 'src/ffi/rust_bridge.dart';
