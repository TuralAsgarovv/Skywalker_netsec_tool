
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  FileSearch, 
  Bug, 
  MessageSquareCode, 
  Zap, 
  Settings as SettingsIcon,
  Bell,
  Search,
  Activity,
  BarChart3,
  ExternalLink,
  Database,
  Menu,
  X
} from 'lucide-react';
import { View } from './types';
import Dashboard from './components/Dashboard';
import HeaderAudit from './components/HeaderAudit';
import OwaspAdvisor from './components/OwaspAdvisor';
import AIChat from './components/AIChat';
import VulnExplainer from './components/VulnExplainer';
import Settings from './components/Settings';
import CVEHub from './components/CVEHub';
import Disclaimer from './components/Disclaimer';

const RebelAllianceLogo = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    className={className}
    fill="currentColor"
  >
    <path d="M50 10 L58.5 21.6 C67.1 27 74.1 34.4 79.4 43.9 C76.3 40.6 73.6 36.7 71.3 32 C69.9 40.3 65.1 47.6 58.4 52 L58.4 71.5 C63 70.7 67.8 70.3 72.9 70.3 C81.7 70.3 90 71.4 97.2 73.4 C88.9 91.3 71.2 103.2 50.3 103.2 C29.4 103.2 11.7 91.3 3.4 73.4 C10.6 71.4 18.9 70.3 27.7 70.3 C32.8 70.3 37.6 70.7 42.2 71.5 L42.2 52 C35.5 47.6 30.7 40.3 29.3 32 C27 36.7 24.3 40.6 21.2 43.9 C26.5 34.4 33.5 27 42.1 21.6 L50.6 10 Z" transform="translate(0, -10)" />
  </svg>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [systemLoad, setSystemLoad] = useState(0.42);
  const [navFilter, setNavFilter] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAccepted, setIsAccepted] = useState(() => {
    return localStorage.getItem('skywalker_disclaimer_accepted') === 'true';
  });
  const [language, setLanguage] = useState<'en' | 'az'>(() => {
    return (localStorage.getItem('skywalker_lang') as 'en' | 'az') || 'en';
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(prev => Math.max(0.1, Math.min(0.8, prev + (Math.random() - 0.5) * 0.05)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSetLanguage = (lang: 'en' | 'az') => {
    setLanguage(lang);
    localStorage.setItem('skywalker_lang', lang);
  };

  const handleAcceptTerms = () => {
    setIsAccepted(true);
    localStorage.setItem('skywalker_disclaimer_accepted', 'true');
  };

  const translations = useMemo(() => ({
    en: {
      dashboard: 'Audit Dashboard',
      headerAudit: 'Header Analysis',
      compliance: 'Compliance Standards',
      vulnDb: 'Vulnerability Database',
      cveHub: 'CVE Intelligence',
      aiChat: 'AI Security Assistant',
      settings: 'System Preferences',
      filter: 'Filter modules...',
      cpu: 'CPU Usage',
      systemStatus: 'System Status:',
      operational: 'Operational',
      noResults: 'No results found',
      created: 'Created by Skywalker'
    },
    az: {
      dashboard: 'Audit Paneli',
      headerAudit: 'Başlıq Analizi',
      compliance: 'Uyğunluq Standartları',
      vulnDb: 'Boşluqlar Bazası',
      cveHub: 'CVE Kəşfiyyatı',
      aiChat: 'Sİ Təhlükəsizlik Köməkçisi',
      settings: 'Sistem Parametrləri',
      filter: 'Modulları filtrlə...',
      cpu: 'CPU Yüklənməsi',
      systemStatus: 'Sistem Statusu:',
      operational: 'İşləkdir',
      noResults: 'Nəticə tapılmadı',
      created: 'Skywalker tərəfindən yaradılıb'
    }
  }[language]), [language]);

  const sidebarItems = useMemo(() => [
    { id: View.DASHBOARD, label: translations.dashboard, icon: LayoutDashboard },
    { id: View.HEADER_AUDIT, label: translations.headerAudit, icon: FileSearch },
    { id: View.CVE_HUB, label: translations.cveHub, icon: Database },
    { id: View.OWASP_ADVISOR, label: translations.compliance, icon: Shield },
    { id: View.VULN_EXPLAINER, label: translations.vulnDb, icon: Bug },
    { id: View.AI_CHAT, label: translations.aiChat, icon: MessageSquareCode },
  ], [translations]);

  const filteredSidebarItems = sidebarItems.filter(item => 
    item.label.toLowerCase().includes(navFilter.toLowerCase())
  );

  const renderContent = () => {
    return (
      <div className="view-transition h-full">
        {(() => {
          switch (activeView) {
            case View.DASHBOARD: return <Dashboard language={language} />;
            case View.HEADER_AUDIT: return <HeaderAudit language={language} />;
            case View.CVE_HUB: return <CVEHub language={language} />;
            case View.OWASP_ADVISOR: return <OwaspAdvisor language={language} />;
            case View.AI_CHAT: return <AIChat language={language} />;
            case View.VULN_EXPLAINER: return <VulnExplainer language={language} />;
            case View.SETTINGS: return (
              <Settings 
                language={language} 
                setLanguage={handleSetLanguage} 
                onClearHistory={() => setActiveView(View.DASHBOARD)} 
                onBack={() => setActiveView(View.DASHBOARD)}
              />
            );
            default: return <Dashboard language={language} />;
          }
        })()}
      </div>
    );
  };

  if (!isAccepted) {
    return (
      <Disclaimer 
        language={language} 
        setLanguage={handleSetLanguage} 
        onAccept={handleAcceptTerms} 
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'} border-r border-slate-800 bg-slate-900/40 backdrop-blur-xl flex flex-col transition-all duration-300 ease-in-out z-50`}
      >
        <div className="p-8 pb-10 flex items-center gap-4">
          <div 
            className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center cursor-pointer shadow-lg shadow-red-900/20 active:scale-95 transition-transform" 
            onClick={() => setActiveView(View.DASHBOARD)}
          >
            <RebelAllianceLogo className="text-white" size={28} />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter text-white leading-none">SKYWALKER</h1>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1 block">Security AI</span>
          </div>
        </div>

        <div className="px-6 mb-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={14} />
            <input 
              type="text" 
              placeholder={translations.filter} 
              value={navFilter}
              onChange={(e) => setNavFilter(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {filteredSidebarItems.length > 0 ? (
            filteredSidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
                  activeView === item.id 
                    ? 'text-white bg-blue-600 shadow-lg shadow-blue-900/20' 
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <item.icon size={18} className={activeView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400 transition-colors'} />
                <span className="text-xs font-bold tracking-tight">{item.label}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-slate-600">
              <p className="text-xs italic">{translations.noResults}</p>
            </div>
          )}
        </nav>

        <div className="p-6 border-t border-slate-800/50 space-y-4">
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{translations.cpu}</span>
              <span className="text-[10px] font-mono font-black text-blue-500">{(systemLoad * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-1000 ease-out" 
                style={{ width: `${systemLoad * 100}%` }} 
              />
            </div>
          </div>

          <div className="flex flex-col items-center pt-2">
            <a 
              href="https://guns.lol/turalinc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[9px] font-black text-slate-500 hover:text-blue-400 transition-all uppercase tracking-[0.3em] flex items-center gap-2 group"
            >
              {translations.created}
              <ExternalLink size={10} className="mb-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col overflow-hidden bg-slate-950">
        <header className="h-20 border-b border-slate-800 bg-slate-900/20 backdrop-blur-md flex items-center justify-between px-10 z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{translations.systemStatus}</span>
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{translations.operational}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <BarChart3 size={14} className="text-blue-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Nodes: 24</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <button className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all hover:border-slate-700">
              <Bell size={18} />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900" />
            </button>
            <button 
              onClick={() => setActiveView(View.SETTINGS)}
              className={`p-2.5 rounded-xl border transition-all ${
                activeView === View.SETTINGS 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:bg-slate-700'
              }`}
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto pb-20">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
