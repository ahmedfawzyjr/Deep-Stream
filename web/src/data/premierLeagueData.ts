export interface EPLPlayer {
  id: string;
  name: string;
  number: number;
  position: 'GK' | 'CB' | 'LB' | 'RB' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST';
  team: string;
  x: number; // Pitch % X (0-100)
  y: number; // Pitch % Y (0-100)
  stats: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physicality: number;
  };
  xg: number;
  xa: number;
  xt: number;
  passAccPct: number;
  staminaPct: number;
}

export interface EPLTeam {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  squad: EPLPlayer[];
}

export const PREMIER_LEAGUE_TEAMS: EPLTeam[] = [
  {
    id: 'arsenal',
    name: 'Arsenal FC',
    shortName: 'ARS',
    primaryColor: '#ef4444',
    secondaryColor: '#ffffff',
    squad: [
      { id: 'raya', name: 'David Raya', number: 22, position: 'GK', team: 'Arsenal', x: 8, y: 50, stats: { pace: 65, shooting: 20, passing: 82, dribbling: 60, defending: 45, physicality: 78 }, xg: 0.0, xa: 0.02, xt: 0.12, passAccPct: 88.5, staminaPct: 95 },
      { id: 'white', name: 'Ben White', number: 4, position: 'RB', team: 'Arsenal', x: 28, y: 15, stats: { pace: 78, shooting: 54, passing: 80, dribbling: 76, defending: 83, physicality: 80 }, xg: 0.05, xa: 0.18, xt: 0.28, passAccPct: 89.2, staminaPct: 88 },
      { id: 'saliba', name: 'William Saliba', number: 2, position: 'CB', team: 'Arsenal', x: 22, y: 35, stats: { pace: 83, shooting: 40, passing: 81, dribbling: 74, defending: 90, physicality: 87 }, xg: 0.08, xa: 0.05, xt: 0.15, passAccPct: 93.4, staminaPct: 92 },
      { id: 'magalhaes', name: 'Gabriel Magalhães', number: 6, position: 'CB', team: 'Arsenal', x: 22, y: 65, stats: { pace: 74, shooting: 60, passing: 75, dribbling: 68, defending: 88, physicality: 90 }, xg: 0.22, xa: 0.03, xt: 0.11, passAccPct: 91.0, staminaPct: 90 },
      { id: 'calafiori', name: 'Riccardo Calafiori', number: 33, position: 'LB', team: 'Arsenal', x: 28, y: 85, stats: { pace: 80, shooting: 62, passing: 83, dribbling: 79, defending: 82, physicality: 81 }, xg: 0.10, xa: 0.15, xt: 0.25, passAccPct: 88.0, staminaPct: 86 },
      { id: 'rice', name: 'Declan Rice', number: 41, position: 'CM', team: 'Arsenal', x: 45, y: 40, stats: { pace: 79, shooting: 74, passing: 86, dribbling: 81, defending: 86, physicality: 88 }, xg: 0.25, xa: 0.28, xt: 0.42, passAccPct: 91.8, staminaPct: 94 },
      { id: 'partey', name: 'Thomas Partey', number: 5, position: 'CM', team: 'Arsenal', x: 42, y: 60, stats: { pace: 68, shooting: 70, passing: 85, dribbling: 82, defending: 84, physicality: 84 }, xg: 0.12, xa: 0.15, xt: 0.38, passAccPct: 90.5, staminaPct: 82 },
      { id: 'odegaard', name: 'Martin Ødegaard', number: 8, position: 'CAM', team: 'Arsenal', x: 62, y: 50, stats: { pace: 77, shooting: 81, passing: 92, dribbling: 89, defending: 65, physicality: 72 }, xg: 0.38, xa: 0.45, xt: 0.68, passAccPct: 89.6, staminaPct: 89 },
      { id: 'saka', name: 'Bukayo Saka', number: 7, position: 'RW', team: 'Arsenal', x: 78, y: 18, stats: { pace: 87, shooting: 84, passing: 86, dribbling: 90, defending: 68, physicality: 78 }, xg: 0.48, xa: 0.42, xt: 0.72, passAccPct: 85.2, staminaPct: 91 },
      { id: 'martinelli', name: 'Gabriel Martinelli', number: 11, position: 'LW', team: 'Arsenal', x: 78, y: 82, stats: { pace: 89, shooting: 79, passing: 78, dribbling: 86, defending: 58, physicality: 75 }, xg: 0.35, xa: 0.25, xt: 0.54, passAccPct: 82.0, staminaPct: 87 },
      { id: 'havertz', name: 'Kai Havertz', number: 29, position: 'ST', team: 'Arsenal', x: 82, y: 50, stats: { pace: 81, shooting: 82, passing: 80, dribbling: 82, defending: 60, physicality: 83 }, xg: 0.52, xa: 0.22, xt: 0.48, passAccPct: 81.5, staminaPct: 93 },
    ]
  },
  {
    id: 'mancity',
    name: 'Manchester City',
    shortName: 'MCI',
    primaryColor: '#38bdf8',
    secondaryColor: '#ffffff',
    squad: [
      { id: 'ederson', name: 'Ederson Moraes', number: 31, position: 'GK', team: 'Man City', x: 8, y: 50, stats: { pace: 64, shooting: 30, passing: 91, dribbling: 70, defending: 42, physicality: 79 }, xg: 0.0, xa: 0.05, xt: 0.22, passAccPct: 92.1, staminaPct: 96 },
      { id: 'walker', name: 'Kyle Walker', number: 2, position: 'RB', team: 'Man City', x: 28, y: 15, stats: { pace: 90, shooting: 60, passing: 78, dribbling: 77, defending: 83, physicality: 84 }, xg: 0.04, xa: 0.12, xt: 0.24, passAccPct: 90.0, staminaPct: 89 },
      { id: 'dias', name: 'Rúben Dias', number: 3, position: 'CB', team: 'Man City', x: 22, y: 35, stats: { pace: 72, shooting: 42, passing: 85, dribbling: 73, defending: 89, physicality: 88 }, xg: 0.09, xa: 0.04, xt: 0.18, passAccPct: 94.8, staminaPct: 92 },
      { id: 'akanji', name: 'Manuel Akanji', number: 25, position: 'CB', team: 'Man City', x: 22, y: 65, stats: { pace: 80, shooting: 50, passing: 84, dribbling: 76, defending: 85, physicality: 84 }, xg: 0.06, xa: 0.08, xt: 0.20, passAccPct: 93.2, staminaPct: 91 },
      { id: 'gvardiol', name: 'Josko Gvardiol', number: 24, position: 'LB', team: 'Man City', x: 28, y: 85, stats: { pace: 82, shooting: 72, passing: 84, dribbling: 82, defending: 85, physicality: 86 }, xg: 0.22, xa: 0.18, xt: 0.35, passAccPct: 91.5, staminaPct: 93 },
      { id: 'rodri', name: 'Rodri Hernández', number: 16, position: 'CM', team: 'Man City', x: 45, y: 50, stats: { pace: 62, shooting: 82, passing: 93, dribbling: 85, defending: 88, physicality: 87 }, xg: 0.28, xa: 0.32, xt: 0.62, passAccPct: 95.2, staminaPct: 95 },
      { id: 'debruyne', name: 'Kevin De Bruyne', number: 17, position: 'CAM', team: 'Man City', x: 62, y: 35, stats: { pace: 74, shooting: 88, passing: 95, dribbling: 87, defending: 64, physicality: 76 }, xg: 0.42, xa: 0.65, xt: 0.88, passAccPct: 88.4, staminaPct: 84 },
      { id: 'foden', name: 'Phil Foden', number: 47, position: 'CAM', team: 'Man City', x: 62, y: 65, stats: { pace: 85, shooting: 87, passing: 88, dribbling: 91, defending: 58, physicality: 66 }, xg: 0.55, xa: 0.38, xt: 0.74, passAccPct: 89.0, staminaPct: 90 },
      { id: 'savinho', name: 'Savinho', number: 26, position: 'RW', team: 'Man City', x: 78, y: 18, stats: { pace: 88, shooting: 76, passing: 81, dribbling: 88, defending: 45, physicality: 68 }, xg: 0.32, xa: 0.35, xt: 0.58, passAccPct: 84.5, staminaPct: 88 },
      { id: 'doku', name: 'Jérémy Doku', number: 11, position: 'LW', team: 'Man City', x: 78, y: 82, stats: { pace: 93, shooting: 72, passing: 77, dribbling: 93, defending: 40, physicality: 72 }, xg: 0.28, xa: 0.38, xt: 0.65, passAccPct: 81.0, staminaPct: 86 },
      { id: 'haaland', name: 'Erling Haaland', number: 9, position: 'ST', team: 'Man City', x: 82, y: 50, stats: { pace: 89, shooting: 94, passing: 66, dribbling: 79, defending: 44, physicality: 91 }, xg: 0.85, xa: 0.12, xt: 0.52, passAccPct: 76.5, staminaPct: 92 },
    ]
  },
  {
    id: 'liverpool',
    name: 'Liverpool FC',
    shortName: 'LIV',
    primaryColor: '#dc2626',
    secondaryColor: '#facc15',
    squad: [
      { id: 'alisson', name: 'Alisson Becker', number: 1, position: 'GK', team: 'Liverpool', x: 8, y: 50, stats: { pace: 62, shooting: 25, passing: 86, dribbling: 65, defending: 48, physicality: 85 }, xg: 0.0, xa: 0.04, xt: 0.15, passAccPct: 87.4, staminaPct: 94 },
      { id: 'trent', name: 'Trent Alexander-Arnold', number: 66, position: 'RB', team: 'Liverpool', x: 32, y: 15, stats: { pace: 76, shooting: 78, passing: 94, dribbling: 82, defending: 74, physicality: 73 }, xg: 0.15, xa: 0.55, xt: 0.82, passAccPct: 86.8, staminaPct: 90 },
      { id: 'vandijk', name: 'Virgil van Dijk', number: 4, position: 'CB', team: 'Liverpool', x: 22, y: 35, stats: { pace: 78, shooting: 60, passing: 83, dribbling: 72, defending: 92, physicality: 92 }, xg: 0.18, xa: 0.06, xt: 0.22, passAccPct: 92.5, staminaPct: 93 },
      { id: 'konate', name: 'Ibrahima Konaté', number: 5, position: 'CB', team: 'Liverpool', x: 22, y: 65, stats: { pace: 82, shooting: 40, passing: 74, dribbling: 68, defending: 87, physicality: 89 }, xg: 0.08, xa: 0.02, xt: 0.10, passAccPct: 90.1, staminaPct: 88 },
      { id: 'robertson', name: 'Andy Robertson', number: 26, position: 'LB', team: 'Liverpool', x: 28, y: 85, stats: { pace: 82, shooting: 64, passing: 82, dribbling: 78, defending: 81, physicality: 79 }, xg: 0.08, xa: 0.28, xt: 0.38, passAccPct: 85.0, staminaPct: 92 },
      { id: 'gravenberch', name: 'Ryan Gravenberch', number: 38, position: 'CM', team: 'Liverpool', x: 42, y: 40, stats: { pace: 81, shooting: 74, passing: 85, dribbling: 87, defending: 80, physicality: 83 }, xg: 0.18, xa: 0.22, xt: 0.45, passAccPct: 91.2, staminaPct: 91 },
      { id: 'macallister', name: 'Alexis Mac Allister', number: 10, position: 'CM', team: 'Liverpool', x: 45, y: 60, stats: { pace: 72, shooting: 80, passing: 88, dribbling: 84, defending: 79, physicality: 78 }, xg: 0.25, xa: 0.30, xt: 0.48, passAccPct: 89.5, staminaPct: 89 },
      { id: 'szoboszlai', name: 'Dominik Szoboszlai', number: 8, position: 'CAM', team: 'Liverpool', x: 62, y: 50, stats: { pace: 85, shooting: 84, passing: 86, dribbling: 83, defending: 72, physicality: 82 }, xg: 0.32, xa: 0.38, xt: 0.60, passAccPct: 87.0, staminaPct: 95 },
      { id: 'salah', name: 'Mohamed Salah', number: 11, position: 'RW', team: 'Liverpool', x: 78, y: 18, stats: { pace: 89, shooting: 90, passing: 86, dribbling: 88, defending: 45, physicality: 76 }, xg: 0.68, xa: 0.48, xt: 0.84, passAccPct: 82.5, staminaPct: 93 },
      { id: 'diaz', name: 'Luis Díaz', number: 7, position: 'LW', team: 'Liverpool', x: 78, y: 82, stats: { pace: 91, shooting: 81, passing: 79, dribbling: 89, defending: 55, physicality: 74 }, xg: 0.45, xa: 0.25, xt: 0.58, passAccPct: 83.0, staminaPct: 90 },
      { id: 'nunez', name: 'Darwin Núñez', number: 9, position: 'ST', team: 'Liverpool', x: 82, y: 50, stats: { pace: 90, shooting: 82, passing: 71, dribbling: 78, defending: 50, physicality: 86 }, xg: 0.62, xa: 0.20, xt: 0.46, passAccPct: 75.0, staminaPct: 88 },
    ]
  }
];
