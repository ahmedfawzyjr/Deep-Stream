import requests

class DeepKickClient:
    """DeepKick Python SDK Client"""
    def __init__(self, base_url="http://localhost:8080/v1"):
        self.base_url = base_url

    def get_prediction(self, match_id: str) -> dict:
        url = f"{self.base_url}/match/{match_id}/predict"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()

    def get_player_form(self, player_id: str) -> dict:
        url = f"{self.base_url}/player/{player_id}/form"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
