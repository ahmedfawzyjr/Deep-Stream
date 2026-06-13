import os
import pandas as pd
import numpy as np
from datetime import datetime
from ml.data.fetch_statsbomb import fetch_matches, fetch_events_for_match

def extract_match_stats(match, events):
    """
    Extracts core statistics for a single match from event logs.
    """
    home_team = match['home_team']
    away_team = match['away_team']
    
    # Filter shots
    shots = events[events['type'] == 'Shot']
    home_shots = len(shots[shots['team'] == home_team])
    away_shots = len(shots[shots['team'] == away_team])
    
    # Shots on Target outcomes
    sot_outcomes = ['Goal', 'Post', 'Saved', 'Saved to Post', 'Saved Off Target']
    home_sot = len(shots[(shots['team'] == home_team) & (shots['shot_outcome'].isin(sot_outcomes))])
    away_sot = len(shots[(shots['team'] == away_team) & (shots['shot_outcome'].isin(sot_outcomes))])
    
    # Filter passes
    passes = events[events['type'] == 'Pass']
    home_passes = passes[passes['team'] == home_team]
    away_passes = passes[passes['team'] == away_team]
    
    # Pass accuracy (null outcome means complete in StatsBomb)
    home_pass_acc = 1.0 - home_passes['pass_outcome'].notna().mean() if len(home_passes) > 0 else 0.70
    away_pass_acc = 1.0 - away_passes['pass_outcome'].notna().mean() if len(away_passes) > 0 else 0.70
    
    # Possession % proxy via pass count share
    total_passes = len(home_passes) + len(away_passes)
    home_possession = (len(home_passes) / total_passes) if total_passes > 0 else 0.50
    away_possession = 1.0 - home_possession
    
    # Expected Goals (xG) sum
    home_xg = shots[shots['team'] == home_team]['shot_statsbomb_xg'].sum()
    away_xg = shots[shots['team'] == away_team]['shot_statsbomb_xg'].sum()
    
    # Fill NaNs
    home_xg = home_xg if not np.isnan(home_xg) else 0.0
    away_xg = away_xg if not np.isnan(away_xg) else 0.0
    
    return {
        'home_shots': float(home_shots),
        'away_shots': float(away_shots),
        'home_shots_on_target': float(home_sot),
        'away_shots_on_target': float(away_sot),
        'home_pass_accuracy': float(home_pass_acc),
        'away_pass_accuracy': float(away_pass_acc),
        'home_possession_pct': float(home_possession),
        'away_possession_pct': float(away_possession),
        'home_xg': float(home_xg),
        'away_xg': float(away_xg)
    }

def get_rolling_features(history_df, team, before_date, window=5):
    """
    Computes rolling form and goal average for a team prior to a specific date.
    """
    # Filter matches played by team before before_date
    team_matches = history_df[
        ((history_df['home_team'] == team) | (history_df['away_team'] == team)) & 
        (history_df['match_date'] < before_date)
    ].sort_values(by='match_date', ascending=False).head(window)
    
    if len(team_matches) == 0:
        return 0.33, 1.0 # Default: 33% win rate (form), 1.0 avg goals
        
    wins = 0
    goals = []
    
    for _, m in team_matches.iterrows():
        is_home = m['home_team'] == team
        h_score = m['home_score']
        a_score = m['away_score']
        
        # Track goals scored
        goals.append(h_score if is_home else a_score)
        
        # Track wins
        if h_score > a_score and is_home:
            wins += 1
        elif a_score > h_score and not is_home:
            wins += 1
            
    win_rate = wins / len(team_matches)
    avg_goals = np.mean(goals)
    
    return float(win_rate), float(avg_goals)

def get_h2h_wins(history_df, team_a, team_b, before_date, window=5):
    """
    Computes H2H wins for team_a against team_b before before_date.
    """
    h2h_matches = history_df[
        (((history_df['home_team'] == team_a) & (history_df['away_team'] == team_b)) |
         ((history_df['home_team'] == team_b) & (history_df['away_team'] == team_a))) &
        (history_df['match_date'] < before_date)
    ].sort_values(by='match_date', ascending=False).head(window)
    
    if len(h2h_matches) == 0:
        return 0.0
        
    wins = 0
    for _, m in h2h_matches.iterrows():
        h_score = m['home_score']
        a_score = m['away_score']
        if m['home_team'] == team_a and h_score > a_score:
            wins += 1
        elif m['away_team'] == team_a and a_score > h_score:
            wins += 1
            
    return float(wins)

def build_dataset(limit=100):
    """
    Main preprocessing entrypoint. Fetches StatsBomb matches,
    extracts match event metrics, and constructs rolling histories.
    """
    os.makedirs("ml/data/processed", exist_ok=True)
    processed_path = "ml/data/processed/features.parquet"
    
    if os.path.exists(processed_path):
        print(f"Loading preprocessed features from: {processed_path}")
        return pd.read_parquet(processed_path)
    
    matches = fetch_matches()
    # Ensure matches are sorted chronologically
    matches['match_date'] = pd.to_datetime(matches['match_date'])
    matches = matches.sort_values(by='match_date').reset_index(drop=True)
    
    if limit:
        matches = matches.head(limit)
        
    print(f"Extracting event stats for {len(matches)} matches...")
    
    stats_list = []
    for idx, match in matches.iterrows():
        match_id = match['match_id']
        try:
            events = fetch_events_for_match(match_id)
            stats = extract_match_stats(match, events)
            stats['match_id'] = match_id
            stats['match_date'] = match['match_date']
            stats['home_team'] = match['home_team']
            stats['away_team'] = match['away_team']
            stats['home_score'] = int(match['home_score'])
            stats['away_score'] = int(match['away_score'])
            
            # Label: 0=away win, 1=draw, 2=home win
            if stats['home_score'] > stats['away_score']:
                result = 2
            elif stats['home_score'] < stats['away_score']:
                result = 0
            else:
                result = 1
            stats['result'] = result
            
            stats_list.append(stats)
        except Exception as e:
            print(f"Error processing match {match_id}: {e}")
            
    df_stats = pd.DataFrame(stats_list)
    
    print("Computing rolling and historical features...")
    # Add rolling features
    final_rows = []
    for idx, row in df_stats.iterrows():
        match_date = row['match_date']
        home_team = row['home_team']
        away_team = row['away_team']
        
        home_form, home_goals_avg = get_rolling_features(df_stats, home_team, match_date)
        away_form, away_goals_avg = get_rolling_features(df_stats, away_team, match_date)
        h2h_wins = get_h2h_wins(df_stats, home_team, away_team, match_date)
        
        row_dict = row.to_dict()
        row_dict['home_form_last5'] = home_form
        row_dict['away_form_last5'] = away_form
        row_dict['home_goals_scored_avg'] = home_goals_avg
        row_dict['away_goals_scored_avg'] = away_goals_avg
        row_dict['head_to_head_home_wins'] = h2h_wins
        
        final_rows.append(row_dict)
        
    df_final = pd.DataFrame(final_rows)
    
    # Save to parquet
    df_final.to_parquet(processed_path)
    print(f"Features extraction completed. Saved {len(df_final)} rows to {processed_path}")
    return df_final

if __name__ == "__main__":
    build_dataset(limit=None)  # Fetch and process all matches
