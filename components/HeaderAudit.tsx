import React, { useState, useMemo } from 'react';
import { analyzeHeaders } from '../services/gemini';
import { HeaderAnalysisResult, HeaderFinding } from '../types';
import { 
  Loader2, CheckCircle, XCircle, AlertTriangle, 
  ShieldAlert, Award, Terminal, Copy, Check, Info, 
  Zap, Lock, Shield, Eye, Server, RefreshCw
} from 'lucide-react';

interface HeaderAuditProps {
  language: 'en' | 'az';
}

const HeaderAudit: React.FC<HeaderAuditProps> = ({ language }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HeaderAnalysisResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const t = useMemo(() => ({
    en: {
      title: 'Protocol & Policy Auditor',
      subtitle: 'Deep-dive into HTTP response headers for security and privacy.',
      newAudit: 'New Audit',
      pasteLabel: 'Paste Raw HTTP Headers',
      placeholder: 'HTTP/2 200 OK\nserver: cloudflare...',
      execute: 'Execute Audit',
      executing: 'Performing Audit...',
      summary: 'Executive Summary',
      missing: 'Critical Compliance Gaps',
      postureScore: 'Posture Score',
      allSecure: 'All critical security headers are present.',
      impact: 'Impact Assessment',
      rec: 'Recommendation',
      snippet: 'Remediation Snippet'
    },
    az: {
      title: 'Protokol və Siyasət Auditi',
      subtitle: 'Təhlükəsizlik və məxfilik üçün HTTP cavab başlıqlarını dərindən analiz edin.',
      newAudit: 'Yeni Audit',
      pasteLabel: 'Xam HTTP Başlıqlarını Daxil Edin',
      placeholder: 'HTTP/2 200 OK\nserver: cloudflare...',
      execute: 'Auditi İcra Et',
      executing: 'Audit aparılır...',
      summary: 'İcraçı Xülasə',
      missing: 'Kritik Uyğunluq Boşluqları',
      postureScore: 'Vəziyyət Balı',
      allSecure: 'Bütün kritik təhlükəsizlik başlıqları mövcuddur.',
      impact: 'Təsir Qiymətləndirməsi',
      rec: 'Tövsiyə',
      snippet: 'Düzəliş Kodu'
    }
  }[language]), [language]);

  const handleAudit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const data = await analyzeHeaders(input);
      setResult(data);
    } catch (err) {
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pass': return <CheckCircle size={18} className="text-green-500" />;
      case 'Fail': return <XCircle size={18} className="text-red-500" />;
      default: return <AlertTriangle size={18} className="text-amber-500" />;
    }
  };

  const findingsByCategory = result?.findings.reduce((acc, finding) => {
    if (!acc[finding.category]) acc[finding.category] = [];
    acc[finding.category].push(finding);
    return acc;
  }, {} as Record<string, HeaderFinding[]>);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{t.title}</h2>
          <p className="text-slate-400 font-medium">{t.subtitle}</p>
        </div>
        {result && (
          <button 
            onClick={() => { setResult(null); setInput(''); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-black uppercase transition-all shadow-xl"
          >
            <RefreshCw size={14} /> {t.newAudit}
          </button>
        )}
      </div>

      {!result ? (
        <div className="card p-10 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10">
            <Lock size={200} className="text-blue-500" />
          </div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600/10 rounded-xl">
              <Terminal size={20} className="text-blue-500" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Response Inspector</span>
              <p className="text-white font-black uppercase tracking-tight">{t.pasteLabel}</p>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="w-full h-80 bg-slate-950/80 border border-slate-800 rounded-2xl p-8 text-blue-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none shadow-inner"
          />
          <div className="mt-8 flex items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 italic font-medium">
              <Info size={16} className="text-blue-500" />
              <span>Provide the complete raw output from curl -I or devtools.</span>
            </div>
            <button
              onClick={handleAudit}
              disabled={loading || !input.trim()}
              className="px-10 py-3.5 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-500 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/30 uppercase tracking-widest text-xs"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
              {loading ? t.executing : t.execute}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 card p-10 flex flex-col items-center justify-center text-center shadow-2xl">
               <div className="relative w-44 h-44 flex items-center justify-center mb-8">
                  <svg className="absolute w-full h-full -rotate-90">
                    <circle cx="88" cy="88" r="80" fill="transparent" stroke="#1e293b" strokeWidth="10" />
                    <circle 
                      cx="88" cy="88" r="80" 
                      fill="transparent" 
                      stroke="#3b82f6" 
                      strokeWidth="10" 
                      strokeDasharray={502}
                      strokeDashoffset={502 - (502 * result.score) / 100}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-black text-white italic tracking-tighter">{result.score}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{t.postureScore}</span>
                  </div>
               </div>
               <span className="px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-black text-blue-500 uppercase tracking-widest">
                 {result.riskLevel} Risk
               </span>
            </div>

            <div className="lg:col-span-3 card p-10 shadow-2xl space-y-8">
               <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">{t.summary}</h3>
                  <Award size={24} className="text-blue-500" />
               </div>
               <p className="text-lg text-slate-400 leading-relaxed italic border-l-4 border-blue-600/30 pl-8 py-4 bg-blue-600/5 rounded-r-3xl">
                 {result.summary}
               </p>
               
               <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                    <ShieldAlert size={16} className="text-red-500" /> {t.missing}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {result.missingHeaders.map((h, i) => (
                      <span key={i} className="px-4 py-2 bg-red-500/5 border border-red-500/20 text-red-500 rounded-xl text-[11px] font-black font-mono shadow-sm uppercase">
                        {h}
                      </span>
                    ))}
                    {result.missingHeaders.length === 0 && (
                      <span className="text-sm text-green-500 font-black flex items-center gap-3 bg-green-500/5 px-6 py-3 rounded-2xl border border-green-500/20 italic">
                        <CheckCircle size={18} /> {t.allSecure}
                      </span>
                    )}
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {result.findings.map((f, i) => (
              <div key={i} className="card p-8 hover:border-slate-700 transition-all flex flex-col gap-6 group shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl group-hover:bg-blue-600 transition-colors group-hover:text-white text-blue-500">
                       {f.category === 'Security' ? <Shield size={18} /> : 
                        f.category === 'Privacy' ? <Eye size={18} /> : 
                        f.category === 'Performance' ? <Zap size={18} /> : 
                        <Server size={18} />}
                    </div>
                    <div>
                       <p className="text-lg font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{f.header}</p>
                       <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{f.category} Vector</span>
                    </div>
                  </div>
                  {getStatusIcon(f.status)}
                </div>

                <div className="space-y-5">
                   <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800 shadow-inner">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{t.impact}</p>
                      <p className="text-sm text-slate-400 leading-relaxed font-medium italic">{f.impact}</p>
                   </div>
                   
                   <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">{t.rec}</p>
                      <p className="text-sm text-slate-300 font-bold">{f.recommendation}</p>
                   </div>

                   {f.remediationSnippet && (
                     <div className="bg-black rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                       <div className="flex items-center justify-between px-5 py-3 bg-slate-900/50 border-b border-slate-800">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t.snippet}</span>
                          <button onClick={() => handleCopy(f.remediationSnippet!, i)} className="p-1.5 hover:text-blue-400 transition-colors">
                            {copiedIndex === i ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                       </div>
                       <pre className="p-6 text-[11px] text-blue-500 font-mono overflow-x-auto whitespace-pre leading-relaxed">{f.remediationSnippet}</pre>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderAudit;