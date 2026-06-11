# DeepKick ML Pipeline

This document describes the models used by the DeepKick platform.

## Model 1: XGBoost Ensemble (Pre-Match)
Predicts overall match outcome probabilities using historical data, player stats, and team team attributes.

## Model 2: LSTM Sequence (In-Play)
Predicts real-time, live win/draw/loss probabilities by consuming sequence of events.

## Model 3: Transformer Tactics
Analyses player positioning and formations to extract team tactics.
