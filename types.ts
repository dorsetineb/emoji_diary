export type MoodId = 'feliz' | 'animado' | 'neutro' | 'ansioso' | 'triste' | 'zangado' | 'cansado';

export type ViewType = 'calendar' | 'trends';

export interface Mood {
  id: MoodId;
  label: string;
  emoji: string;
  color: string;
}

export interface MoodEntry {
  date: string; // "yyyy-MM-dd"
  moods: MoodId[]; // Suporta um ou mais humores
  intensity: number; // 1-10
  tags: string[]; // Nomes das tags
  notes?: string; // Texto opcional do usuário
}