import { Message, AgentType } from '../types';
import { cn, formatTimestamp } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { User, Cpu, FileIcon, MapPin, Navigation, ExternalLink, Volume2, Sparkles } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

function speakMessage(content: string) {
  if (!window.speechSynthesis) {
    console.error("Speech synthesis not supported");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(content);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function MapCard({ content }: { content: string }) {
  // Simple check if it looks like a location or travel response
  const isTravel = content.toLowerCase().includes('route') || content.toLowerCase().includes('travel') || content.toLowerCase().includes('destination') || content.toLowerCase().includes('cost');
  const hasLocation = content.toLowerCase().includes('location') || content.toLowerCase().includes('address') || content.toLowerCase().includes('coordinates') || isTravel;
  
  if (!hasLocation) return null;

  // Attempt to extract approximate coordinates or address for a real link
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.substring(0, 100))}`;

  return (
    <div className="mt-4 rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-lowest shadow-2xl shadow-black/40">
      <div className="h-48 bg-surface-container-high relative overflow-hidden group/map">
        {/* Stylized Map Placeholder */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-on-surface-variant) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-primary/30 rotate-12" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-primary/30 -rotate-45" />
          <div className="absolute top-1/4 left-1/4 w-full h-[1px] bg-primary/10 rotate-90" />
        </div>
        
        {/* Simulated Street View Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-surface to-transparent opacity-60" />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-primary/20 animate-ping absolute inset-0" />
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center relative shadow-lg shadow-primary/50">
              <MapPin className="w-6 h-6 text-on-primary" />
            </div>
          </div>
        </div>

        <div className="absolute top-4 left-4 flex gap-2">
          <div className="px-2 py-1 bg-surface/80 backdrop-blur-md rounded text-[8px] font-bold uppercase tracking-widest border border-outline-variant flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live Satellite
          </div>
          {isTravel && (
            <div className="px-2 py-1 bg-primary/20 backdrop-blur-md rounded text-[8px] font-bold uppercase tracking-widest border border-primary/30 text-primary">
              Travel Agent Mode
            </div>
          )}
        </div>

        <a 
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-4 right-4 p-2 bg-surface/80 backdrop-blur-md rounded-lg border border-outline-variant hover:bg-primary hover:text-on-primary transition-all shadow-lg"
        >
          <Navigation className="w-4 h-4" />
        </a>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center border border-outline-variant">
              <Navigation className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">Route Intelligence</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Precision Navigation Active</p>
            </div>
          </div>
          <a 
            href={googleMapsUrl + "&layer=traffic"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            Street View / Traffic
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {isTravel && (
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-outline-variant">
            <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant">
              <p className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Duration</p>
              <p className="text-xs font-bold text-primary">Est. 4h 20m</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant">
              <p className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Budget</p>
              <p className="text-xs font-bold text-primary">$120 - $150</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant">
              <p className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Traffic</p>
              <p className="text-xs font-bold text-green-500">Minimal</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FileAnalysisCard({ attachments }: { attachments: any[] }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant glass">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <FileIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold">File Intelligence Report</p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Deep Analysis Complete</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {attachments.map((file, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high border border-outline-variant group hover:border-primary/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center">
                <FileIcon className="w-4 h-4 text-on-surface-variant" />
              </div>
              <div>
                <p className="text-xs font-medium truncate max-w-[150px]">{file.name}</p>
                <p className="text-[10px] text-on-surface-variant uppercase">{(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-[8px] font-bold uppercase tracking-widest border border-green-500/20">
                Processed
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">AI Insights Generated</span>
        </div>
        <button className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
          View Full Report
        </button>
      </div>
    </div>
  );
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto w-full">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex gap-6",
            message.role === 'user' ? "flex-row-reverse" : "flex-row"
          )}
        >
          {/* Avatar */}
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
            message.role === 'user' 
              ? "bg-surface-container-high border-outline-variant" 
              : "bg-linear-to-br from-primary to-primary-container border-primary/30"
          )}>
            {message.role === 'user' ? (
              <User className="w-5 h-5 text-on-surface-variant" />
            ) : (
              <Cpu className="w-5 h-5 text-on-primary" />
            )}
          </div>

          {/* Content */}
          <div className={cn(
            "flex flex-col gap-2 max-w-[80%]",
            message.role === 'user' ? "items-end" : "items-start"
          )}>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {message.role === 'user' ? 'User Identity' : 'Ghost AI Intelligence'}
              </span>
              <span className="text-[10px] text-on-surface-variant/50">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>

            <div className={cn(
              "px-6 py-4 rounded-2xl text-sm leading-relaxed relative group/msg",
              message.role === 'user' 
                ? "bg-surface-container-high text-on-surface" 
                : "glass text-on-surface border-l-2 border-l-primary"
            )}>
              {message.role === 'assistant' && (
                <button 
                  onClick={() => speakMessage(message.content)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-surface-container-highest opacity-0 group-hover/msg:opacity-100 transition-opacity hover:text-primary"
                  title="Speak message"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {message.attachments.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-lg border border-outline-variant">
                      {file.type.startsWith('image/') ? (
                        <img src={file.url} alt={file.name} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <FileIcon className="w-5 h-5 text-primary" />
                      )}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-medium truncate max-w-[100px]">{file.name}</span>
                        <span className="text-[8px] text-on-surface-variant uppercase">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>

              {message.role === 'assistant' && message.agents?.includes('File') && message.attachments && (
                <FileAnalysisCard attachments={message.attachments} />
              )}

              {message.role === 'assistant' && message.agents?.includes('Map') && (
                <MapCard content={message.content} />
              )}
            </div>

            {message.agents && message.agents.length > 0 && (
              <div className="flex gap-2 mt-2">
                {message.agents.map(agent => (
                  <span key={agent} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-widest border border-primary/20">
                    {agent} Agent
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {isTyping && (
        <div className="flex gap-6">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center shrink-0 border border-primary/30 animate-pulse">
            <Cpu className="w-5 h-5 text-on-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse">
                Orchestrating Agents...
              </span>
            </div>
            <div className="px-6 py-4 rounded-2xl glass min-w-[100px] flex gap-1">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
