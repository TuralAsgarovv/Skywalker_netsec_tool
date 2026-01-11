
import React, { useMemo } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Globe } from 'lucide-react';

interface DisclaimerProps {
  language: 'en' | 'az';
  setLanguage: (lang: 'en' | 'az') => void;
  onAccept: () => void;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ language, setLanguage, onAccept }) => {
  const t = useMemo(() => ({
    en: {
      title: 'Ethical Conduct & Usage Agreement',
      warning: 'CRITICAL SECURITY NOTICE',
      body1: 'The Skywalker Security AI suite is a professional-grade platform designed strictly for educational, research, and authorized security auditing purposes.',
      body2: 'By proceeding, you acknowledge that any unauthorized testing against systems you do not own or have explicit written permission to audit is illegal and punishable by law.',
      clause1: 'I will only use this tool for "White Hat" research.',
      clause2: 'I accept full responsibility for my actions.',
      clause3: 'I will not perform any denial-of-service or destructive attacks.',
      acceptBtn: 'I UNDERSTAND & ACCEPT TERMS',
      langToggle: 'Switch to Azerbaijani'
    },
    az: {
      title: 'Etik Davranış və İstifadə Müqaviləsi',
      warning: 'KRİTİK TƏHLÜKƏSİZLİK BİLDİRİŞİ',
      body1: 'Skywalker Təhlükəsizlik Sİ dəsti ciddi şəkildə təhsil, tədqiqat və səlahiyyətli təhlükəsizlik auditi məqsədləri üçün hazırlanmış peşəkar səviyyəli platformadır.',
      body2: 'Davam edərək, sahib olmadığınız və ya audit üçün açıq yazılı icazəniz olmayan sistemlərə qarşı hər hansı icazəsiz sınaqların qeyri-qanuni olduğunu və qanunla cəzalandırıldığını qəbul edirsiniz.',
      clause1: 'Mən bu alətdən yalnız "Ağ Papaqlı" tədqiqat üçün istifadə edəcəyəm.',
      clause2: 'Hərəkətlərimə görə tam məsuliyyət daşıyıram.',
      clause3: 'Dağıdıcı hücumlar və ya xidmətdən imtina (DoS) testləri etməyəcəyəm.',
      acceptBtn: 'ŞƏRTLƏRİ ANLAYIRAM VƏ QƏBUL EDİRƏM',
      langToggle: 'İngilis dilinə keç'
    }
  }[language]), [language]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 p-6 overflow-hidden">
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(220, 38, 38, 0.2) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      
      <div className="max-w-2xl w-full relative">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-red-600 rounded-3xl blur opacity-20 animate-pulse" />
        
        <div className="card relative bg-slate-900 border-red-900/50 p-8 md:p-12 shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-600/10 rounded-2xl flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
            <ShieldAlert size={44} className="text-red-500" />
          </div>

          <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.5em] mb-3">{t.warning}</span>
          <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase mb-6">{t.title}</h2>
          
          <div className="space-y-4 text-slate-400 font-medium leading-relaxed mb-10">
            <p>{t.body1}</p>
            <p className="text-slate-300 italic">{t.body2}</p>
          </div>

          <div className="w-full space-y-3 mb-10">
            {[t.clause1, t.clause2, t.clause3].map((clause, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800 text-left">
                <CheckCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">{clause}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col w-full gap-4">
            <button 
              onClick={onAccept}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-red-900/30 uppercase tracking-[0.2em] active:scale-95"
            >
              {t.acceptBtn}
            </button>
            
            <button 
              onClick={() => setLanguage(language === 'en' ? 'az' : 'en')}
              className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
            >
              <Globe size={12} />
              {t.langToggle}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
