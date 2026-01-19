import { useState } from 'react';
import { Header } from './components/Header';
import { Announcements } from './components/Announcements';
import { Events } from './components/Events';
import { Moments } from './components/Moments';
import { Calendar, Bell, Heart } from 'lucide-react';

type Tab = 'announcements' | 'events' | 'moments';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('announcements');

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8 gap-4 flex-wrap">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === 'announcements'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <Bell className="w-5 h-5" />
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Events
          </button>
          <button
            onClick={() => setActiveTab('moments')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === 'moments'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <Heart className="w-5 h-5" />
            Moments
          </button>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'announcements' && <Announcements />}
          {activeTab === 'events' && <Events />}
          {activeTab === 'moments' && <Moments />}
        </div>
      </div>
    </div>
  );
}
