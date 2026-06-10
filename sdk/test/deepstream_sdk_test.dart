import 'package:flutter_test/flutter_test.dart';
import 'package:deepstream_sdk/deepstream_sdk.dart';

void main() {
  test('DeepStream Client Initialization', () {
    final client = DeepStreamClient(baseUrl: 'ws://localhost:8000');
    expect(client.baseUrl, 'ws://localhost:8000');
  });
}
