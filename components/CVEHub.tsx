import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, ShieldCheck, Loader2, RefreshCw, ExternalLink, 
  Search, Calendar, Activity, Database, AlertCircle,
  Link as LinkIcon, Triangle, ChevronRight, X, SearchX
} from 'lucide-react';
import { getLiveCVEData, CVEInfo } from '../services/gemini';
import { GroundingSource } from '../types';

interface CVEHubProps {
  language: 'en' | 'az';
}

const CVEHub: React.FC<CVEHubProps> = ({ language }) => {
  const [cves, setCves] = useState<CVEInfo[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [activeCve, setActiveCve] = useState<CVEInfo | null>(null);

  const t = useMemo(() => ({
    en: {
      title: 'CVE Intelligence',
      subtitle: 'Real-time vulnerability feeds from global research nodes',
      syncBtn: 'Synchronize Feed',
      placeholder: 'Search by ID, product, or keyword...',
      loading: 'Accessing Global CVE Nodes',
      synthesizing: 'Synthesizing vulnerability intelligence graph...',
      noIntel: 'No Intelligence Matching Criteria',
      grounding: 'Grounding Sources',
      neuralSync: 'Neural Synchronicity',
      neuralDesc: 'Data is retrieved via real-time OSINT queries to the NVD, Mitre, and primary security advisory nodes.',
      techDesc: 'Technical Description',
      riskAssess: 'Risk Assessment',
      targetScope: 'Target Scope',
      closeReport: 'Close Report',
      all: 'All',
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      impact: 'IMPACT'
    },
    az: {
      title: 'CVE Kəşfiyyatı',
      subtitle: 'Qlobal tədqiqat düyünlərindən real vaxt boşluq axını',
      syncBtn: 'Axını Yenilə',
      placeholder: 'ID, məhsul və ya açar sözlə axtarın...',
      loading: 'Qlobal CVE Düyünlərinə Giriş',
      synthesizing: 'Zəiflik kəşfiyyat qrafı sintez edilir...',
      noIntel: 'Kriteryalara uyğun kəşfiyyat tapılmadı',
      grounding: 'Məlumat Mənbələri',
      neuralSync: 'Neyron Sinxronizasiyası',
      neuralDesc: 'Məlumatlar NVD, Mitre və əsas təhlükəsizlik məsləhət düyünlərinə real vaxt OSINT sorğuları vasitəsilə əldə edilir.',
      techDesc: 'Texniki Təsvir',
      riskAssess: 'Risk Qiymətləndirməsi',
      targetScope: 'Hədəf Sahəsi',
      closeReport: 'Hesabatı Bağla',
      all: 'Hamısı',
      critical: 'Kritik',
      high: 'Yüksək',
      medium: 'Orta',
      low: 'Aşağı',
      impact: 'TƏSİR'
    }
  }[language]), [language]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { cves, sources } = await getLiveCVEData();
      setCves(cves);
      setSources(sources);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCves = useMemo(() => cves.filter(cve => {
    const matchesFilter = cve.id.toLowerCase().includes(filter.toLowerCase()) || 
                          cve.title.toLowerCase().includes(filter.toLowerCase()) ||
                          cve.affected.toLowerCase().includes(filter.toLowerCase());
    const matchesSeverity = selectedSeverity === 'All' || cve.severity === selectedSeverity;
    return matchesFilter && matchesSeverity;
  }), [cves, filter, selectedSeverity]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/10 text-red-500 border-red-500/20 shadow-lg shadow-red-900/10';
      case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-lg shadow-orange-900/10';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-lg shadow-yellow-900/10';
      case 'Low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-lg shadow-blue-900/10';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-10 animate-in slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-2xl">
            <Database className="text-blue-500" size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">{t.title}</h2>
            <p className="text-slate-500 font-medium mt-1 uppercase tracking-wider text-xs">{t.subtitle}</p>
          </div>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
        >
          {loading ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <RefreshCw size={16} className="text-blue-500" />}
          {t.syncBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder={t.placeholder}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-3xl py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-inner font-bold placeholder:text-slate-700"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Critical', 'High', 'Medium'].map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`flex-1 py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                selectedSeverity === sev 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/30' 
                : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
              }`}
            >
              {t[sev.toLowerCase() as keyof typeof t] || sev}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-32 flex flex-col items-center justify-center text-center space-y-8 shadow-inner border-slate-800/50">
          <div className="relative">
            <div className="w-24 h-24 border-8 border-blue-600/5 rounded-full" />
            <div className="w-24 h-24 border-8 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-black text-white uppercase tracking-[0.3em]">{t.loading}</p>
            <p className="text-sm text-slate-500 italic font-medium">{t.synthesizing}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-4">
            {filteredCves.length > 0 ? (
              filteredCves.map((cve) => (
                <button
                  key={cve.id}
                  onClick={() => setActiveCve(cve)}
                  className="w-full text-left card p-8 hover:border-blue-500/30 transition-all group flex flex-col gap-6 shadow-2xl relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1 pr-6">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-black text-white group-hover:text-blue-500 transition-colors italic tracking-tighter">{cve.id}</span>
                        <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getSeverityStyles(cve.severity)}`}>
                          {t[cve.severity.toLowerCase() as keyof typeof t] || cve.severity}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-tight">{cve.title}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
                        <Triangle size={12} className="text-blue-500 fill-blue-500" />
                        <span className="text-xs font-mono font-black text-blue-500 tracking-tighter">{cve.cvss}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-mono">{cve.datePublished}</span>
                    </div>
                  </div>
                  
                  <div className="h-px bg-slate-800/50 w-full" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle size={16} className="text-slate-600" />
                      <span className="text-[11px] font-black text-slate-500 truncate uppercase tracking-widest">{t.targetScope}: <span className="text-slate-300 italic">{cve.affected}</span></span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-blue-500 transition-all group-hover:bg-blue-600 group-hover:text-white text-slate-600">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="card p-24 text-center opacity-30">
                <SearchX size={64} className="text-slate-700 mx-auto mb-6" />
                <p className="text-xl font-black text-slate-600 uppercase tracking-[0.3em]">{t.noIntel}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="card p-8 sticky top-32 space-y-10 shadow-2xl border-slate-800/50">
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <LinkIcon size={16} className="text-blue-500" /> {t.grounding}
                </h3>
                <div className="space-y-3">
                  {sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800/80 rounded-2xl hover:border-blue-500/40 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 transition-colors group-hover:bg-blue-600 group-hover:text-white text-slate-600">
                         <ExternalLink size={14} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[11px] font-black text-slate-300 truncate tracking-tight">{s.title}</p>
                        <p className="text-[9px] text-slate-600 font-mono truncate uppercase mt-1">{s.uri}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-800/50">
                <div className="bg-blue-600/5 rounded-2xl p-6 border border-blue-500/10 shadow-inner">
                   <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                     <ShieldCheck size={14} /> {t.neuralSync}
                   </p>
                   <p className="text-[11px] text-slate-400 leading-relaxed font-bold italic">
                     {t.neuralDesc}
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {activeCve && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-slate-800/50">
            <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-8">
                <div className={`p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl ${getSeverityStyles(activeCve.severity)}`}>
                  <ShieldAlert size={36} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em]">{activeCve.id}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${getSeverityStyles(activeCve.severity).split(' ')[1]}`}>
                      {t[activeCve.severity.toLowerCase() as keyof typeof t] || activeCve.severity} {t.impact}
                    </span>
                  </div>
                  <h3 className="text-4xl font-black text-white tracking-tighter italic leading-none">{activeCve.title}</h3>
                </div>
              </div>
              <button onClick={() => setActiveCve(null)} className="p-4 hover:bg-slate-800 rounded-3xl text-slate-500 hover:text-white transition-all"><X size={32} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar bg-slate-950/20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <section className="space-y-6">
                    <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center gap-3">
                       <ShieldCheck size={16} className="text-blue-500" /> {t.techDesc}
                    </h4>
                    <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 text-[15px] text-slate-400 leading-relaxed font-bold italic shadow-inner">
                      {activeCve.description}
                    </div>
                 </section>
                 <div className="space-y-10">
                    <section className="space-y-6">
                       <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center gap-3">
                          <Activity size={16} className="text-purple-500" /> {t.riskAssess}
                       </h4>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner">
                             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">CVSS Score</p>
                             <p className="text-3xl font-black text-blue-500 font-mono tracking-tighter">{activeCve.cvss}</p>
                          </div>
                          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner">
                             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Pub Date</p>
                             <p className="text-sm font-black text-white uppercase tracking-tight">{activeCve.datePublished}</p>
                          </div>
                       </div>
                    </section>
                    <section className="space-y-6">
                       <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center gap-3">
                          <Triangle size={16} className="text-amber-500" /> {t.targetScope}
                       </h4>
                       <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner">
                          <p className="text-sm font-bold text-slate-400 leading-relaxed italic uppercase tracking-tight">
                            {activeCve.affected}
                          </p>
                       </div>
                    </section>
                 </div>
              </div>
            </div>
            
            <div className="p-10 border-t border-slate-800 bg-slate-900/60 flex justify-end">
               <button onClick={() => setActiveCve(null)} className="px-12 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl text-sm transition-all shadow-xl">{t.closeReport}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVEHub;