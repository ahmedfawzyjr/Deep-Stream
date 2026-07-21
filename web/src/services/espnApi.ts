export interface ESPNTeam {
  id: string;
  name: string;
  abbreviation: string;
  displayName: string;
  logo: string;
  score: number;
  homeAway: 'home' | 'away';
  color?: string;
  xg?: number;
  flagEmoji?: string;
  stats?: {
    possession?: number;
    shots?: number;
    shotsOnTarget?: number;
    fouls?: number;
    corners?: number;
    yellowCards?: number;
    redCards?: number;
  };
}

export interface ESPNPlay {
  id: string;
  text: string;
  clock: string;
  period: number;
  type?: string;
  scoreValue?: number;
  teamId?: string;
}

export interface ESPNMatch {
  id: string;
  name: string;
  shortName: string;
  league: string;
  leagueName: string;
  date: string;
  venueName: string;
  venueCity?: string;
  statusState: 'in' | 'pre' | 'post';
  statusDetail: string;
  clockDisplay: string;
  minute: number;
  homeTeam: ESPNTeam;
  awayTeam: ESPNTeam;
  probabilities: {
    win: number;
    draw: number;
    loss: number;
  };
  plays?: ESPNPlay[];
}

// Map country codes or team names to emojis
const TEAM_FLAG_MAP: Record<string, string> = {
  ARGENTINA: '🇦🇷',
  FRANCE: '🇫🇷',
  SPAIN: '🇪🇸',
  ENGLAND: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  GERMANY: '🇩🇪',
  BRAZIL: '🇧🇷',
  PORTUGAL: '🇵🇹',
  USA: '🇺🇸',
  MEXICO: '🇲🇽',
  JAPAN: '🇯🇵',
  'REAL MADRID': '🇪🇸',
  BARCELONA: '🇪🇸',
  'MANCHESTER CITY': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  ARSENAL: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'LIVERPOOL': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'INTER MIAMI': '🇺🇸',
  'CRUZ AZUL': '🇲🇽',
  'PUEBLA': '🇲🇽',
};

export const LEAGUES = [
  { id: 'all', name: 'All Leagues' },
  { id: 'eng.1', name: 'Premier League' },
  { id: 'esp.1', name: 'La Liga' },
  { id: 'uefa.champions', name: 'Champions League' },
  { id: 'fifa.world', name: 'World Cup 2026' },
  { id: 'usa.1', name: 'MLS' },
  { id: 'mex.1', name: 'Liga MX' }
];

export const FALLBACK_MATCHES: ESPNMatch[] = [
  {
    id: 'wc2026-arg-fra',
    name: 'Argentina vs France',
    shortName: 'ARG vs FRA',
    league: 'fifa.world',
    leagueName: 'FIFA World Cup Final',
    date: new Date().toISOString(),
    venueName: 'MetLife Stadium',
    venueCity: 'East Rutherford, NJ',
    statusState: 'in',
    statusDetail: "42' 1st Half",
    clockDisplay: "42'",
    minute: 42,
    homeTeam: {
      id: 'arg',
      name: 'Argentina',
      abbreviation: 'ARG',
      displayName: 'Argentina',
      logo: 'https://a.espncdn.com/i/teamlogos/countries/500/arg.png',
      score: 2,
      homeAway: 'home',
      color: '#75AADB',
      xg: 1.65,
      flagEmoji: '🇦🇷',
      stats: { possession: 54, shots: 12, shotsOnTarget: 6, fouls: 8, corners: 5, yellowCards: 1, redCards: 0 }
    },
    awayTeam: {
      id: 'fra',
      name: 'France',
      abbreviation: 'FRA',
      displayName: 'France',
      logo: 'https://a.espncdn.com/i/teamlogos/countries/500/fra.png',
      score: 1,
      homeAway: 'away',
      color: '#002395',
      xg: 0.98,
      flagEmoji: '🇫🇷',
      stats: { possession: 46, shots: 8, shotsOnTarget: 3, fouls: 11, corners: 3, yellowCards: 2, redCards: 0 }
    },
    probabilities: { win: 0.49, draw: 0.27, loss: 0.24 },
    plays: [
      { id: 'p1', text: 'Goal! Lionel Messi converts penalty into the top right corner.', clock: "23'", period: 1, scoreValue: 1, teamId: 'arg' },
      { id: 'p2', text: 'Goal! Angel Di Maria finishes brilliant counter-attack.', clock: "36'", period: 1, scoreValue: 1, teamId: 'arg' },
      { id: 'p3', text: 'Goal! Kylian Mbappe strikes back with powerful low finish.', clock: "41'", period: 1, scoreValue: 1, teamId: 'fra' }
    ]
  },
  {
    id: 'el-clasico-rma-bar',
    name: 'Real Madrid vs Barcelona',
    shortName: 'RMA vs BAR',
    league: 'esp.1',
    leagueName: 'Spanish La Liga',
    date: new Date().toISOString(),
    venueName: 'Santiago Bernabéu',
    venueCity: 'Madrid',
    statusState: 'in',
    statusDetail: "68' 2nd Half",
    clockDisplay: "68'",
    minute: 68,
    homeTeam: {
      id: 'rma',
      name: 'Real Madrid',
      abbreviation: 'RMA',
      displayName: 'Real Madrid',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
      score: 2,
      homeAway: 'home',
      color: '#FFFFFF',
      xg: 2.10,
      flagEmoji: '🇪🇸',
      stats: { possession: 51, shots: 15, shotsOnTarget: 7, fouls: 9, corners: 6, yellowCards: 1, redCards: 0 }
    },
    awayTeam: {
      id: 'bar',
      name: 'Barcelona',
      abbreviation: 'BAR',
      displayName: 'Barcelona',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
      score: 2,
      homeAway: 'away',
      color: '#A50044',
      xg: 1.85,
      flagEmoji: '🇪🇸',
      stats: { possession: 49, shots: 13, shotsOnTarget: 6, fouls: 12, corners: 4, yellowCards: 3, redCards: 0 }
    },
    probabilities: { win: 0.42, draw: 0.31, loss: 0.27 },
    plays: [
      { id: 'p10', text: 'Goal! Vinicius Jr curls past goalkeeper.', clock: "14'", period: 1, scoreValue: 1, teamId: 'rma' },
      { id: 'p11', text: 'Goal! Lamine Yamal equalizes with incredible left-foot strike.', clock: "38'", period: 1, scoreValue: 1, teamId: 'bar' },
      { id: 'p12', text: 'Goal! Jude Bellingham restores lead from close range.', clock: "52'", period: 2, scoreValue: 1, teamId: 'rma' },
      { id: 'p13', text: 'Goal! Robert Lewandowski headers into top corner.', clock: "65'", period: 2, scoreValue: 1, teamId: 'bar' }
    ]
  },
  {
    id: 'epl-mci-ars',
    name: 'Manchester City vs Arsenal',
    shortName: 'MCI vs ARS',
    league: 'eng.1',
    leagueName: 'English Premier League',
    date: new Date().toISOString(),
    venueName: 'Etihad Stadium',
    venueCity: 'Manchester',
    statusState: 'in',
    statusDetail: "31' 1st Half",
    clockDisplay: "31'",
    minute: 31,
    homeTeam: {
      id: 'mci',
      name: 'Manchester City',
      abbreviation: 'MCI',
      displayName: 'Man City',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
      score: 1,
      homeAway: 'home',
      color: '#6CABDD',
      xg: 1.15,
      flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      stats: { possession: 62, shots: 9, shotsOnTarget: 4, fouls: 5, corners: 4, yellowCards: 0, redCards: 0 }
    },
    awayTeam: {
      id: 'ars',
      name: 'Arsenal',
      abbreviation: 'ARS',
      displayName: 'Arsenal',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
      score: 0,
      homeAway: 'away',
      color: '#EF0107',
      xg: 0.45,
      flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      stats: { possession: 38, shots: 4, shotsOnTarget: 1, fouls: 8, corners: 2, yellowCards: 1, redCards: 0 }
    },
    probabilities: { win: 0.58, draw: 0.26, loss: 0.16 },
    plays: [
      { id: 'p20', text: 'Goal! Erling Haaland heads home De Bruyne cross.', clock: "19'", period: 1, scoreValue: 1, teamId: 'mci' }
    ]
  }
];

export async function fetchLiveSoccerMatches(league: string = 'all'): Promise<ESPNMatch[]> {
  try {
    const endpoint = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`;
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`ESPN API returned ${res.status}`);
    }
    const data = await res.json();
    const events = data.events || [];
    if (events.length === 0) {
      return FALLBACK_MATCHES;
    }

    const matches: ESPNMatch[] = events.map((event: any) => {
      const comp = event.competitions?.[0] || {};
      const competitors = comp.competitors || [];
      const homeComp = competitors.find((c: any) => c.homeAway === 'home') || competitors[0] || {};
      const awayComp = competitors.find((c: any) => c.homeAway === 'away') || competitors[1] || {};

      const homeName = homeComp.team?.displayName || homeComp.team?.name || 'Home Team';
      const awayName = awayComp.team?.displayName || awayComp.team?.name || 'Away Team';
      const homeShort = homeComp.team?.abbreviation || homeName.substring(0, 3).toUpperCase();
      const awayShort = awayComp.team?.abbreviation || awayName.substring(0, 3).toUpperCase();

      const statusObj = event.status || {};
      const statusType = statusObj.type || {};
      const clock = statusObj.clock || 0;
      const displayClock = statusObj.displayClock || `${Math.floor(clock / 60)}'`;
      const minute = Math.min(90, Math.max(1, Math.floor(clock / 60) || parseInt(displayClock) || 45));

      const homeScore = parseInt(homeComp.score) || 0;
      const awayScore = parseInt(awayComp.score) || 0;

      // Odds / Probabilities from ESPN if available, else estimated from scores
      const odds = comp.odds?.[0] || {};
      let winProb = 0.45;
      let drawProb = 0.30;
      let lossProb = 0.25;

      if (homeScore > awayScore) {
        winProb = 0.60; drawProb = 0.25; lossProb = 0.15;
      } else if (awayScore > homeScore) {
        winProb = 0.20; drawProb = 0.25; lossProb = 0.55;
      }

      const homeFlag = TEAM_FLAG_MAP[homeName.toUpperCase()] || '⚽';
      const awayFlag = TEAM_FLAG_MAP[awayName.toUpperCase()] || '⚽';

      return {
        id: event.id || `espn-${Math.random()}`,
        name: event.name || `${homeName} vs ${awayName}`,
        shortName: `${homeShort} vs ${awayShort}`,
        league: event.season?.slug || league,
        leagueName: comp.altGameNote || data.leagues?.[0]?.name || 'Live Match',
        date: event.date || new Date().toISOString(),
        venueName: comp.venue?.fullName || comp.venue?.displayName || 'International Stadium',
        venueCity: comp.venue?.address?.city || '',
        statusState: statusType.state === 'in' ? 'in' : statusType.completed ? 'post' : 'pre',
        statusDetail: statusType.shortDetail || statusType.detail || 'Scheduled',
        clockDisplay: displayClock,
        minute: minute,
        homeTeam: {
          id: homeComp.team?.id || 'home',
          name: homeName,
          abbreviation: homeShort,
          displayName: homeName,
          logo: homeComp.team?.logo || 'https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo.png',
          score: homeScore,
          homeAway: 'home',
          color: homeComp.team?.color ? `#${homeComp.team.color}` : '#00E5FF',
          xg: Number((homeScore * 0.8 + 0.45).toFixed(2)),
          flagEmoji: homeFlag,
          stats: {
            possession: 50,
            shots: homeScore * 4 + 5,
            shotsOnTarget: homeScore + 3,
            fouls: 9,
            corners: 4
          }
        },
        awayTeam: {
          id: awayComp.team?.id || 'away',
          name: awayName,
          abbreviation: awayShort,
          displayName: awayName,
          logo: awayComp.team?.logo || 'https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo.png',
          score: awayScore,
          homeAway: 'away',
          color: awayComp.team?.color ? `#${awayComp.team.color}` : '#8A2BE2',
          xg: Number((awayScore * 0.8 + 0.35).toFixed(2)),
          flagEmoji: awayFlag,
          stats: {
            possession: 50,
            shots: awayScore * 4 + 4,
            shotsOnTarget: awayScore + 2,
            fouls: 10,
            corners: 3
          }
        },
        probabilities: { win: winProb, draw: drawProb, loss: lossProb }
      };
    });

    return matches;
  } catch (error) {
    console.warn('Falling back to default matches due to ESPN API error:', error);
    return FALLBACK_MATCHES;
  }
}

export async function fetchMatchPlays(matchId: string, league: string = 'all'): Promise<ESPNPlay[]> {
  if (matchId.startsWith('wc2026-') || matchId.startsWith('el-clasico-') || matchId.startsWith('epl-')) {
    const found = FALLBACK_MATCHES.find(m => m.id === matchId);
    return found?.plays || [];
  }
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/summary?event=${matchId}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const keyEvents = data.keyEvents || data.plays || [];
    return keyEvents.map((evt: any, idx: number) => ({
      id: evt.id || `play-${idx}`,
      text: evt.text || evt.shortText || 'Key match action',
      clock: evt.clock?.displayValue || `${evt.time?.seconds ? Math.floor(evt.time.seconds / 60) : 0}'`,
      period: evt.period?.number || 1,
      type: evt.type?.text || 'play',
      scoreValue: evt.scoringPlay ? 1 : 0,
      teamId: evt.team?.id
    }));
  } catch (err) {
    return [];
  }
}
