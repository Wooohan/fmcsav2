
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Scraper } from './pages/Scraper';
import { CarrierSearch } from './pages/CarrierSearch';
import { Subscription } from './pages/Subscription';
import { Landing } from './pages/Landing';
import { AdminPanel } from './pages/AdminPanel';
import { ViewState, User, CarrierData } from './types';
import { Settings } from 'lucide-react';
import { MOCK_USERS } from './services/mockService';

const SettingsPage = () => (
  <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full">
    <div className="bg-slate-800 p-6 rounded-full mb-4">
      <Settings size={48} className="text-indigo-500 animate-spin-slow" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
    <p>User profile and API configuration settings would go here.</p>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  
  // Persistence state for all extracted records
  const [allCarriers, setAllCarriers] = useState<CarrierData[]>([]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    if (userData.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  const handleUpdateUsage = (count: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        recordsExtractedToday: user.recordsExtractedToday + count
      };
      setUser(updatedUser);

      // Sync with Mock DB so Admin panel sees the usage
      const dbIndex = MOCK_USERS.findIndex(u => u.id === user.id);
      if (dbIndex !== -1) {
        MOCK_USERS[dbIndex] = updatedUser;
      }
    }
  };

  const handleNewCarriers = (newData: CarrierData[]) => {
    setAllCarriers(prev => {
      // Prevent duplicates based on MC number
      const existingMcs = new Set(prev.map(c => c.mcNumber));
      const filteredNew = newData.filter(c => !existingMcs.has(c.mcNumber));
      return [...filteredNew, ...prev];
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'scraper':
        return <Scraper 
          user={user!} 
          onUpdateUsage={handleUpdateUsage}
          onNewCarriers={handleNewCarriers}
          onUpgrade={() => setCurrentView('subscription')}
        />;
      case 'carrier-search':
        return <CarrierSearch carriers={allCarriers} />;
      case 'subscription':
        return <Subscription />;
      case 'settings':
        return <SettingsPage />;
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return <Landing onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 ml-64 relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-20 h-screen overflow-hidden">
        {/* Top subtle gradient light effect */}
        <div className="absolute top-0 left-0 w-full h-96 bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full -translate-y-1/2"></div>
        
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
