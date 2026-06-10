from locust import HttpUser, task, between
import json

class DeepStreamLoadTester(HttpUser):
    # Simulated client wait duration between requests
    wait_time = between(1, 2.5)

    @task(1)
    def check_health(self):
        self.client.get("/health")

    @task(3)
    def fetch_pipeline_results(self):
        # Queries tiered storage for pipeline-001 warm/cold historical results
        self.client.get("/v1/results/pipelines/pipeline-001?minutes_ago=10")

    @task(2)
    def list_pipelines(self):
        self.client.get("/v1/pipelines/")
