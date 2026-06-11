import 'package:flutter/material.dart';
import 'src/services/api_service.dart';

void main() {
  runApp(const DeepKickApp());
}

class DeepKickApp extends StatelessWidget {
  const DeepKickApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DeepKick',
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF070A13),
        primaryColor: const Color(0xFF00FF87),
        cardColor: const Color(0xFF121826),
      ),
      home: const DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _predictionData;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    final data = await _apiService.getMatchPrediction("wc_final_2026");
    setState(() {
      _predictionData = data;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('⚽ DEEPKICK AI', style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF00FF87))),
        backgroundColor: const Color(0xFF121826),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF00E5FF)),
            onPressed: _loadData,
          )
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF00FF87))))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Match Header Card
                  _buildMatchHeaderCard(),
                  const SizedBox(height: 24),
                  
                  // Win Probabilities
                  _buildPredictionSection(),
                  const SizedBox(height: 24),

                  // AR Preview Banner
                  _buildArPreviewBanner(),
                ],
              ),
            ),
    );
  }

  Widget _buildMatchHeaderCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF121826),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Column(
            children: [
              Icon(Icons.shield, size: 40, color: Color(0xFF00E5FF)),
              SizedBox(height: 8),
              Text('Argentina', style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          Text('2 - 1', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900)),
          Column(
            children: [
              Icon(Icons.shield, size: 40, color: Color(0xFF8A2BE2)),
              SizedBox(height: 8),
              Text('France', style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPredictionSection() {
    if (_predictionData == null) return const SizedBox.shrink();

    final win = (_predictionData!['win_probability'] as double) * 100;
    final draw = (_predictionData!['draw_probability'] as double) * 100;
    final loss = (_predictionData!['loss_probability'] as double) * 100;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'AI Multi-Model Forecast',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF121826),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white12),
          ),
          child: Column(
            children: [
              _buildProgressBar("Argentina Win", win, const Color(0xFF00FF87)),
              const SizedBox(height: 12),
              _buildProgressBar("Draw", draw, const Color(0xFF00E5FF)),
              const SizedBox(height: 12),
              _buildProgressBar("France Win", loss, const Color(0xFF8A2BE2)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildProgressBar(String label, double val, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.between,
          children: [
            Text(label, style: const TextStyle(fontSize: 14)),
            Text('${val.toStringAsFixed(1)}%', style: TextStyle(color: color, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 6),
        LinearProgressIndicator(
          value: val / 100,
          backgroundColor: Colors.white10,
          valueColor: AlwaysStoppedAnimation<Color>(color),
          minHeight: 8,
        )
      ],
    );
  }

  Widget _buildArPreviewBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF00FF87), Color(0xFF00E5FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.layers, color: Colors.black87),
              SizedBox(width: 8),
              Text(
                'AR Match Preview Active',
                style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ],
          ),
          SizedBox(height: 8),
          Text(
            'Bring the MetLife 2026 stadium directly onto your tabletop. Interactive tactical layouts powered by ARKit.',
            style: TextStyle(color: Colors.black54, height: 1.4),
          ),
        ],
      ),
    );
  }
}
