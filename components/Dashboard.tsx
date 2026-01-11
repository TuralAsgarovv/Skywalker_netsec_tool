import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { 
  ShieldCheck, Activity, Globe, Info, 
  Search, Loader2, ShieldAlert, Cpu, CheckCircle2, ChevronRight,
  Shield, X, ExternalLink, Link as LinkIcon, Orbit, Triangle, 
  SearchX, Radio, Zap, Target, ChevronDown, Filter, Settings2, Clock, AlertTriangle,
  History, Trash2, Calendar, FileText, Radio as RadioIcon, Check, Copy
} from 'lucide-react';
import { analyzeDomain, generateVulnerabilityDeepDive, generateExecutiveSummary, getLatestThreatIntel, analyzeThreatImpact, ExploitOptions, ThreatReport } from '../services/gemini';
import { GroundingSource } from '../types';

interface DashboardProps {
  language: 'en' | 'az';
}

const Dashboard: React.FC<DashboardProps> = ({ language }) => {
  const [url, setUrl] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>(['XSS', 'SQLi', 'Headers']);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentTasks, setCurrentTasks] = useState<string[]>([]);
  const [scanResult, setScanResult] = useState<any>(null);
  const [threatReports, setThreatReports] = useState<ThreatReport[]>([]);
  const [threatSources, setThreatSources] = useState<GroundingSource[]>([]);
  const [isLoadingThreats, setIsLoadingThreats] = useState(true);
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedVuln, setSelectedVuln] = useState<string | null>(null);
  const [isGeneratingDeepDive, setIsGeneratingDeepDive] = useState(false);
  const [deepDiveData, setDeepDiveData] = useState<any>(null);
  const [executiveSummary, setExecutiveSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const [activeThreatAnalysis, setActiveThreatAnalysis] = useState<{report: ThreatReport, analysis: string} | null>(null);
  const [isAnalyzingThreat, setIsAnalyzingThreat] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const deepDiveRef = useRef<HTMLDivElement>(null);

  const t = useMemo(() => ({
    en: {
      title: 'Audit Operations',
      intelFeed: 'Global Intelligence Feed',
      syncing: 'Synchronizing with neural threat nodes...',
      nodePosture: 'Node Posture Active',
      neuralCore: 'Neural Core Ready',
      placeholder: 'Enter domain or IP to audit...',
      startBtn: 'Start Audit',
      modules: 'Modules',
      toggleAll: 'Toggle All',
      analyzing: 'Analyzing:',
      postureEst: 'Posture Established.',
      reconAssets: 'Technical Reconnaissance Assets',
      risksIdentified: 'Risks Identified',
      intelMonitor: 'Intelligence Monitor',
      opHistory: 'Operational History',
      noLogs: 'No logs detected',
      execSummary: 'Executive Summary',
      techImpact: 'Technical Impact Assessment',
      close: 'Close Assessment'
    },
    az: {
      title: 'Audit Əməliyyatları',
      intelFeed: 'Qlobal Kəşfiyyat Axını',
      syncing: 'Neyron təhdid düyünləri ilə sinxronlaşdırılır...',
      nodePosture: 'Düyün Vəziyyəti Aktivdir',
      neuralCore: 'Neyron Nüvəsi Hazırdır',
      placeholder: 'Audit üçün domen və ya IP daxil edin...',
      startBtn: 'Auditi Başlat',
      modules: 'Modullar',
      toggleAll: 'Hamısını seç',
      analyzing: 'Analiz edilir:',
      postureEst: 'Vəziyyət Təyin Edildi.',
      reconAssets: 'Texniki Kəşfiyyat Aktivləri',
      risksIdentified: 'Aşkar Olunmuş Risklər',
      intelMonitor: 'Kəşfiyyat Monitoru',
      opHistory: 'Əməliyyat Tarixçəsi',
      noLogs: 'Giriş qeydə alınmayıb',
      execSummary: 'İcraçı Xülasə',
      techImpact: 'Texniki Təsir Qiymətləndirməsi',
      close: 'Qiymətləndirməni Bağla'
    }
  }[language]), [language]);

  const BASE_SCAN_TASKS = language === 'en' ? [
    "Synchronizing threat intelligence feed",
    "Running advanced Google OSINT queries",
    "Analyzing domain DNS (SPF/DKIM/DMARC)",
    "Identifying server-side signatures",
    "Evaluating SSL/TLS handshake protocols",
  ] : [
    "Təhdid kəşfiyyatı axını sinxronlaşdırılır",
    "Qabaqcıl Google OSINT sorğuları icra edilir",
    "Domen DNS analizi (SPF/DKIM/DMARC)",
    "Server tərəfi imzalar təyin edilir",
    "SSL/TLS əlaqə protokolları qiymətləndirilir",
  ];

  const SCAN_MODULES = [
    { id: 'XSS', label: 'Cross-Site Scripting', description: language === 'en' ? 'Testing for unsanitized input' : 'Təmizlənməmiş girişlərin yoxlanılması' },
    { id: 'SQLi', label: 'SQL Injection', description: language === 'en' ? 'Checking database query vectors' : 'Məlumat bazası sorğu vektorlarının yoxlanılması' },
    { id: 'Auth', label: 'Broken Authentication', description: language === 'en' ? 'Evaluating login management' : 'Giriş idarəetməsinin qiymətləndirilməsi' },
    { id: 'Data', label: 'Sensitive Data Exposure', description: language === 'en' ? 'Scanning for leaked credentials' : 'Sızan etimadnamələrin skan edilməsi' },
    { id: 'API', label: 'API Endpoints', description: language === 'en' ? 'Auditing REST interfaces' : 'REST interfeyslərinin auditi' },
    { id: 'Headers', label: 'Security Headers', description: language === 'en' ? 'Analyzing CSP, HSTS, etc.' : 'CSP, HSTS və s. analizi' },
  ];

  useEffect(() => {
    const savedHistory = localStorage.getItem('skywalker_scan_history');
    if (savedHistory) setScanHistory(JSON.parse(savedHistory));

    const fetchThreats = async () => {
      setIsLoadingThreats(true);
      try {
        const { threats, sources } = await getLatestThreatIntel();
        setThreatReports(threats);
        setThreatSources(sources);
      } catch (e) { console.error(e); }
      finally { setIsLoadingThreats(false); }
    };
    fetchThreats();
  }, []);

  const handleStartScan = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim()) return;

    const moduleTasks = selectedModules.map(mid => 
      SCAN_MODULES.find(m => m.id === mid)?.label || mid
    );
    const allTasks = [...BASE_SCAN_TASKS, ...moduleTasks];

    setCurrentTasks(allTasks);
    setIsScanning(true);
    setScanResult(null);
    setScanProgress(0);
    setScanStepIndex(0);

    const totalSteps = allTasks.length;
    let currentStep = 0;
    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < totalSteps) {
        setScanStepIndex(currentStep);
        setScanProgress((currentStep / totalSteps) * 90);
      } else {
        clearInterval(stepInterval);
      }
    }, 1000);

    try {
      const result = await analyzeDomain(url, selectedModules);
      clearInterval(stepInterval);
      setScanProgress(100);
      setScanResult(result);
      
      const newItem = { id: Date.now(), url, score: result.score, date: new Date().toLocaleString() };
      const updatedHistory = [newItem, ...scanHistory].slice(0, 10);
      setScanHistory(updatedHistory);
      localStorage.setItem('skywalker_scan_history', JSON.stringify(updatedHistory));
    } catch (err) { console.error(err); }
    finally { setIsScanning(false); }
  };

  const handleThreatClick = async (report: ThreatReport) => {
    setIsAnalyzingThreat(true);
    setActiveThreatAnalysis({ report, analysis: '' });
    try {
      const analysis = await analyzeThreatImpact(report);
      setActiveThreatAnalysis({ report, analysis });
    } catch (e) { console.error(e); }
    finally { setIsAnalyzingThreat(false); }
  };

  const filteredRisks = useMemo(() => {
    if (!scanResult?.topRisks) return [];
    return scanResult.topRisks.filter((r: any) => 
      r.name.toLowerCase().includes(riskFilter.toLowerCase())
    );
  }, [scanResult, riskFilter]);

  return (
    <div className="space-y-10">
      {/* Ticker */}
      <div className="relative overflow-hidden bg-slate-900/60 border-y border-slate-800/50 py-3 -mx-10 px-10 group backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 shrink-0 bg-red-600/10 px-4 py-1.5 rounded-lg border border-red-500/20 shadow-lg shadow-red-900/10">
            <RadioIcon size={14} className="text-red-500 animate-pulse" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">{t.intelFeed}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="animate-marquee">
              {isLoadingThreats ? (
                <span className="text-[11px] text-slate-500 font-bold italic tracking-wide">{t.syncing}</span>
              ) : (
                threatReports.concat(threatReports).map((report, i) => (
                  <button key={i} onClick={() => handleThreatClick(report)} className="flex items-center gap-3 hover:text-blue-400 transition-colors mr-16">
                    <span className={`w-2 h-2 rounded-full ${report.impact === 'Critical' ? 'bg-red-500' : 'bg-orange-500'}`} />
                    <span className="text-[10px] font-black text-slate-500 font-mono">[{report.impact}]</span>
                    <span className="text-[11px] text-slate-200 font-bold tracking-tight uppercase">{report.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-white tracking-tighter italic">{t.title.split(' ')[0]} <span className="text-blue-600 not-italic">{t.title.split(' ').slice(1).join(' ')}</span></h2>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg">
               <Activity size={14} className="text-blue-500 animate-pulse" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.nodePosture}</span>
             </div>
             <div className="flex items-center gap-2.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg">
               <ShieldCheck size={14} className="text-green-500" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.neuralCore}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="card p-2 border-slate-800/50 shadow-2xl">
            <form onSubmit={handleStartScan} className="flex flex-col md:flex-row gap-2 relative z-30">
              <div className="flex-1 flex items-center gap-4 px-6 py-3 bg-slate-950/80 rounded-xl border border-slate-800 focus-within:border-blue-500 transition-all">
                <Globe size={18} className="text-slate-600" />
                <input 
                  value={url} 
                  onChange={e => setUrl(e.target.value)} 
                  placeholder={t.placeholder} 
                  className="bg-transparent border-none focus:outline-none w-full text-sm text-white placeholder:text-slate-700 font-bold"
                />
              </div>

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsModuleDropdownOpen(!isModuleDropdownOpen)}
                  className="h-full flex items-center gap-3 px-6 py-3 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-600 transition-all text-sm font-bold text-slate-400"
                >
                  <Settings2 size={18} />
                  <span>{selectedModules.length} {t.modules}</span>
                  <ChevronDown size={14} />
                </button>
                {isModuleDropdownOpen && (
                  <div className="absolute top-full mt-3 right-0 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.modules}</span>
                      <button onClick={() => setSelectedModules(selectedModules.length === SCAN_MODULES.length ? [] : SCAN_MODULES.map(m => m.id))} className="text-[10px] font-black text-blue-500 uppercase">{t.toggleAll}</button>
                    </div>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {SCAN_MODULES.map(m => (
                        <button key={m.id} onClick={() => setSelectedModules(prev => prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id])} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedModules.includes(m.id) ? 'bg-blue-600/10 border-blue-500/30' : 'hover:bg-slate-800'}`}>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedModules.includes(m.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-700 bg-slate-950'}`}>
                            {selectedModules.includes(m.id) && <Check size={12} className="text-white" />}
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-white leading-none">{m.label}</p>
                            <p className="text-[10px] text-slate-500 mt-1">{m.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                disabled={isScanning || !url.trim()}
                className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-900/30 flex items-center gap-3"
              >
                {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                {t.startBtn}
              </button>
            </form>
          </div>

          {isScanning && (
            <div className="card p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{t.analyzing} {url}</p>
                  <h4 className="text-3xl font-black text-white tracking-tighter">
                    {currentTasks[scanStepIndex] || "Finalizing..."}
                  </h4>
                </div>
                <div className="text-4xl font-black text-blue-500 font-mono tracking-tighter">{Math.round(scanProgress)}%</div>
              </div>
              <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-blue-700 to-blue-500 transition-all duration-700 ease-out" style={{ width: `${scanProgress}%` }} />
              </div>
            </div>
          )}

          {scanResult && (
            <div className="space-y-8 animate-in slide-up">
              <div className="card p-10 flex flex-col md:flex-row items-center gap-12">
                 <div className="w-80 h-80 shrink-0 relative bg-slate-950/50 rounded-full border border-slate-800/50 p-6 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={scanResult.categoryScores}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis dataKey="category" tick={{ fill: '#475569', fontSize: 10, fontWeight: '900' }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar dataKey="score" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex-1 space-y-6">
                    <h4 className="text-5xl font-black text-white tracking-tighter italic">{t.postureEst}</h4>
                    <p className="text-base text-slate-400 leading-relaxed font-medium italic border-l-4 border-blue-600/40 pl-8 py-3 bg-blue-600/5 rounded-r-2xl">
                       {scanResult.summary}
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                       {scanResult.technologies.map((tech: string, i: number) => (
                         <span key={i} className="px-4 py-1.5 bg-slate-900/80 rounded-lg text-[10px] font-black text-slate-500 border border-slate-800 uppercase tracking-widest">{tech}</span>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card p-8 shadow-xl">
                  <h3 className="text-xs font-black text-white mb-6 flex items-center gap-3 uppercase tracking-[0.2em]"><Target size={16} className="text-blue-500" /> {t.reconAssets}</h3>
                  <div className="space-y-3">
                    {scanResult.reconnaissance.map((item: any, i: number) => (
                      <div key={i} className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl hover:border-slate-700 transition-all group">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.type}</span>
                          <span className={`text-[10px] font-black uppercase ${item.status.toLowerCase().includes('secure') ? 'text-green-500' : 'text-amber-500'}`}>{item.status}</span>
                        </div>
                        <p className="text-xs font-mono font-bold text-slate-300 truncate group-hover:text-blue-400 transition-colors">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card flex flex-col overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-slate-800 bg-slate-800/10 flex flex-col gap-4">
                    <h3 className="font-black text-white text-xs uppercase tracking-[0.2em] flex items-center gap-3"><ShieldAlert size={18} className="text-red-500" /> {t.risksIdentified}</h3>
                    <div className="relative">
                      <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input value={riskFilter} onChange={e => setRiskFilter(e.target.value)} placeholder="Filter risk vectors..." className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-bold" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[420px]">
                    {filteredRisks.map((r: any, i: number) => (
                      <button key={i} className="w-full text-left p-5 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-blue-500/40 transition-all group flex flex-col gap-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${r.severity.toLowerCase() === 'critical' ? 'text-red-500' : 'text-orange-500'}`}>{r.severity} Impact</span>
                        <h4 className="text-xs font-black text-slate-300 group-hover:text-white transition-colors uppercase tracking-tight">{r.name}</h4>
                        {r.cve && <p className="text-[9px] font-mono font-black text-slate-600 mt-1">{r.cve}</p>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Intel */}
        <div className="lg:col-span-1 space-y-8">
          <div className="card flex flex-col h-[520px] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-800/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                 <h3 className="font-black text-white text-xs uppercase tracking-[0.2em]">{t.intelMonitor}</h3>
              </div>
              {isLoadingThreats && <Loader2 size={14} className="animate-spin text-slate-600" />}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingThreats ? Array.from({length: 4}).map((_, i) => <div key={i} className="h-28 bg-slate-900 animate-pulse rounded-2xl" />) : threatReports.map((report, i) => (
                <button key={i} onClick={() => handleThreatClick(report)} className="w-full text-left p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-blue-500/30 transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase rounded-bl-lg tracking-widest ${report.impact === 'Critical' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'}`}>{report.impact}</div>
                  <h4 className="text-[11px] font-black text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors uppercase tracking-tight">{report.title}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-medium italic mb-4">{report.summary}</p>
                  <span className="text-[9px] text-slate-700 font-black uppercase tracking-widest">{report.date}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card h-[380px] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-800 bg-slate-800/10 flex items-center gap-3">
              <History size={18} className="text-slate-600" />
              <h3 className="font-black text-white text-xs uppercase tracking-[0.2em]">{t.opHistory}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {scanHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                  <History size={40} className="text-slate-800 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t.noLogs}</p>
                </div>
              ) : scanHistory.map((item, i) => (
                <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center group hover:border-blue-500/30 transition-all">
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-white truncate uppercase tracking-tight">{item.url}</p>
                    <p className="text-[9px] text-slate-600 font-black mt-1 uppercase">{item.date}</p>
                  </div>
                  <span className={`text-sm font-black font-mono ${item.score > 80 ? 'text-green-500' : 'text-amber-500'}`}>{item.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Threat Modal */}
      {activeThreatAnalysis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-xl animate-in fade-in">
          <div className="card w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-slate-800">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl shadow-lg ${activeThreatAnalysis.report.impact === 'Critical' ? 'bg-red-600/10 text-red-500 shadow-red-900/10' : 'bg-blue-600/10 text-blue-500 shadow-blue-900/10'}`}>
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">{activeThreatAnalysis.report.title}</h3>
                  <div className="flex items-center gap-5 mt-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Clock size={12} /> {activeThreatAnalysis.report.date}</span>
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={12} /> {activeThreatAnalysis.report.impact} Impact</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveThreatAnalysis(null)} className="p-3 hover:bg-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all"><X size={32} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 space-y-12">
              <section>
                <h4 className="text-[11px] font-black text-blue-500 uppercase mb-5 tracking-[0.3em]">{t.execSummary}</h4>
                <p className="text-lg text-slate-300 leading-relaxed font-bold italic border-l-4 border-blue-600/30 pl-10 py-4 bg-blue-600/5 rounded-r-3xl">{activeThreatAnalysis.report.summary}</p>
              </section>
              <section>
                <h4 className="text-[11px] font-black text-purple-500 uppercase mb-5 tracking-[0.3em]">{t.techImpact}</h4>
                {isAnalyzingThreat ? (
                  <div className="flex flex-col items-center py-20 text-slate-600">
                    <Loader2 size={40} className="animate-spin mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest italic animate-pulse">Synthesizing Neural Strategy...</p>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-10 rounded-3xl border border-slate-800 shadow-inner">
                    <div className="whitespace-pre-wrap text-[15px] text-slate-400 leading-relaxed font-medium">{activeThreatAnalysis.analysis}</div>
                  </div>
                )}
              </section>
            </div>
            <div className="p-8 border-t border-slate-800 bg-slate-900/40 flex justify-end">
               <button onClick={() => setActiveThreatAnalysis(null)} className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl text-sm transition-all shadow-xl">{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;