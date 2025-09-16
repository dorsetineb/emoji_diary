import { Mood, MoodEntry, MoodId } from './types';
import { subDays, format } from 'date-fns';

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
export const INITIAL_MOOD_DATA: MoodEntry[] = Array.from({ length: 90 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const moodKeys = Object.keys(MOODS) as MoodId[];

    // Skew moods based on day of week for more realistic patterns
    let mood: MoodId;
    const random = Math.random();

    if ([5, 6].includes(dayOfWeek)) { // Friday, Saturday
        mood = random > 0.6 ? 'animado' : random > 0.2 ? 'feliz' : 'neutro';
    } else if ([1, 2, 3].includes(dayOfWeek)) { // Monday, Tuesday, Wednesday
        mood = random > 0.7 ? 'cansado' : random > 0.4 ? 'ansioso' : random > 0.1 ? 'neutro' : 'triste';
    } else { // Thursday, Sunday
        mood = moodKeys[Math.floor(random * moodKeys.length)];
    }

    const intensity = Math.floor(Math.random() * 8) + 2; // 2-10
    
    const allTagNames = Object.keys(PREDEFINED_TAGS);
    const tags = Array.from({ length: Math.floor(Math.random() * 3) }, () => allTagNames[Math.floor(Math.random() * allTagNames.length)]);
    
    // Ensure we don't have an entry for today
    if (i === 0) return null;
    
    const hasNotes = Math.random() > 0.65;
    const sampleNotes = [
        "Dia produtivo no trabalho, mas me sentindo um pouco sobrecarregado.",
        "Passei a tarde com amigos, foi muito divertido e relaxante.",
        "Não consegui dormir bem à noite, me sentindo exausto hoje.",
        "Consegui resolver um problema que estava me incommodando há dias."
    ];

    return {
        date: format(date, 'yyyy-MM-dd'),
        moods: [mood],
        intensity,
        tags: [...new Set(tags)], // Remove duplicates
        notes: hasNotes ? sampleNotes[Math.floor(Math.random() * sampleNotes.length)] : undefined,
    };
// Fix: The original type predicate was causing a complex type error.
// Replaced with a simple null check, allowing TypeScript to correctly infer the type.
}).filter((entry) => entry !== null);
