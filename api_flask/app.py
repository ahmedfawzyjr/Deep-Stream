"""
Flask Microservice for Deep Stream AI & Generative AI Features.
Exposes REST endpoints for tactical AI breakdowns, prompt engineering execution, and LLM commentary.
"""

from flask import Flask, request, jsonify
from services.genai_service import GenAIService
from services.scouting_service import ScoutingService
from services.fantasy_service import FantasyService
from services.injury_service import InjuryRiskService
from services.referee_service import RefereeEvaluationService
from services.academy_service import AcademyGrowthService
from services.alphazero_pass import AlphaZeroPassEngine
from services.stock_market_service import PlayerStockMarketService
from services.co_manager import AICoManagerService
from services.epl_database import EPLDatabaseService

app = Flask(__name__)
genai_engine = GenAIService()
scouting_engine = ScoutingService()
fantasy_engine = FantasyService()
injury_engine = InjuryRiskService()
referee_engine = RefereeEvaluationService()
academy_engine = AcademyGrowthService()
alphazero_engine = AlphaZeroPassEngine()
stock_engine = PlayerStockMarketService()
comanager_engine = AICoManagerService()
epl_engine = EPLDatabaseService()


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'api_flask_genai',
        'version': '1.5.0'
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

@app.route('/api/v1/scouting/similar', methods=['POST'])
def get_similar_players():
    data = request.get_json() or {}
    target_player = data.get('player_name', 'Bukayo Saka')
    top_k = data.get('top_k', 4)
    result = scouting_engine.find_similar_players(target_player, top_k)
    return jsonify({
        'status': 'success',
        'data': result
    }), 200

@app.route('/api/v1/tactics/scenario-simulate', methods=['POST'])
def simulate_scenario():
    data = request.get_json() or {}
    base_win_prob = data.get('base_win_prob', 0.55)
    sub_out = data.get('sub_out', 'p1')
    sub_in = data.get('sub_in', 'p9')
    tactic = data.get('tactic', 'high_press')

    result = scouting_engine.simulate_tactical_scenario(base_win_prob, sub_out, sub_in, tactic)
    return jsonify({
        'status': 'success',
        'simulation': result
    }), 200

@app.route('/api/v1/commentary/audio', methods=['POST'])
def get_audio_commentary():
    data = request.get_json() or {}
    home = data.get('home_team', 'Arsenal')
    away = data.get('away_team', 'Chelsea')
    minute = data.get('minute', 65)

    speech_text = genai_engine.generate_voice_tactical_commentary(home, away, minute)
    return jsonify({
        'status': 'success',
        'speech_text': speech_text,
        'home_team': home,
        'away_team': away,
        'minute': minute
    }), 200

@app.route('/api/v1/fantasy/predict', methods=['POST'])
def submit_fantasy_prediction():
    data = request.get_json() or {}
    user = data.get('username', 'Guest_User')
    winner = data.get('predicted_winner', 'ARG')
    score = data.get('predicted_score', '2-1')
    scorer = data.get('next_scorer', 'Messi')

    res = fantasy_engine.submit_user_prediction(user, winner, score, scorer)
    return jsonify(res), 200

@app.route('/api/v1/fantasy/leaderboard', methods=['GET'])
def get_fantasy_leaderboard():
    leaderboard = fantasy_engine.get_leaderboard(5)
    return jsonify({
        'status': 'success',
        'leaderboard': leaderboard
    }), 200

@app.route('/api/v1/analytics/fatigue-injury', methods=['POST'])
def get_fatigue_injury_analytics():
    data = request.get_json() or {}
    minute = data.get('minute', 65)
    temp = data.get('temperature', 28.0)
    result = injury_engine.predict_squad_fatigue(minute, temp)
    return jsonify({
        'status': 'success',
        'fatigue_analytics': result
    }), 200

@app.route('/api/v1/referee/evaluate', methods=['POST'])
def evaluate_referee():
    data = request.get_json() or {}
    ref_name = data.get('referee_name', 'Szymon Marciniak')
    result = referee_engine.evaluate_referee_performance(ref_name)
    return jsonify({
        'status': 'success',
        'referee_evaluation': result
    }), 200

@app.route('/api/v1/academy/predict-growth', methods=['POST'])
def predict_youth_growth():
    data = request.get_json() or {}
    player = data.get('player_name', 'Ethan Nwaneri')
    age = data.get('age', 17)
    rating = data.get('rating', 74)
    result = academy_engine.predict_youth_trajectory(player, age, rating)
    return jsonify({
        'status': 'success',
        'growth_prediction': result
    }), 200

@app.route('/api/v1/tactics/alphazero-pass', methods=['POST'])
def recommend_alphazero_pass():
    data = request.get_json() or {}
    holder = data.get('ball_holder', 'Lionel Messi')
    result = alphazero_engine.recommend_optimal_pass(holder)
    return jsonify({
        'status': 'success',
        'alphazero_pass_recommendation': result
    }), 200

@app.route('/api/v1/finance/player-stocks', methods=['GET'])
def get_player_stock_ticker():
    result = stock_engine.get_live_stock_ticker(65)
    return jsonify({
        'status': 'success',
        'stock_ticker': result
    }), 200

@app.route('/api/v1/tactics/co-manager', methods=['GET'])
def get_co_manager_advice():
    minute = int(request.args.get('minute', 68))
    result = comanager_engine.evaluate_tactical_status(minute)
    return jsonify({
        'status': 'success',
        'co_manager_advice': result
    }), 200

@app.route('/api/v1/epl/player-radar', methods=['GET'])
def get_epl_player_radar():
    player = request.args.get('player', 'Bukayo Saka')
    result = epl_engine.get_player_radar(player)
    return jsonify({
        'status': 'success',
        'player_radar': result
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)






