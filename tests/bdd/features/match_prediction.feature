Feature: Tactical Match Outcome Probability Calibration
  As a sports analyst
  I want to calculate match win probabilities based on team rating and stamina
  So that live telemetry accurately reflects match momentum

  Scenario: Home team high momentum domination
    Given home team rating is 88.0 and away team rating is 75.0
    And home team average stamina is 92 percent
    When the Bayesian engine evaluates match telemetry
    Then the calculated home win probability should be greater than 60 percent
