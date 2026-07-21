from django.contrib import admin
from .models import Team, Player, TacticalRule

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'rating', 'stadium_name')
    search_fields = ('name', 'country')

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'team', 'position', 'jersey_number', 'expected_goals')
    list_filter = ('position', 'team')

@admin.register(TacticalRule)
class TacticalRuleAdmin(admin.ModelAdmin):
    list_display = ('rule_name', 'pressing_intensity', 'possession_bias', 'active')
