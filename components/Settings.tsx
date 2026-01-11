import React from 'react';
import { 
  Settings as SettingsIcon, 
  Languages, 
  Trash2, 
  Database, 
  Monitor, 
  Cpu,
  Check,
  Globe,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

interface SettingsProps {
  language: 'en' | 'az';
  setLanguage: (lang: 'en' | 'az') => void;
  onClearHistory: () => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ language, setLanguage, onClearHistory, onBack }) => {
  const t = {
    en: {
      title: 'System Preferences',
      subtitle: 'Configure your Skywalker Security AI environment',
      langTitle: 'Regional & Language',
      langSubtitle: 'Set your preferred interface language',
      dataTitle: 'Data Management',
      dataSubtitle: 'Control your local scan records and history',
      clearBtn: 'Purge Scan History',
      clearConfirm: 'Are you sure? This will permanently delete all saved audits.',
      operationalStatus: 'Operational',
      back: 'Back to Dashboard',
      az: 'Azerbaijani (Azərbaycan)',
      en: 'English'
    },
    az: {
      title: 'Sistem Parametrləri',
      subtitle: 'Skywalker Süni İntellekt mühitini tənzimləyin',
      langTitle: 'Regional və Dil',
      langSubtitle: 'İnterfeys dilini seçin',
      dataTitle: 'Məlumat İdarəetməsi',
      dataSubtitle: 'Lokal skan qeydlərini və tarixçəni idarə edin',
      clearBtn: 'Skan Tarixçəsini Təmizlə',
      clearConfirm: 'Əminsiniz? Bu, bütün saxlanılan auditləri həmişəlik siləcək.',
      operationalStatus: 'İşləkdir',
      back: 'Audit Panelinə Qayıt',
      az: 'Azərbaycan dili',
      en: 'İngilis dili'
    }
  }[language];

  const handleClearHistory = () => {
    if (window.confirm(t.clearConfirm)) {
      localStorage.removeItem('skywalker_scan_history');
      onClearHistory();
    }
  };

  return (
    <div className="space-y-10 animate-in slide-up max-w-5xl mx-auto pb-20">
      <div className="space-y-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-black transition-all border border-slate-800 group shadow-xl uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {t.back}
        </button>
        
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shadow-xl">
            <SettingsIcon className="text-blue-500" size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">{t.title}</h2>
            <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-wider">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Localization Section */}
        <section className="card overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-slate-800 bg-slate-800/20 flex items-center gap-5">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 shadow-lg">
              <Languages size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">{t.langTitle}</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{t.langSubtitle}</p>
            </div>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => setLanguage('en')}
              className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${
                language === 'en' 
                ? 'bg-blue-600/10 border-blue-600 text-white shadow-lg' 
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <Globe size={20} className={language === 'en' ? 'text-blue-500' : 'text-slate-700'} />
                <span className="text-sm font-black uppercase tracking-tight">{t.en}</span>
              </div>
              {language === 'en' && <Check size={20} className="text-blue-500" strokeWidth={3} />}
            </button>

            <button 
              onClick={() => setLanguage('az')}
              className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${
                language === 'az' 
                ? 'bg-blue-600/10 border-blue-600 text-white shadow-lg' 
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <Globe size={20} className={language === 'az' ? 'text-blue-500' : 'text-slate-700'} />
                <span className="text-sm font-black uppercase tracking-tight">{t.az}</span>
              </div>
              {language === 'az' && <Check size={20} className="text-blue-500" strokeWidth={3} />}
            </button>
          </div>
        </section>

        {/* Data Management Section */}
        <section className="card overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-slate-800 bg-slate-800/20 flex items-center gap-5">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-500 shadow-lg">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">{t.dataTitle}</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{t.dataSubtitle}</p>
            </div>
          </div>
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-24 h-24 bg-red-500/5 rounded-full flex items-center justify-center border border-red-500/10 shadow-inner">
              <AlertTriangle size={44} className="text-red-900 opacity-50" />
            </div>
            <div className="max-w-md">
              <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-3 italic">Clear Node Memory</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Purging history will remove all previous audit results, reconnaissance notes, and intelligence logs stored on this node. This action cannot be undone.
              </p>
            </div>
            <button 
              onClick={handleClearHistory}
              className="flex items-center gap-3 px-10 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black transition-all shadow-xl shadow-red-900/30 uppercase tracking-[0.2em] active:scale-95"
            >
              <Trash2 size={16} />
              {t.clearBtn}
            </button>
          </div>
        </section>

        {/* System Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card p-8 flex items-center gap-5 shadow-xl">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 shadow-inner">
              <Monitor size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">Architecture Node</p>
              <p className="text-lg font-black text-white tracking-tight">Skywalker-OS v4.2.0 Stable</p>
            </div>
          </div>
          <div className="card p-8 flex items-center gap-5 shadow-xl">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-green-500 shadow-inner shadow-green-900/5">
              <Cpu size={24} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">Operational State</p>
              <p className="text-lg font-black text-green-500 uppercase tracking-tight">{t.operationalStatus}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;