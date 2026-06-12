import random
from locust import HttpUser, task, between

class DeepKickUser(HttpUser):
    wait_time = between(1, 2.5)

    @task(3)
    def get_match_prediction(self):
        match_id = f"wc_match_{random.randint(1, 64)}"
        with self.client.get(f"/v1/match/{match_id}/predict", name="/v1/match/:id/predict", catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                if "win_probability" in data:
                    response.success()
                else:
                    response.failure("Response missing win_probability")
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(2)
    def get_player_form(self):
        player_id = f"player_{random.randint(1, 100)}"
        self.client.get(f"/v1/player/{player_id}/form", name="/v1/player/:id/form")

    @task(1)
    def get_world_cup_standings(self):
        self.client.get("/v1/world-cup/standings", name="/v1/world-cup/standings")

    @task(1)
    def get_world_cup_bracket(self):
        self.client.get("/v1/world-cup/bracket", name="/v1/world-cup/bracket")
