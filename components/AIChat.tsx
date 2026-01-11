import React, { useState, useRef, useEffect, useMemo } from 'react';
import { chatWithAdvisor } from '../services/gemini';
import { ChatMessage } from '../types';
import { Send, User, Loader2, Eraser, ExternalLink, Link as LinkIcon, Orbit } from 'lucide-react';

interface AIChatProps {
  language: 'en' | 'az';
}

const AIChat: React.FC<AIChatProps> = ({ language }) => {
  const t = useMemo(() => ({
    en: {
      initial: 'Skywalker Security AI initialized. I am ready to assist with vulnerability analysis, code review, and general security inquiries. How can I help you today?',
      assistantName: 'Skywalker AI Assistant',
      online: 'Online',
      placeholder: 'Describe a security concern or request analysis...',
      processing: 'Processing inquiry...',
      references: 'Reference Sources'
    },
    az: {
      initial: 'Skywalker Təhlükəsizlik Sİ işə salındı. Zəiflik analizi, kod yoxlanışı və ümumi təhlükəsizlik sorğularında kömək etməyə hazıram. Bu gün sizə necə kömək edə bilərəm?',
      assistantName: 'Skywalker Sİ Köməkçisi',
      online: 'Aktiv',
      placeholder: 'Təhlükəsizlik narahatlığını təsvir edin və ya analiz tələb edin...',
      processing: 'Sorğu işlənilir...',
      references: 'İstinad Mənbələri'
    }
  }[language]), [language]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: t.initial, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      const aiResponse = await chatWithAdvisor(history, input);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: aiResponse.text, 
        sources: aiResponse.sources,
        timestamp: new Date() 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Connection failed.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] card overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Orbit size={24} className="text-white animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-black text-white italic tracking-tight uppercase">{t.assistantName}</h3>
            <span className="text-[10px] text-green-500 font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {t.online}
            </span>
          </div>
        </div>
        <button onClick={() => setMessages([{ role: 'model', text: t.initial, timestamp: new Date() }])} className="p-3 text-slate-500 hover:text-white bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
          <Eraser size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 bg-slate-950/30 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
                <User size={20} />
              </div>
              <div className="flex flex-col gap-3">
                <div className={`p-6 rounded-3xl text-sm leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-blue-600 text-white font-bold italic' : 'bg-slate-900 text-slate-300 border border-slate-800 font-medium'}`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-3 p-4 bg-black/30 rounded-2xl mt-1 border border-slate-800/50">
                    <p className="w-full text-[10px] font-black text-slate-600 uppercase flex items-center gap-3 mb-1 tracking-widest">
                      <LinkIcon size={12} className="text-blue-500" /> {t.references}
                    </p>
                    {msg.sources.map((s, idx) => (
                      <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[11px] px-3 py-1.5 bg-slate-800 text-blue-400 rounded-xl hover:bg-slate-700 border border-slate-700 flex items-center gap-2 transition-all font-bold group">
                        <span className="max-w-[180px] truncate">{s.title}</span>
                        <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-5 animate-in fade-in">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-blue-500" />
            </div>
            <div className="bg-slate-900/50 px-8 py-5 rounded-3xl text-sm text-slate-500 italic font-bold border border-slate-800/50">
              {t.processing}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900/50 border-t border-slate-800">
        <div className="flex gap-4 bg-slate-950 border border-slate-800 p-3 rounded-2xl shadow-inner focus-within:border-blue-500/50 transition-all">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            placeholder={t.placeholder} 
            className="flex-1 bg-transparent border-none focus:outline-none text-sm px-4 text-slate-200 font-bold placeholder:text-slate-700" 
          />
          <button 
            onClick={handleSend} 
            disabled={loading || !input.trim()} 
            className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-500 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/30 active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AIChat;