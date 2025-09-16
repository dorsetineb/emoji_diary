import React, { useState, useEffect, useMemo } from 'react';
import { MoodEntry, MoodId } from '../types';
import { MOOD_LIST, TAG_COLORS } from '../constants';

interface MoodInputProps {
  onSave: (entry: Omit<MoodEntry, 'date'> & { newTags?: Record<string, string> }) => void;
  existingEntry?: MoodEntry;
  allTags: Record<string, string>;
}

const MoodInput: React.FC<MoodInputProps> = ({ onSave, existingEntry, allTags }) => {
  const [isComplex, setIsComplex] = useState(existingEntry ? existingEntry.moods.length > 1 : false);
  const [selectedMoods, setSelectedMoods] = useState<MoodId[]>(existingEntry?.moods ?? []);
  const [intensity, setIntensity] = useState<number>(existingEntry?.intensity ?? 5);
  const [tags, setTags] = useState<string[]>(existingEntry?.tags ?? []);
  const [notes, setNotes] = useState<string>(existingEntry?.notes ?? '');
  const [currentTag, setCurrentTag] = useState('');
  const [newlyCreatedTags, setNewlyCreatedTags] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsComplex(existingEntry ? existingEntry.moods.length > 1 : false);
    setSelectedMoods(existingEntry?.moods ?? []);
    setIntensity(existingEntry?.intensity ?? 5);
    setTags(existingEntry?.tags ?? []);
    setNotes(existingEntry?.notes ?? '');
  }, [existingEntry]);

  const handleMoodClick = (moodId: MoodId) => {
    setSelectedMoods(prev => {
      const isSelected = prev.includes(moodId);
      if (isSelected) {
        return prev.filter(id => id !== moodId);
      }
      if (!isComplex) {
        return [moodId];
      }
      if (isComplex && prev.length < 2) {
        return [...prev, moodId];
      }
      return prev;
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = currentTag.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        if (!allTags[newTag]) {
          const usedColors = Object.values({ ...allTags, ...newlyCreatedTags });
          const availableColors = TAG_COLORS.filter(c => !usedColors.includes(c));
          const color = availableColors.length > 0 ? availableColors[0] : TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
          setNewlyCreatedTags(prev => ({ ...prev, [newTag]: color }));
        }
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    if (newlyCreatedTags[tagToRemove]) {
        const { [tagToRemove]: _, ...rest } = newlyCreatedTags;
        setNewlyCreatedTags(rest);
    }
  };
  
  const handleTagSelect = (tagName: string) => {
    if (!tags.includes(tagName)) {
        setTags([...tags, tagName]);
    }
  };
  
  const handleSave = () => {
    if (selectedMoods.length > 0) {
      onSave({ moods: selectedMoods, intensity, tags, notes, newTags: newlyCreatedTags });
    }
  };

  const availableSystemTags = useMemo(() => Object.keys(allTags).filter(t => !tags.includes(t)), [allTags, tags]);
  const sliderProgress = ((intensity - 1) / 9) * 100;

  return (
    <div className="bg-gray-800/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm border border-gray-700 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-4">Como você se sente hoje?</h2>
      
      <div>
        <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-300">1. Selecione seu humor</label>
            <div className="flex items-center">
                <input type="checkbox" id="complex-mood" checked={isComplex} onChange={e => {
                    setIsComplex(e.target.checked);
                    if (!e.target.checked && selectedMoods.length > 1) {
                        setSelectedMoods([selectedMoods[0]]);
                    }
                }} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="complex-mood" className="ml-2 text-sm text-gray-400">Humor complexo</label>
            </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {MOOD_LIST.map(mood => (
            <button
              key={mood.id}
              onClick={() => handleMoodClick(mood.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                selectedMoods.includes(mood.id) ? `ring-2 ring-offset-2 ring-offset-gray-800` : 'hover:bg-gray-700'
              }`}
              style={{
                borderColor: selectedMoods.includes(mood.id) ? mood.color : 'transparent',
                backgroundColor: selectedMoods.includes(mood.id) ? `${mood.color}33` : 'transparent'
              }}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="text-xs mt-1 text-gray-300">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-gray-700 my-6" />

      <div>
        <label htmlFor="intensity" className="block text-sm font-medium text-gray-300 mb-3">2. Nível de Intensidade</label>
        <div className="relative h-8">
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-gray-700 rounded-full">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${sliderProgress}%` }}/>
            </div>
            <div
                className="absolute top-1/2 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm pointer-events-none transform"
                style={{ left: `calc(${sliderProgress}%)`, transform: `translateX(-${sliderProgress}%) translateY(-50%)` }}
            >
                {intensity}
            </div>
            <input
                id="intensity"
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="absolute w-full h-full top-0 left-0 opacity-0 cursor-pointer"
            />
        </div>
      </div>

      <hr className="border-gray-700 my-6" />

      <div className="flex flex-col">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">3. Adicionar Tags (opcional)</label>
        <div className="bg-gray-900/50 rounded-lg p-2 flex flex-wrap items-center gap-2 border border-gray-600 focus-within:border-indigo-500 transition-colors">
          {tags.map(tag => {
            const color = (allTags[tag] || newlyCreatedTags[tag]) ?? '#6b7280';
            return (
                <div key={tag} style={{ backgroundColor: `${color}33`, borderColor: color }} className="flex items-center text-sm font-medium px-2 py-1 rounded border">
                  <span style={{ color }}>{tag}</span>
                  <button onClick={() => removeTag(tag)} className="ml-1.5 hover:text-white" style={{ color }}>
                    &times;
                  </button>
                </div>
            )
          })}
          <input
            id="tags"
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={tags.length === 0 ? "Ex: trabalho, amigos..." : ""}
            className="bg-transparent flex-1 focus:outline-none p-1 min-w-[100px]"
          />
        </div>
        {availableSystemTags.length > 0 && <div className="flex flex-wrap gap-2 mt-3">
            {availableSystemTags.map(tag => (
                <button key={tag} onClick={() => handleTagSelect(tag)} style={{ backgroundColor: `${allTags[tag]}33`, borderColor: allTags[tag] }} className="text-xs px-2 py-1 rounded border transition-opacity hover:opacity-80">
                   <span style={{ color: allTags[tag] }}>+ {tag}</span>
                </button>
            ))}
        </div>}
      </div>

       <hr className="border-gray-700 my-6" />

      <div className="flex-1 flex flex-col">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">4. Como foi seu dia? (opcional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Escreva um pouco sobre como você se sentiu..."
          className="w-full bg-gray-900/50 rounded-lg p-2 border border-gray-600 focus:border-indigo-500 focus:ring-0 transition-colors resize-none text-sm"
        />
      </div>
      
      <button
        onClick={handleSave}
        disabled={selectedMoods.length === 0}
        className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
      >
        {existingEntry ? 'Atualizar Humor de Hoje' : 'Salvar Humor de Hoje'}
      </button>
    </div>
  );
};

export default MoodInput;