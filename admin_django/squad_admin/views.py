from django.shortcuts import render
from django.http import JsonResponse
from .models import Team, Player, TacticalRule

def dashboard_view(request):
    teams = Team.objects.all().prefetch_related('players')
    rules = TacticalRule.objects.filter(active=True)
    context = {
        'teams_count': teams.count(),
        'players_count': Player.objects.count(),
        'rules': rules,
        'teams': teams,
    }
    return render(request, 'squad_admin/dashboard.html', context)

def api_teams_json(request):
    teams = list(Team.objects.values('id', 'name', 'country', 'rating'))
    return JsonResponse({'status': 'success', 'teams': teams})
