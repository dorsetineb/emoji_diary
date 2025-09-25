import React, { useState, useMemo } from 'react';
import { MoodEntry } from '../types';
import { MOODS } from '../constants';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, subMonths, addMonths, isToday, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MoodCalendar: React.FC<{ data: MoodEntry[]; allTags: Record<string, string> }> = ({ data, allTags }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // State for managing the details panel with animations
  const [panelPosition, setPanelPosition] = useState<Date | null>(null); // Determines which row the panel renders under
  const [panelData, setPanelData] = useState<MoodEntry | null>(null); // The data to display
  const [isPanelVisible, setIsPanelVisible] = useState(false); // Controls animation classes

  const dataByDate = useMemo(() => {
    return data.reduce((acc, entry) => {
      acc[entry.date] = entry;
      return acc;
    }, {} as Record<string, MoodEntry>);
  }, [data]);
  
  const handleClosePanel = () => {
    setIsPanelVisible(false);
    // Delay unmounting until after the animation completes
    setTimeout(() => {
      setPanelPosition(null);
      setPanelData(null);
    }, 300); // Must match CSS transition duration
  };

  const handleDayClick = (day: Date, hasEntry: boolean) => {
    const entry = dataByDate[format(day, 'yyyy-MM-dd')];

    // If clicking on a day with no entry, or the currently open day, close the panel
    if (!hasEntry || (panelPosition && isSameDay(day, panelPosition))) {
      handleClosePanel();
      return;
    }

    const openNewPanel = () => {
      setPanelPosition(day);
      setPanelData(entry);
      // Wait for the next frame to apply the 'visible' class,
      // allowing the fade-in transition to work.
      requestAnimationFrame(() => {
        setIsPanelVisible(true);
      });
    };

    // If a different panel is already open, transition smoothly by fading out first
    if (isPanelVisible) {
      setIsPanelVisible(false); // Start fade-out of old panel
      setTimeout(openNewPanel, 300); // After fade-out, open the new one
    } else {
      // If no panel is open, just open the new one
      openNewPanel();
    }
  };

  const getDayBackground = (entry: MoodEntry | undefined): string => {
    if (!entry) return 'rgba(55, 65, 81, 0.3)';
    const opacity = 0.15 + entry.intensity * 0.085; // Range from 0.235 to 1.0
    return `rgba(79, 70, 229, ${opacity})`;
  };
  
  const weeks = useMemo(() => {
      const firstDay = startOfWeek(startOfMonth(currentDate), { locale: ptBR });
      const lastDay = endOfWeek(endOfMonth(currentDate), { locale: ptBR });
      const days = eachDayOfInterval({ start: firstDay, end: lastDay });
      const chunks = [];
      for (let i = 0; i < days.length; i += 7) {
          chunks.push(days.slice(i, i + 7));
      }
      return chunks;
  }, [currentDate]);

  return (
    <div className="w-full h-full flex flex-col">
       <div className="flex items-center justify-between mb-4 px-2">
            <button 
                onClick={() => setCurrentDate(subMonths(currentDate, 1))} 
                className="p-1.5 rounded-md border border-gray-400 text-gray-400 hover:bg-white hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-semibold capitalize">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</h3>
            <button 
                onClick={() => setCurrentDate(addMonths(currentDate, 1))} 
                className="p-1.5 rounded-md border border-gray-400 text-gray-400 hover:bg-white hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={isSameMonth(currentDate, new Date())}
            >
                <ChevronRightIcon className="w-6 h-6" />
            </button>
        </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => <div key={day}>{day}</div>)}
      </div>
      <div className="flex flex-col flex-1 gap-1.5">
        {weeks.map((week, weekIndex) => {
            const isDetailsRow = panelPosition && week.some(day => isSameDay(day, panelPosition));
            return (
                <React.Fragment key={weekIndex}>
                    <div className="grid grid-cols-7 gap-1.5 flex-1">
                        {week.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const entry = dataByDate[dateStr];
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            
                            return (
                                <div
                                key={dateStr}
                                onClick={() => handleDayClick(day, !!entry)}
                                className={`w-full h-full rounded-md transition-all duration-200 border-2 flex flex-col p-1 relative ${!!entry ? 'cursor-pointer' : 'cursor-default'}`}
                                style={{
                                    background: isCurrentMonth ? getDayBackground(entry) : 'rgba(31, 41, 55, 0.2)',
                                    borderColor: isToday(day) ? '#a78bfa' : 'transparent',
                                }}
                                >
                                <span className={`text-xs font-medium ${isCurrentMonth ? 'text-white' : 'text-gray-600'}`}>{format(day, 'd')}</span>
                                <div className="flex-1 flex items-center justify-center -mt-1">
                                    {isCurrentMonth && entry && (
                                        <span className="text-lg leading-none opacity-100">
                                            {entry.moods.map(moodId => MOODS[moodId]?.emoji).join('')}
                                        </span>
                                    )}
                                </div>
                                </div>
                            );
                        })}
                    </div>
                    {isDetailsRow && panelData && (
                         <DetailsPanel 
                            entry={panelData} 
                            allTags={allTags} 
                            onClose={handleClosePanel}
                            isVisible={isPanelVisible}
                        />
                    )}
                </React.Fragment>
            )
        })}
      </div>
    </div>
  );
};

const DetailsPanel: React.FC<{entry: MoodEntry; allTags: Record<string, string>; onClose: () => void; isVisible: boolean;}> = ({ entry, allTags, onClose, isVisible }) => {
    const intensityOpacity = 0.15 + entry.intensity * 0.085;
    const intensityColor = `rgba(79, 70, 229, ${intensityOpacity})`;

    return (
    <div className={`bg-gray-700/60 col-span-7 rounded-lg p-4 mb-1.5 relative backdrop-blur-sm border border-gray-600 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute top-2 right-2">
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="font-bold mb-4 text-white text-base text-center">
            {format(new Date(entry.date.replace(/-/g, '/')), 'EEEE, dd MMMM yyyy', { locale: ptBR })}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col items-center text-center">
                <h5 className="font-semibold text-gray-400 mb-2 uppercase text-xs tracking-wider">Humor</h5>
                <div className="flex items-center justify-center gap-2">
                    {entry.moods.map(moodId => {
                        const mood = MOODS[moodId];
                        return mood ? (
                            <div key={moodId} className="text-center">
                                <span className="text-3xl">{mood.emoji}</span>
                                <p className="text-xs text-gray-300 mt-1">{mood.label}</p>
                            </div>
                        ) : null;
                    })}
                </div>
            </div>

            <div className="flex flex-col items-center">
                <h5 className="font-semibold text-gray-400 mb-2 uppercase text-xs tracking-wider">Intensidade</h5>
                <div 
                    className="flex items-center justify-center w-12 h-12 rounded-full"
                    style={{ backgroundColor: intensityColor }}
                >
                    <span className="text-xl font-bold text-white">{entry.intensity}</span>
                </div>
            </div>

            <div className="flex flex-col items-center">
                <h5 className="font-semibold text-gray-400 mb-2 uppercase text-xs tracking-wider">Tags</h5>
                {entry.tags.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {entry.tags.map(tag => {
                            const color = allTags[tag] ?? '#9ca3af';
                            return <span key={tag} className="text-xs px-2 py-1 rounded-full border" style={{ color, borderColor: color, backgroundColor: `${color}20` }}>{tag}</span>
                        })}
                    </div>
                ) : <p className="text-gray-500 italic text-xs">Nenhuma tag</p>}
            </div>
            
            <div className="sm:col-span-2 md:col-span-1 flex flex-col items-center text-center">
                <h5 className="font-semibold text-gray-400 mb-2 uppercase text-xs tracking-wider">Notas</h5>
                <p className="text-gray-300 text-xs break-words max-h-24 w-full overflow-y-auto pr-2">{entry.notes || <span className="text-gray-500 italic">Nenhuma nota</span>}</p>
            </div>
        </div>
    </div>
    );
};


const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);


export default MoodCalendar;