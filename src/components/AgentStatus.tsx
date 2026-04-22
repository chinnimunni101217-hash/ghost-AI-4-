import { AgentType } from '../types';
import { AGENTS } from '../constants';
import { cn } from '../lib/utils';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AgentStatusProps {
  activeAgents: AgentType[];
}

export function AgentStatus({ activeAgents }: AgentStatusProps) {
  return (
    <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant">
      <AnimatePresence mode="popLayout">
        {AGENTS.map((agent) => {
          const isActive = activeAgents.includes(agent.type);
          const Icon = (Icons as any)[agent.icon];
          
          return (
            <motion.div
              key={agent.type}
              layout
              initial={{ opacity: 0.3, scale: 0.8 }}
              animate={{ 
                opacity: isActive ? 1 : 0.3, 
                scale: isActive ? 1 : 0.8,
                backgroundColor: isActive ? 'var(--color-surface-container-highest)' : 'transparent'
              }}
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-all relative group",
                isActive && "shadow-lg shadow-primary/10 border border-primary/30"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-on-surface-variant")} />
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface-container-highest border border-outline-variant rounded-md text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {agent.name} {isActive ? '(Active)' : ''}
              </div>

              {isActive && (
                <motion.div
                  layoutId="active-glow"
                  className="absolute inset-0 rounded-xl bg-primary/10 animate-pulse"
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
