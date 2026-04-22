import { Message, AgentType } from '../types';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { AgentStatus } from './AgentStatus';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Sparkles, Volume2, VolumeX, Globe, MapPin, Map as MapIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string, attachments?: any[]) => void;
  isTyping: boolean;
  activeAgents: AgentType[];
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
  userLocation: {lat: number, lng: number} | null;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'ur', name: 'Urdu (اردو)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
];

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  isTyping, 
  activeAgents,
  selectedLang,
  setSelectedLang,
  userLocation
}: ChatInterfaceProps) {
  const [voiceOutput, setVoiceOutput] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Text to Speech with Error Handling and Gender Selection
  useEffect(() => {
    if (voiceOutput && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isTyping && lastMessage.content) {
        try {
          const utterance = new SpeechSynthesisUtterance(lastMessage.content);
          
          // Select voice based on gender preference and language
          const selectedVoice = availableVoices.find(v => {
            const name = v.name.toLowerCase();
            const langMatch = v.lang.startsWith(selectedLang);
            if (!langMatch) return false;
            
            if (voiceGender === 'male') {
              return name.includes('male') || name.includes('guy') || name.includes('david');
            } else {
              return name.includes('female') || name.includes('zira') || name.includes('samantha');
            }
          }) || availableVoices.find(v => v.lang.startsWith(selectedLang)) || availableVoices[0];

          if (selectedVoice) utterance.voice = selectedVoice;
          utterance.lang = selectedLang;
          
          window.speechSynthesis.cancel(); 
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error("Speech Synthesis Error:", e);
        }
      }
    }
  }, [messages, voiceOutput, isTyping, voiceGender, availableVoices, selectedLang]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="h-20 border-b border-outline-variant flex items-center justify-between px-8 glass z-20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center border border-outline-variant">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-surface" />
          </div>
          <div>
            <h2 className="font-bold tracking-tight">Ghost AI Core</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">System Status:</span>
              <span className="text-[10px] uppercase tracking-widest text-green-500 font-bold">Optimal</span>
              {userLocation && (
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-1">
                  <MapPin className="w-2 h-2" /> Live
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-on-surface transition-all"
            >
              <Globe className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {LANGUAGES.find(l => l.code === selectedLang)?.name.split(' ')[0]}
              </span>
            </button>
            
            <AnimatePresence>
              {showLangMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 right-0 w-48 bg-surface-container-highest border border-outline-variant rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="max-h-64 overflow-y-auto py-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLang(lang.code);
                          setShowLangMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs hover:bg-primary/10 transition-colors",
                          selectedLang === lang.code ? "text-primary font-bold" : "text-on-surface"
                        )}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-lg border border-outline-variant">
            <button 
              onClick={() => setVoiceGender('female')}
              className={cn(
                "px-2 py-1 rounded text-[8px] font-bold uppercase transition-all",
                voiceGender === 'female' ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Female
            </button>
            <button 
              onClick={() => setVoiceGender('male')}
              className={cn(
                "px-2 py-1 rounded text-[8px] font-bold uppercase transition-all",
                voiceGender === 'male' ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Male
            </button>
          </div>

          <button 
            onClick={() => setVoiceOutput(!voiceOutput)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
              voiceOutput 
                ? "bg-primary/10 border-primary/30 text-primary" 
                : "bg-surface-container-high border-outline-variant text-on-surface-variant"
            )}
          >
            {voiceOutput ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">Voice</span>
          </button>
          
          <AgentStatus activeAgents={activeAgents} />
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto relative">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-20 h-20 rounded-3xl bg-linear-to-br from-primary/20 to-primary-container/20 flex items-center justify-center mb-8 border border-primary/30"
            >
              <Sparkles className="w-10 h-10 text-primary" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold tracking-tighter mb-4"
            >
              How can <span className="text-primary">Ghost AI</span> assist you today?
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-on-surface-variant text-lg mb-12"
            >
              Advanced multi-agent orchestration for research, coding, planning, and more.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {[
                "Analyze this complex PDF document",
                "Create a strategic plan for a new startup",
                "Debug this React component",
                "Find nearby tech hubs in San Francisco"
              ].map((suggestion, i) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  onClick={() => onSendMessage(suggestion)}
                  className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant hover:border-primary/50 hover:bg-surface-container transition-all text-left group"
                >
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{suggestion}</p>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <MessageList messages={messages} isTyping={isTyping} />
        )}
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
    </div>
  );
}
