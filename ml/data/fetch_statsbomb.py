import os
import pandas as pd
from statsbombpy import sb

def fetch_matches(competition_id=11, season_id=90):
    """
    Fetches match metadata for a given competition and season.
    Caches the results locally.
    """
    os.makedirs("ml/data/raw", exist_ok=True)
    cache_path = "ml/data/raw/matches.parquet"
    
    if os.path.exists(cache_path):
        print(f"Loading matches from cache: {cache_path}")
        return pd.read_parquet(cache_path)
    
    print("Fetching match metadata from StatsBomb...")
    matches = sb.matches(competition_id=competition_id, season_id=season_id)
    matches.to_parquet(cache_path)
    print(f"Saved {len(matches)} matches to cache.")
    return matches

def fetch_events_for_match(match_id):
    """
    Fetches and caches event data for a single match.
    """
    os.makedirs("ml/data/raw/events", exist_ok=True)
    cache_path = f"ml/data/raw/events/{match_id}.parquet"
    
    if os.path.exists(cache_path):
        return pd.read_parquet(cache_path)
    
    # print(f"Fetching events for match {match_id}...")
    events = sb.events(match_id=match_id)
    events.to_parquet(cache_path)
    return events

if __name__ == "__main__":
    print("Pre-fetching a sample of matches...")
    fetch_matches()
