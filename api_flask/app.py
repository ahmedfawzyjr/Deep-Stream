"""
Flask Microservice for Deep Stream AI & Generative AI Features.
Exposes REST endpoints for tactical AI breakdowns, prompt engineering execution, and LLM commentary.
"""

from flask import Flask, request, jsonify
from services.genai_service import GenAIService

app = Flask(__name__)
genai_engine = GenAIService()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'api_flask_genai',
        'version': '1.0.0'
    }), 200

@app.route('/api/v1/tactical-breakdown', methods=['POST'])
def generate_tactical_breakdown():
    data = request.get_json() or {}
    home_team = data.get('home_team', 'Arsenal')
    away_team = data.get('away_team', 'Chelsea')
    win_prob = data.get('win_prob', 0.55)

    commentary = genai_engine.generate_tactical_analysis(home_team, away_team, win_prob)
    return jsonify({
        'status': 'success',
        'home_team': home_team,
        'away_team': away_team,
        'genai_tactical_insight': commentary
    }), 200

@app.route('/api/v1/chatbot', methods=['POST'])
def chat_assistant():
    data = request.get_json() or {}
    user_prompt = data.get('prompt', 'What is the tactical form of Arsenal?')
    reply = genai_engine.process_chat_prompt(user_prompt)
    return jsonify({
        'status': 'success',
        'prompt': user_prompt,
        'response': reply
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
