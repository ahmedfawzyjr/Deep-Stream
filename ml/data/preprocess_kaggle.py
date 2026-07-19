import os
import pandas as pd
import numpy as np

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

def preprocess_kaggle_dataset():
    print("Loading results.csv...")
    df = pd.read_csv("dataset/results.csv")
    
    # Drop rows with missing scores or team names
    df = df.dropna(subset=['home_score', 'away_score', 'home_team', 'away_team'])
    
    df['match_date'] = pd.to_datetime(df['date'])
    df = df.sort_values(by='match_date').reset_index(drop=True)
    
    print(f"Total valid matches in results.csv: {len(df)}")
    df_subset = df.tail(3000).copy().reset_index(drop=True)
    
    print(f"Processing {len(df_subset)} matches...")
    
    stats_list = []
    
    # Seed random state for noise reproducibility
    rng = np.random.default_rng(42)
    
    for idx, row in df_subset.iterrows():
        home_score = int(row['home_score'])
        away_score = int(row['away_score'])
        
        # Label: 0=away win, 1=draw, 2=home win
        if home_score > away_score:
            result = 2
        elif home_score < away_score:
            result = 0
        else:
            result = 1
            
        # Impute event-level statistics based on actual score + small realistic noise
        home_shots = float(max(2.0, 7.0 + home_score * 2.0 + rng.normal(0, 1.5)))
        away_shots = float(max(2.0, 7.0 + away_score * 2.0 + rng.normal(0, 1.5)))
        
        home_sot = float(max(0.0, home_score * 1.5 + rng.normal(1.5, 0.8)))
        away_sot = float(max(0.0, away_score * 1.5 + rng.normal(1.5, 0.8)))
        
        home_pass_acc = float(clip(0.80 + 0.02 * (home_score - away_score) + rng.normal(0, 0.03), 0.60, 0.95))
        away_pass_acc = float(clip(0.80 + 0.02 * (away_score - home_score) + rng.normal(0, 0.03), 0.60, 0.95))
        
        home_possession = float(clip(0.50 + 0.03 * (home_score - away_score) + rng.normal(0, 0.04), 0.30, 0.70))
        away_possession = 1.0 - home_possession
        
        home_xg = float(max(0.1, home_score * 0.8 + rng.normal(0.3, 0.2)))
        away_xg = float(max(0.1, away_score * 0.8 + rng.normal(0.3, 0.2)))
        
        stats_list.append({
            'match_date': row['match_date'],
            'home_team': row['home_team'],
            'away_team': row['away_team'],
            'home_score': home_score,
            'away_score': away_score,
            'result': result,
            'home_shots': home_shots,
            'away_shots': away_shots,
            'home_shots_on_target': home_sot,
            'away_shots_on_target': away_sot,
            'home_pass_accuracy': home_pass_acc,
            'away_pass_accuracy': away_pass_acc,
            'home_possession_pct': home_possession,
            'away_possession_pct': away_possession,
            'home_xg': home_xg,
            'away_xg': away_xg
        })
        
    df_stats = pd.DataFrame(stats_list)
    
    print("Computing rolling and historical features...")
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
    
    os.makedirs("ml/data/processed", exist_ok=True)
    processed_path = "ml/data/processed/features.parquet"
    df_final.to_parquet(processed_path)
    print(f"Features extraction completed. Saved {len(df_final)} rows to {processed_path}")

def clip(val, min_val, max_val):
    return min(max_val, max(min_val, val))

if __name__ == "__main__":
    preprocess_kaggle_dataset()
