# ADR-003: Why StatsBomb Data for Machine Learning

## Status: Accepted

## Context
Training sports analytics models requires high-quality, event-level match data (passes, shots, positioning) rather than just final scores. Commercial data feeds are prohibitively expensive.

## Decision
We chose the open-access StatsBomb dataset, accessed via the `statsbombpy` library.

## Reasons
- **High Granularity**: StatsBomb provides extremely detailed event-level data, including coordinates of plays, pressure indicators, and pass destinations.
- **Free and Legal**: StatsBomb provides open-access data for several leagues (including La Liga) for academic and portfolio use.
- **Python Library Support**: The `statsbombpy` package provides direct access to the data, fetching and parsing it into Pandas DataFrames.

## Consequences
- The volume of data is high, which requires preprocessing and filtering to stay within memory limits on local machines.
- Requires online network access during data ingestion or caching raw responses.
