import React, { useState, useRef, useEffect, useMemo } from 'react';
import { explainVulnerability } from '../services/gemini';
import { Bug, Search, Loader2, BookOpen, Terminal, ChevronRight, Layout, Database, Cloud, Cpu, Orbit, SearchX } from 'lucide-react';

interface VulnExplainerProps {
  language: 'en' | 'az';
}

const VulnExplainer: React.FC<VulnExplainerProps> = ({ language }) => {
  const [query, setQuery] = useState('');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeCategory, setActiveCategory] = useState<string | null>('Web & API');
  
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const t = useMemo(() => ({
    en: {
      title: 'Security Knowledge Engine',
      subtitle: 'Explore the deep mechanics of vulnerabilities across the modern tech stack.',
      domains: 'Knowledge Domains',
      vulns: 'Vulnerabilities',
      placeholder: "Query technical mechanics (e.g., 'Blind SQLi in GraphQL')...",
      exploreBtn: 'Explore',
      analyzing: 'Analyzing Vector Mechanics',
      consulting: 'Consulting deep-learning security models...',
      advisory: 'Security Advisory',
      archive: 'Technical Archives Database',
      ready: 'Researcher Terminal Ready',
      readyDesc: 'Select a domain or query the neural database for comprehensive technical analysis.'
    },
    az: {
      title: 'Təhlükəsizlik Bilik Mühərriki',
      subtitle: 'Müasir texnologiya yığınında zəifliklərin dərin mexanikasını araşdırın.',
      domains: 'Bilik Sahələri',
      vulns: 'Zəifliklər',
      placeholder: "Texniki mexanikanı sorğulayın (məs: 'GraphQL-də Blind SQLi')...",
      exploreBtn: 'Araşdır',
      analyzing: 'Vektor Mexanikası Analiz Edilir',
      consulting: 'Dərin öyrənmə təhlükəsizlik modellərinə müraciət edilir...',
      advisory: 'Təhlükəsizlik Bildirişi',
      archive: 'Texniki Arxivlər Bazası',
      ready: 'Tədqiqatçı Terminalı Hazırdır',
      readyDesc: 'Hərtərəfli texniki analiz üçün bir sahə seçin və ya neyron bazanı sorğulayın.'
    }
  }[language]), [language]);

  const VULN_CATEGORIES = [
    {
      name: language === 'en' ? 'Web & API' : 'Veb və API',
      icon: Layout,
      items: [
        'Cross-Site Scripting (XSS)',
        'SQL Injection (SQLi)',
        'Broken Access Control',
        'Server-Side Request Forgery (SSRF)',
        'Insecure Direct Object References (IDOR)',
        'API BOLA (Broken Object Level Authorization)',
      ]
    },
    {
      name: language === 'en' ? 'Infrastructure & OS' : 'İnfrastruktur və ƏS',
      icon: Cpu,
      items: [
        'Command Injection',
        'Directory Traversal',
        'Privilege Escalation',
        'Buffer Overflow',
        'Race Conditions',
      ]
    },
    {
      name: language === 'en' ? 'Cloud & DevOps' : 'Bulud və DevOps',
      icon: Cloud,
      items: [
        'S3 Bucket Misconfiguration',
        'Insecure Kubernetes API',
        'IAM Policy Over-permissioning',
        'Supply Chain Attack',
      ]
    },
    {
      name: language === 'en' ? 'Modern Threats' : 'Müasir Təhdidlər',
      icon: Bug,
      items: [
        'Prompt Injection (LLM)',
        'Insecure Output Handling (LLM)',
        'Zero-Day Exploitation',
        'Subdomain Takeover'
      ]
    }
  ];

  const COMMON_VULNS = useMemo(() => VULN_CATEGORIES.flatMap(cat => cat.items), [VULN_CATEGORIES]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExplain = async (vulnName: string) => {
    if (!vulnName.trim()) return;
    setLoading(true);
    setQuery(vulnName);
    setShowSuggestions(false);
    try {
      const result = await explainVulnerability(vulnName);
      setExplanation(result);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const onInputChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 0) {
      const filtered = COMMON_VULNS.filter(v => 
        v.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') handleExplain(query);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleExplain(suggestions[selectedIndex]);
      } else {
        handleExplain(query);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-10 animate-in slide-up">
      <div className="text-center space-y-3">
        <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase">{t.title}</h2>
        <p className="text-slate-500 font-medium max-w-3xl mx-auto uppercase tracking-wider text-xs">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] mb-4 px-2">{t.domains}</p>
            {VULN_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`w-full text-left px-5 py-3.5 rounded-2xl border flex items-center justify-between transition-all group ${
                  activeCategory === cat.name 
                    ? 'bg-blue-600/10 border-blue-600/40 text-blue-400 shadow-lg shadow-blue-900/10' 
                    : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <cat.icon size={18} className={activeCategory === cat.name ? 'text-blue-500' : 'text-slate-700 group-hover:text-blue-400'} />
                  <span className="text-xs font-black uppercase tracking-tight">{cat.name}</span>
                </div>
                <ChevronRight size={14} className={activeCategory === cat.name ? 'opacity-100' : 'opacity-0'} />
              </button>
            ))}
          </div>

          {activeCategory && (
            <div className="space-y-2 animate-in slide-up">
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] mb-4 px-2">{t.vulns}</p>
              <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {VULN_CATEGORIES.find(c => c.name === activeCategory)?.items.map(v => (
                   <button
                    key={v}
                    onClick={() => handleExplain(v)}
                    className="w-full text-left px-5 py-2.5 text-[11px] font-black rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-white hover:border-blue-500 transition-all truncate uppercase tracking-tight"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="relative" ref={searchContainerRef}>
            <div className="flex gap-3 p-2 bg-slate-900 border border-slate-800 rounded-2xl relative z-10 shadow-2xl focus-within:border-blue-500/50 transition-all">
              <div className="flex-1 flex items-center gap-4 px-4">
                <Search size={22} className="text-slate-600" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.placeholder}
                  className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-200 py-3 font-bold placeholder:text-slate-700"
                />
              </div>
              <button
                onClick={() => handleExplain(query)}
                disabled={loading || !query.trim()}
                className="px-10 py-3 bg-blue-600 text-white font-black rounded-xl text-xs hover:bg-blue-500 transition-all flex items-center gap-3 shadow-lg shadow-blue-900/30 uppercase tracking-widest italic"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <BookOpen size={18} />}
                {t.exploreBtn}
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      onClick={() => handleExplain(suggestion)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full text-left px-8 py-5 text-xs flex items-center justify-between transition-colors border-b border-slate-800/40 last:border-none ${
                        index === selectedIndex ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <Bug size={18} className={index === selectedIndex ? 'text-white' : 'text-slate-700'} />
                        <span className="font-black uppercase tracking-tight">{suggestion}</span>
                      </div>
                      <ChevronRight size={16} className={index === selectedIndex ? 'text-white' : 'text-slate-800'} />
                    </button>
                  ))}
                </div>
                <div className="p-3 bg-slate-950 text-[10px] text-slate-700 text-center uppercase tracking-[0.3em] font-black">
                  {t.archive}
                </div>
              </div>
            )}
          </div>

          <div className="card min-h-[600px] p-12 relative shadow-2xl overflow-hidden group border-slate-800/50">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Orbit size={250} className="text-blue-500 animate-spin-slow" />
            </div>
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-8">
                <Loader2 size={48} className="animate-spin text-blue-600" />
                <div className="space-y-2">
                  <p className="text-2xl font-black text-white uppercase tracking-[0.3em] italic">{t.analyzing}</p>
                  <p className="text-sm text-slate-500 font-medium italic">{t.consulting}</p>
                </div>
              </div>
            ) : explanation ? (
              <div className="animate-in slide-up max-w-none">
                <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-8">
                  <div>
                    <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2 block">{t.advisory}</span>
                    <h3 className="text-4xl font-black text-white m-0 tracking-tighter flex items-center gap-5 italic uppercase">
                      <Terminal size={32} className="text-blue-500" />
                      {query}
                    </h3>
                  </div>
                </div>
                <div className="text-slate-400 text-base leading-relaxed whitespace-pre-wrap font-medium selection:bg-blue-600/40 first-letter:text-4xl first-letter:font-black first-letter:text-white first-letter:mr-1 first-letter:float-left">
                  {explanation}
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-16 opacity-30">
                <div className="p-8 bg-slate-800/40 rounded-3xl mb-8 border border-slate-700 shadow-inner">
                  <Terminal size={80} className="text-slate-700" />
                </div>
                <h4 className="text-2xl font-black text-slate-500 mb-3 uppercase tracking-tighter italic">{t.ready}</h4>
                <p className="text-xs text-slate-600 max-w-sm uppercase font-black tracking-[0.2em] leading-relaxed">{t.readyDesc}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VulnExplainer;