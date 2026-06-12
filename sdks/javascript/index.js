/**
 * DeepKick JS SDK Client
 */
class DeepKickClient {
  constructor(baseURL = 'http://localhost:8080/v1') {
    this.baseURL = baseURL;
  }

  async getPrediction(matchId) {
    const response = await fetch(`${this.baseURL}/match/${matchId}/predict`);
    if (!response.ok) {
      throw new Error(`Failed to fetch prediction: ${response.statusText}`);
    }
    return response.json();
  }

  async getPlayerForm(playerId) {
    const response = await fetch(`${this.baseURL}/player/${playerId}/form`);
    if (!response.ok) {
      throw new Error(`Failed to fetch player form: ${response.statusText}`);
    }
    return response.json();
  }
}

module.exports = DeepKickClient;
