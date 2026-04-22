import { Message } from '../types';
import { cn } from '../lib/utils';
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Cpu,
  History,
  Download,
  Upload
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRef } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: Message[];
  onNewChat: () => void;
  onImportChat: (messages: Message[]) => void;
}

export function Sidebar({ isOpen, onToggle, messages, onNewChat, onImportChat }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ghost_ai_chat_${new Date().toISOString()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const importedMessages = json.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        onImportChat(importedMessages);
      } catch (error) {
        alert("Invalid chat file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 320 : 0 }}
      className={cn(
        "relative bg-surface-container-low border-r border-outline-variant flex flex-col overflow-hidden transition-all duration-300",
        !isOpen && "border-r-0"
      )}
    >
      <div className="p-6 flex items-center justify-between min-w-[320px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="text-on-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Ghost AI</h1>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Advanced Multi-Agent</p>
          </div>
        </div>
        <button 
          onClick={onToggle}
          className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 mb-6 min-w-[320px] space-y-2">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl transition-all active:scale-[0.98] group"
        >
          <Plus className="w-5 h-5 text-primary group-hover:rotate-90 transition-transform" />
          <span className="font-medium">New Session</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-3 py-2.5 rounded-xl transition-all text-xs font-medium"
          >
            <Download className="w-4 h-4 text-primary" />
            Export
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-3 py-2.5 rounded-xl transition-all text-xs font-medium"
          >
            <Upload className="w-4 h-4 text-primary" />
            Import
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 min-w-[320px]">
        <div className="flex items-center gap-2 mb-4 px-2">
          <History className="w-4 h-4 text-on-surface-variant" />
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Recent Activity</span>
        </div>
        
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-on-surface-variant/50">No recent activity</p>
            </div>
          ) : (
            <button className="w-full text-left px-4 py-3 rounded-xl bg-surface-container-highest border border-primary/20 transition-all">
              <p className="text-sm font-medium truncate">Current Session</p>
              <p className="text-[10px] text-on-surface-variant mt-1">{messages.length} messages</p>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-outline-variant min-w-[320px]">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface">
          <Settings className="w-5 h-5" />
          <span className="font-medium">System Settings</span>
        </button>
      </div>

      {!isOpen && (
        <button 
          onClick={onToggle}
          className="fixed left-4 top-6 z-50 p-2 bg-surface-container-high border border-outline-variant rounded-lg shadow-xl text-on-surface-variant hover:text-on-surface transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </motion.aside>
  );
}
