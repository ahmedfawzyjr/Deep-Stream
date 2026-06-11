import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String baseUrl = "http://localhost:8080/v1";

  Future<Map<String, dynamic>> getMatchPrediction(String matchId) async {
    try {
      final response = await http.get(Uri.parse("$baseUrl/match/$matchId/predict"));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      throw Exception("Failed to load prediction");
    } catch (e) {
      // Return local simulated backup data
      return {
        "match_id": matchId,
        "win_probability": 0.485,
        "draw_probability": 0.280,
        "loss_probability": 0.235,
        "confidence": 0.720,
        "key_factors": [
          "Stellar team/player form (+15% Win probability)",
          "Opponent suffers from high travel fatigue"
        ],
      };
    }
  }
}
