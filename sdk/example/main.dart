import 'package:flutter/material.dart';
import 'package:deepstream_sdk/deepstream_sdk.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DeepStream SDK Demo',
      theme: ThemeData.dark(),
      home: const DashboardPage(),
    );
  }
}

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  final _client = DeepStreamClient(baseUrl: 'ws://localhost:8000');
  final _controller = TextEditingController(text: 'pipeline-001');
  final List<String> _logs = [];
  bool _isConnected = false;

  void _toggleConnection() {
    if (_isConnected) {
      _client.dispose();
      setState(() {
        _isConnected = false;
        _logs.add('Disconnected from DeepStream.');
      });
    } else {
      try {
        _client.connectToResults(_controller.text);
        setState(() {
          _isConnected = true;
          _logs.add('Connected to pipeline: ${_controller.text}');
        });

        // Listen for live results
        _client.results.listen(
          (result) {
            setState(() {
              _logs.add(
                'Seq: ${result.sequence} | Latency: ${result.latencyMs}ms | Detections: ${result.detections.length}',
              );
            });
          },
          onError: (err) {
            setState(() {
              _logs.add('Error: $err');
            });
          },
        );
      } catch (e) {
        setState(() {
          _logs.add('Connection failed: $e');
        });
      }
    }
  }

  @override
  void dispose() {
    _client.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🛸 DeepStream Mobile SDK'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      labelText: 'Pipeline ID',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _toggleConnection,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isConnected ? Colors.red : Colors.green,
                  ),
                  child: Text(_isConnected ? 'Disconnect' : 'Connect'),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Expanded(
              child: Card(
                color: Colors.black45,
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Live Inference Stream Console:',
                        style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blueAccent),
                      ),
                      const Divider(),
                      Expanded(
                        child: ListView.builder(
                          itemCount: _logs.length,
                          reverse: true,
                          itemBuilder: (context, index) {
                            final logItem = _logs[_logs.length - 1 - index];
                            return Text(
                              logItem,
                              style: const TextStyle(fontFamily: 'monospace', fontSize: 13),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
