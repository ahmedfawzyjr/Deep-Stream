import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:deepkick_mobile/main.dart';

void main() {
  testWidgets('DeepKick smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const DeepKickApp());
    expect(find.text('⚽ DEEPKICK AI'), findsOneWidget);
  });
}
