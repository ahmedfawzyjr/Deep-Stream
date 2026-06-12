import 'dart:convert';
import 'package:http/http.dart' as http;

class DeepKickClient {
  final String baseUrl;

  DeepKickClient({this.baseUrl = 'http://localhost:8080/v1'});

  Future<Map<String, dynamic>> getPrediction(String matchId) async {
    final response = await http.get(Uri.parse('$baseUrl/match/$matchId/predict'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load prediction');
    }
  }

  Future<Map<String, dynamic>> getPlayerForm(String playerId) async {
    final response = await http.get(Uri.parse('$baseUrl/player/$playerId/form'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load player form');
    }
  }
}
