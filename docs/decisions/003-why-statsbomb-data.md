# ADR-003: Why StatsBomb Open Data

## Status: Accepted

## Context
A sports analytics platform needs real, rich, and high-fidelity football match events (such as coordinates of passes, shots, pressure, etc.) to train a predictive model. We evaluated scraping commercial websites, utilizing mock random data, or using open datasets.

## Decision
We chose the StatsBomb Open Dataset, accessed via the `statsbombpy` library.

## Reasons
- **High-Fidelity Event Stream**: StatsBomb open data provides granular event-by-event details (coordinates, timestamps, body parts used, pressure indicators) for hundreds of matches, mirroring real industry data.
- **Permissive & Free License**: Allows usage for educational, portfolio, and research purposes without requiring costly commercial feed subscriptions (e.g. Opta, Wyscout).
- **Standardized Structure**: The dataset structure is stable and well-documented, minimizing the feature engineering and data cleaning overhead.

## Consequences
- The dataset is static and historical (e.g., La Liga 2017/2018), meaning the platform will simulate "live" streams by replaying historical events rather than pulling actual live matches in real-time.
