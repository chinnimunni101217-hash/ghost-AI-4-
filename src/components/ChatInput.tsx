import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  Paperclip, 
  X, 
  Image as ImageIcon, 
  FileText,
  StopCircle,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { FileAttachment } from '../types';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
  disabled: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && attachments.length === 0) || disabled) return;
    
    onSendMessage(input, attachments);
    setInput("");
    setAttachments([]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      const attachment: FileAttachment = await new Promise((resolve) => {
        reader.onload = (event) => {
          const url = event.target?.result as string;
          if (file.type.startsWith('text/') || file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js')) {
            // Read text content
            const textReader = new FileReader();
            textReader.onload = (e) => {
              resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                url,
                content: e.target?.result as string
              });
            };
            textReader.readAsText(file);
          } else {
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              url
            });
          }
        };
        reader.readAsDataURL(file);
      });
      
      newAttachments.push(attachment);
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (!isRecording) {
      setIsRecording(true);
      recognitionRef.current.start();
    } else {
      setIsRecording(false);
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="p-6 bg-surface border-t border-outline-variant">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-wrap gap-3 mb-4"
            >
              {attachments.map((file, i) => (
                <div key={i} className="relative group">
                  <div className="flex items-center gap-3 bg-surface-container-high p-2 pr-4 rounded-xl border border-outline-variant">
                    {file.type.startsWith('image/') ? (
                      <img src={file.url} alt={file.name} className="w-10 h-10 object-cover rounded-lg" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-medium truncate max-w-[120px]">{file.name}</span>
                      <span className="text-[10px] text-on-surface-variant uppercase">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeAttachment(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end gap-3 bg-surface-container-low border border-outline-variant rounded-2xl p-2 focus-within:border-primary/50 transition-all shadow-2xl shadow-black/50"
        >
          <div className="flex items-center gap-1 pb-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-xl transition-all"
              title="Attach files"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              multiple 
              className="hidden" 
            />
            
            <button
              type="button"
              onClick={toggleRecording}
              className={cn(
                "p-3 rounded-xl transition-all",
                isRecording 
                  ? "bg-red-500/20 text-red-500 animate-pulse" 
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
              )}
              title="Voice input"
            >
              {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Command Ghost AI..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/50 py-3 resize-none min-h-[48px] max-h-[200px]"
            disabled={disabled}
          />

          <div className="flex items-center gap-1 pb-1">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant mr-2">
              <Globe className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Auto-Detect</span>
            </div>
            
            <button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || disabled}
              className="p-3 bg-linear-to-br from-primary to-primary-container text-on-primary rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Multi-Agent Orchestration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Context Aware</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Secure Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
