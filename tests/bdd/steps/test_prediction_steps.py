"""
BDD step definitions using pytest.
Demonstrates BDD, TDD, and Unit Testing skills.
"""

import pytest

class SimplePredictionEngine:
    def calculate(self, home_rating, away_rating, stamina):
        base = home_rating / (home_rating + away_rating)
        stamina_boost = (stamina / 100.0) * 0.1
        return base + stamina_boost

@pytest.fixture
def context():
    class Context:
        pass
    return Context()

def test_bdd_match_prediction_high_momentum(context):
    # Given home team rating is 88.0 and away team rating is 75.0
    context.home_rating = 88.0
    context.away_rating = 75.0
    # And home team average stamina is 92 percent
    context.stamina = 92.0

    # When the Bayesian engine evaluates match telemetry
    engine = SimplePredictionEngine()
    prob = engine.calculate(context.home_rating, context.away_rating, context.stamina)

    # Then the calculated home win probability should be greater than 60 percent
    assert prob > 0.60, f"Expected probability > 0.60, got {prob}"
