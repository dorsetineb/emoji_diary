import React, { useState, useMemo } from 'react';
import { MoodEntry, ViewType } from './types';
import { INITIAL_MOOD_DATA, MOODS, PREDEFINED_TAGS } from './constants';
import MoodInput from './components/MoodInput';
import MoodCalendar from './components/MoodCalendar';
import MoodTrends from './components/MoodTrends';
import { format, startOfToday } from 'date-fns';

const App: React.FC = () => {
  const [entries, setEntries] = useState<MoodEntry[]>(INITIAL_MOOD_DATA);
  const [view, setView] = useState<ViewType>('calendar');
  const [allTags, setAllTags] = useState<Record<string, string>>(PREDEFINED_TAGS);

  const todayStr = format(startOfToday(), 'yyyy-MM-dd');
  const todayEntry = useMemo(() => entries.find(e => e.date === todayStr), [entries, todayStr]);

  const handleSaveMood = (newEntryData: Omit<MoodEntry, 'date'> & { newTags?: Record<string, string> }) => {
    const { newTags, ...entryCore } = newEntryData;

    // Update allTags with any newly created tags
    if (newTags && Object.keys(newTags).length > 0) {
      setAllTags(prev => ({ ...prev, ...newTags }));
    }

    setEntries(prevEntries => {
      const existingEntryIndex = prevEntries.findIndex(e => e.date === todayStr);
      const newEntry: MoodEntry = { ...entryCore, date: todayStr };

      if (existingEntryIndex > -1) {
        const updatedEntries = [...prevEntries];
        updatedEntries[existingEntryIndex] = newEntry;
        return updatedEntries;
      } else {
        return [...prevEntries, newEntry];
      }
    });
  };

  const ViewComponent = () => {
    switch (view) {
      case 'calendar':
        return <MoodCalendar data={entries} allTags={allTags} />;
      case 'trends':
        return <MoodTrends data={entries} allTags={allTags} />;
      default:
        return <MoodCalendar data={entries} allTags={allTags} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="max-w-7xl mx-auto w-full">
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <MoodInput onSave={handleSaveMood} existingEntry={todayEntry} allTags={allTags} />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm border border-gray-700 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Suas Visualizações</h2>
                <div className="flex space-x-2 bg-gray-700/50 p-1 rounded-lg">
                  <ViewButton icon={CalendarIcon} label="Calendário" currentView={view} setView={setView} viewType="calendar" />
                  <ViewButton icon={ChartBarIcon} label="Tendências" currentView={view} setView={setView} viewType="trends" />
                </div>
              </div>
              <div className="w-full flex-1 min-h-0">
                <ViewComponent />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

interface ViewButtonProps {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    label: string;
    currentView: ViewType;
    setView: (view: ViewType) => void;
    viewType: ViewType;
}

const ViewButton: React.FC<ViewButtonProps> = ({ icon: Icon, label, currentView, setView, viewType }) => (
    <button
        onClick={() => setView(viewType)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 ${
            currentView === viewType ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600/70'
        }`}
    >
        <Icon className="w-5 h-5" />
        <span className="hidden sm:inline">{label}</span>
    </button>
);


const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" />
    </svg>
);

const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);


export default App;