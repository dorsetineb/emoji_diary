import { Mood, MoodEntry, MoodId } from './types';

export const MOODS: Record<MoodId, Mood> = {
  feliz: { id: 'feliz', label: 'Feliz', emoji: '😊', color: '#FFD700' },
  animado: { id: 'animado', label: 'Animado', emoji: '😁', color: '#4ade80' },
  neutro: { id: 'neutro', label: 'Neutro', emoji: '😐', color: '#9ca3af' },
  cansado: { id: 'cansado', label: 'Cansado', emoji: '😴', color: '#6b7280' },
  ansioso: { id: 'ansioso', label: 'Ansioso', emoji: '😟', color: '#f97316' },
  triste: { id: 'triste', label: 'Triste', emoji: '😢', color: '#3b82f6' },
  zangado: { id: 'zangado', label: 'Zangado', emoji: '😡', color: '#ef4444' },
};

export const MOOD_LIST = Object.values(MOODS);

export const TAG_COLORS = [
    '#f87171', '#fb923c', '#facc15', '#a3e635',
    '#4ade80', '#34d399', '#2dd4bf', '#22d3ee',
    '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa',
    '#c084fc', '#e879f9', '#f472b6', '#fb7185'
];

export const PREDEFINED_TAGS: Record<string, string> = {
    'trabalho': '#60a5fa',
    'amigos': '#4ade80',
    'família': '#f87171',
    'projeto': '#facc15',
    'estudo': '#818cf8',
    'saúde': '#34d399',
    'hobby': '#e879f9',
};


// Generate some plausible mock data for the last 90 days
export const INITIAL_MOOD_DATA: MoodEntry[] = [];