import React, { useState, useMemo } from 'react';
import { 
  Shield, Lock, Database, ChevronRight, Info, Zap, AlertCircle, 
  Terminal, Loader2, X, LayoutList, Fingerprint, 
  SearchCode, ShieldCheck, FileWarning
} from 'lucide-react';
import { generateComplianceAdvice } from '../services/gemini';

interface OwaspAdvisorProps {
  language: 'en' | 'az';
}

const OwaspAdvisor: React.FC<OwaspAdvisorProps> = ({ language }) => {
  const [selectedStandard, setSelectedStandard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [adviceData, setAdviceData] = useState<any>(null);

  const t = useMemo(() => ({
    en: {
      title: 'OWASP Top 10 Reference',
      subtitle: 'AppSec Compliance',
      desc: 'Standardized technical guidance for identifying and mitigating the most critical web application security risks.',
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      mitigationGuide: 'Technical Mitigation Guide',
      customAudit: 'Custom Compliance Audit',
      customDesc: 'Need a report for a specific industry standard like PCI-DSS v4.0 or HIPAA?',
      requestReport: 'Request Custom Report',
      neuralEngine: 'Neural Mitigation Engine',
      advisoryNote: 'Advisory generation based on latest security benchmarks',
      close: 'Close Advisory',
      rootCause: 'Technical Root Cause',
      compliance: 'Compliance Relevance',
      mitigations: 'Strategic Mitigations',
      verification: 'Verification Procedures'
    },
    az: {
      title: 'OWASP Top 10 İstinadı',
      subtitle: 'AppSec Uyğunluğu',
      desc: 'Ən kritik veb tətbiqi təhlükəsizlik risklərini müəyyən etmək və azaltmaq üçün standartlaşdırılmış texniki rəhbərlik.',
      critical: 'Kritik',
      high: 'Yüksək',
      medium: 'Orta',
      mitigationGuide: 'Texniki Düzəliş Rəhbəri',
      customAudit: 'Xüsusi Uyğunluq Auditi',
      customDesc: 'PCI-DSS v4.0 və ya HIPAA kimi xüsusi sənaye standartları üçün hesabat lazımdır?',
      requestReport: 'Xüsusi Hesabat Tələb Et',
      neuralEngine: 'Neyron Düzəliş Mühərriki',
      advisoryNote: 'Son təhlükəsizlik standartları əsasında hazırlanmış məsləhət',
      close: 'Məsləhəti Bağla',
      rootCause: 'Texniki Köklü Səbəb',
      compliance: 'Uyğunluq Əhəmiyyəti',
      mitigations: 'Strateji Düzəlişlər',
      verification: 'Yoxlama Prosedurları'
    }
  }[language]), [language]);

  const STANDARDS = [
    { rank: 'A01', title: language === 'en' ? 'Broken Access Control' : 'Sındırılmış Giriş Nəzarəti', icon: Lock, color: 'text-blue-400', severity: 'Critical', desc: language === 'en' ? 'Failure to enforce restrictions on what authenticated users can do.' : 'Autentifikasiya olunmuş istifadəçilərin edə biləcəyi məhdudiyyətlərin yerinə yetirilməməsi.' },
    { rank: 'A02', title: language === 'en' ? 'Cryptographic Failures' : 'Kriptoqrafik Xətalar', icon: Database, color: 'text-cyan-400', severity: 'High', desc: language === 'en' ? 'Exposure of sensitive data due to weak encryption or insecure storage.' : 'Zəif şifrələmə və ya qeyri-təhlükəsiz saxlama səbəbindən həssas məlumatların ifşası.' },
    { rank: 'A03', title: language === 'en' ? 'Injection' : 'İnyeksiya', icon: Zap, color: 'text-red-400', severity: 'High', desc: language === 'en' ? 'Unsanitized user data reaching database queries or OS commands.' : 'Məlumat bazası sorğularına və ya ƏS əmrlərinə çatan təmizlənməmiş istifadəçi məlumatları.' },
    { rank: 'A04', title: language === 'en' ? 'Insecure Design' : 'Qeyri-təhlükəsiz Dizayn', icon: Shield, color: 'text-indigo-400', severity: 'Medium', desc: language === 'en' ? 'Architectural flaws where security controls were never properly planned.' : 'Təhlükəsizlik nəzarətinin heç vaxt düzgün planlaşdırılmadığı memarlıq qüsurları.' },
    { rank: 'A05', title: language === 'en' ? 'Security Misconfiguration' : 'Səhv Təhlükəsizlik Konfiqurasiyası', icon: Terminal, color: 'text-orange-400', severity: 'Medium', desc: language === 'en' ? 'Unpatched flaws, default accounts, or detailed error messages.' : 'Yamaqlanmamış qüsurlar, standart hesablar və ya ətraflı xəta mesajları.' },
    { rank: 'A06', title: language === 'en' ? 'Vulnerable Components' : 'Zəif Komponentlər', icon: LayoutList, color: 'text-amber-400', severity: 'Medium', desc: language === 'en' ? 'Using outdated or compromised third-party libraries.' : 'Köhnəlmiş və ya təhlükə altına alınmış üçüncü tərəf kitabxanalarından istifadə.' },
    { rank: 'A07', title: language === 'en' ? 'Auth Failures' : 'Autentifikasiya Xətaları', icon: Fingerprint, color: 'text-emerald-400', severity: 'High', desc: language === 'en' ? 'Weak password policies or lack of MFA permitting credential stuffing.' : 'Zəif şifrə siyasəti və ya MFA-nın olmaması.' },
    { rank: 'A08', title: language === 'en' ? 'Software/Data Integrity' : 'Proqram/Məlumat Bütövlüyü', icon: ShieldCheck, color: 'text-blue-500', severity: 'High', desc: language === 'en' ? 'Code or data from untrusted sources without validation.' : 'Doğrulanmadan etibarsız mənbələrdən gələn kod və ya məlumat.' },
    { rank: 'A09', title: language === 'en' ? 'Logging & Monitoring' : 'Loqlama və Monitorinq', icon: FileWarning, color: 'text-slate-400', severity: 'Medium', desc: language === 'en' ? 'Insufficient logging allowing attackers to remain undetected.' : 'Təcavüzkarların aşkar edilməməsinə imkan verən qeyri-kafi loqlama.' },
    { rank: 'A10', title: language === 'en' ? 'SSRF' : 'SSRF', icon: SearchCode, color: 'text-purple-400', severity: 'Medium', desc: language === 'en' ? 'Inducing the server into making requests to internal resources.' : 'Serveri daxili resurslara sorğular etməyə vadar etmək.' },
  ];

  const handleStandardClick = async (std: any) => {
    setSelectedStandard(std);
    setLoading(true);
    setAdviceData(null);
    try {
      const result = await generateComplianceAdvice(std.rank, std.title);
      setAdviceData(result);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-10 animate-in slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center shadow-xl border border-blue-500/10">
                <Shield className="text-blue-500" size={28} />
             </div>
             <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{t.subtitle}</span>
                <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">{t.title}</h2>
             </div>
          </div>
          <p className="text-slate-400 max-w-3xl leading-relaxed font-medium">
            {t.desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {STANDARDS.map((item) => (
          <button
            key={item.rank}
            onClick={() => handleStandardClick(item)}
            className="card text-left p-8 hover:border-blue-500/50 hover:bg-slate-800/40 transition-all group relative overflow-hidden flex flex-col h-full shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <item.icon size={120} />
            </div>
            
            <div className="flex justify-between items-start mb-8">
              <div className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner ${item.color}`}>
                <item.icon size={24} />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-xs font-black text-slate-700 tracking-tighter uppercase">{item.rank}</span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                  item.severity === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-lg shadow-red-900/10' :
                  item.severity === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-lg shadow-orange-900/10' :
                  'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-lg shadow-blue-900/10'
                }`}>
                  {t[item.severity.toLowerCase() as keyof typeof t] || item.severity}
                </span>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight italic uppercase">{item.title}</h3>
              <p className="text-sm text-slate-500 mt-4 leading-relaxed line-clamp-3 font-medium italic">{item.desc}</p>
            </div>

            <div className="mt-8 flex items-center gap-3 text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-3 group-hover:translate-x-0">
              {t.mitigationGuide}
              <ChevronRight size={14} />
            </div>
          </button>
        ))}
      </div>

      <div className="card p-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-blue-600 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity" />
        <div className="w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20 shadow-xl">
          <Info size={36} className="text-blue-500" />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="text-2xl font-black text-white italic tracking-tight uppercase">{t.customAudit}</h4>
          <p className="text-slate-400 text-base max-w-4xl leading-relaxed font-medium">
            {t.customDesc} Our AI Security Assistant can generate specialized audits tailored to your infrastructure stack and specific regulatory nodes.
          </p>
        </div>
        <button className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30 active:scale-95 uppercase tracking-widest italic shrink-0">
          {t.requestReport}
        </button>
      </div>

      {/* Modal */}
      {selectedStandard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/85 backdrop-blur-2xl animate-in fade-in">
          <div className="card w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-slate-800">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl ${selectedStandard.color}`}>
                  <selectedStandard.icon size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">{selectedStandard.rank}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em]">{t.neuralEngine}</span>
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">{selectedStandard.title}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedStandard(null)} className="p-4 hover:bg-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all"><X size={32} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-slate-950/20">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-8">
                  <Loader2 size={48} className="animate-spin text-blue-500" />
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic animate-pulse">Sourcing Technical Intelligence...</p>
                </div>
              ) : adviceData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-up">
                  <div className="space-y-10">
                    <section className="space-y-6">
                      <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-3">{t.rootCause}</h4>
                      <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 text-base text-slate-300 leading-relaxed font-bold italic shadow-inner">
                        {adviceData.rootCause}
                      </div>
                    </section>
                    <section className="space-y-6">
                      <h4 className="text-[11px] font-black text-purple-500 uppercase tracking-[0.4em] flex items-center gap-3">{t.compliance}</h4>
                      <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 text-sm text-slate-500 font-mono italic leading-relaxed shadow-inner">
                        {adviceData.complianceImpact}
                      </div>
                    </section>
                  </div>
                  <div className="space-y-10">
                    <section className="space-y-6">
                      <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] flex items-center gap-3">{t.mitigations}</h4>
                      <div className="space-y-4">
                        {adviceData.mitigations.map((m: string, i: number) => (
                          <div key={i} className="flex gap-5 p-5 bg-slate-950 border border-slate-800/60 rounded-2xl shadow-sm">
                             <div className="shrink-0 w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xs font-black text-emerald-500 border border-emerald-500/20">{i + 1}</div>
                             <p className="text-sm text-slate-400 font-bold leading-relaxed">{m}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                    <section className="space-y-6">
                      <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] flex items-center gap-3">{t.verification}</h4>
                      <div className="space-y-4">
                        {adviceData.testingProcedures.map((testing: string, i: number) => (
                          <div key={i} className="flex gap-5 p-5 bg-slate-950 border border-slate-800/60 rounded-2xl shadow-sm">
                             <div className="shrink-0 w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-xs font-black text-amber-500 border border-amber-500/20"><SearchCode size={16} /></div>
                             <p className="text-sm text-slate-400 font-bold leading-relaxed">{testing}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 border-t border-slate-800 bg-slate-900/40 flex justify-between items-center">
               <div className="flex items-center gap-3 text-[10px] text-slate-600 uppercase font-black tracking-widest italic ml-4">
                  <AlertCircle size={16} className="text-slate-700" /> {t.advisoryNote}
               </div>
               <button onClick={() => setSelectedStandard(null)} className="px-12 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl text-sm transition-all shadow-xl">{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwaspAdvisor;