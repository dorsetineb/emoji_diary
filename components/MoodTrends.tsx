import React, { useMemo } from 'react';
import { MoodEntry, MoodId } from '../types';
import { MOODS, MOOD_LIST } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell, CartesianGrid } from 'recharts';

const stopWords = new Set(['e', 'o', 'a', 'de', 'do', 'da', 'em', 'um', 'uma', 'com', 'que', 'para', 'por', 'foi', 'me', 'se', 'mas', 'meu', 'minha', 'no', 'na', 'os', 'as', 'são', 'ser', 'ter', 'este', 'esta', 'estava', 'eu', 'ele', 'ela', 'nós', 'vocês', 'eles', 'elas', 'isso', 'isto', 'muito', 'pouco', 'sempre', 'nunca', 'hoje', 'ontem', 'amanhã', 'dia', 'noite', 'tarde', 'manhã', 'sobre', 'estou', 'está', 'fui', 'foi', 'era']);

const MoodTrends: React.FC<{ data: MoodEntry[]; allTags: Record<string, string> }> = ({ data, allTags }) => {

  const moodFrequencyData = useMemo(() => {
    const counts = MOOD_LIST.reduce((acc, mood) => {
      acc[mood.id] = { name: mood.label, emoji: mood.emoji, count: 0, fill: mood.color };
      return acc;
    }, {} as Record<MoodId, { name: string; emoji: string; count: number; fill: string; }>);

    data.forEach(entry => {
      entry.moods.forEach(moodId => {
        if (counts[moodId]) {
            counts[moodId].count++;
        }
      })
    });

    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [data]);

  const moodIntensityData = useMemo(() => {
      const intensityData = MOOD_LIST.map(mood => {
          const entriesForMood = data.filter(e => e.moods.includes(mood.id));
          const avgIntensity = entriesForMood.length > 0
              ? entriesForMood.reduce((sum, e) => sum + e.intensity, 0) / entriesForMood.length
              : 0;
          return {
              mood: mood.label,
              intensity: parseFloat(avgIntensity.toFixed(2)),
              fullMark: 10
          };
      });
      return intensityData;
  }, [data]);
  
  const tagFrequencyData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(entry => {
        entry.tags.forEach(tag => {
            counts[tag] = (counts[tag] || 0) + 1;
        });
    });
    return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
  }, [data]);

  const wordCloudData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(entry => {
        if (entry.notes) {
            const words = entry.notes
                .toLowerCase()
                .replace(/[.,!?;:()]/g, ' ')
                .split(/\s+/);

            words.forEach(word => {
                if (word.length > 2 && !stopWords.has(word)) {
                    counts[word] = (counts[word] || 0) + 1;
                }
            });
        }
    });
    const sortedWords = Object.entries(counts)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 25);
    
    const maxCount = sortedWords[0]?.count || 1;

    return sortedWords.map(item => ({
        ...item,
        fontSize: 10 + (item.count / maxCount) * 8, // from 10px to 18px
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-gray-800 border border-gray-600 rounded-md shadow-lg">
          <p className="label text-white">{`${payload[0].payload.emoji} ${payload[0].payload.name}`}</p>
          <p className="intro text-gray-300">{`Contagem: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6 overflow-y-auto pr-2">
      {/* Seção Humor */}
      <div>
        <h3 className="text-xl font-bold text-gray-300 border-b border-gray-700 pb-2">Humor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          
          <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col h-[250px]">
            <h4 className="text-base font-semibold mb-2 text-center text-white">Frequência de Humor</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodFrequencyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="emoji" stroke="#9ca3af" tick={{ fontSize: 18 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                <Bar dataKey="count" name="Contagem" barSize={30}>
                  {moodFrequencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col h-[250px]">
            <h4 className="text-base font-semibold mb-2 text-center text-white">Intensidade Média</h4>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={moodIntensityData}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                <PolarAngleAxis dataKey="mood" tick={{ fill: '#d1d5db', fontSize: 12 }} />
                <Radar name="Intensidade" dataKey="intensity" stroke="#818cf8" fill="#818cf8" fillOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Seção Temas */}
      <div>
        <h3 className="text-xl font-bold text-gray-300 border-b border-gray-700 pb-2">Temas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

          <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col h-[250px]">
            <h4 className="text-base font-semibold mb-2 text-center text-white">Tags Mais Utilizadas</h4>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 pt-2">
              {tagFrequencyData.map((tag, index) => {
                const maxCount = tagFrequencyData[0]?.count || 1;
                const width = (tag.count / maxCount) * 100;
                const color = allTags[tag.name] || '#6b7280';
                return (
                  <div key={index} className="flex items-center text-sm">
                    <span className="w-1/3 truncate pr-2" style={{ color }}>{tag.name}</span>
                    <div className="w-2/3 bg-gray-700 rounded-full h-4">
                      <div className="h-4 rounded-full text-right pr-2 text-xs text-white flex items-center justify-end" style={{ width: `${width}%`, backgroundColor: color }}>
                        <span>{tag.count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col h-[250px]">
            <h4 className="text-base font-semibold mb-2 text-center text-white">Notas em Nuvem</h4>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0 flex-1 overflow-y-auto">
              {wordCloudData.length > 0 ? wordCloudData.map(({ word, fontSize }) => (
                <span key={word} className="text-gray-300 transition-colors hover:text-white" style={{ fontSize: `${fontSize}px`, lineHeight: 1 }}>
                  {word}
                </span>
              )) : <p className="text-gray-500 italic">Sem notas suficientes.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTrends;
