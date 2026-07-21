from django.db import models

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    country = models.CharField(max_length=100)
    stadium_name = models.CharField(max_length=150, default="Central Arena")
    rating = models.FloatField(default=85.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.country})"

class Player(models.Model):
    POSITION_CHOICES = [
        ('GK', 'Goalkeeper'),
        ('DEF', 'Defender'),
        ('MID', 'Midfielder'),
        ('FWD', 'Forward'),
    ]

    team = models.ForeignKey(Team, related_name='players', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=150)
    position = models.CharField(max_length=3, choices=POSITION_CHOICES)
    jersey_number = models.IntegerField()
    expected_goals = models.FloatField(default=0.0)

    def __str__(self):
        return f"#{self.jersey_number} {self.full_name} ({self.team.name})"

class TacticalRule(models.Model):
    rule_name = models.CharField(max_length=100)
    pressing_intensity = models.FloatField(default=0.7)
    possession_bias = models.FloatField(default=0.6)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"Tactical Rule: {self.rule_name} (Active: {self.active})"
