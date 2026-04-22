import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { Message, AgentType } from './types';
import { chatWithGhostAI, parseAgentsInvolved, cleanResponse } from './services/gemini';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('ghost_ai_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isTyping, setIsTyping] = useState(false);
  const [activeAgents, setActiveAgents] = useState<AgentType[]>(['Research']);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedLang, setSelectedLang] = useState('en');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ghost_ai_messages', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsTyping(true);
    setActiveAgents(['Research']);

    try {
      let assistantContent = "";
      const assistantMessageId = (Date.now() + 1).toString();
      
      // Initial placeholder for streaming
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: "",
        timestamp: new Date(),
        agents: ['Research']
      }]);

      await chatWithGhostAI(newMessages, (chunk) => {
        assistantContent += chunk;
        setMessages(prev => prev.map(m => 
          m.id === assistantMessageId 
            ? { ...m, content: cleanResponse(assistantContent), agents: parseAgentsInvolved(assistantContent) } 
            : m
        ));
        
        const agents = parseAgentsInvolved(assistantContent);
        if (agents.length > 0) setActiveAgents(agents);
      }, { language: selectedLang, location: userLocation || undefined });

    } catch (error: any) {
      console.error("Error in chat:", error);
      const errorMessage = error?.message || "I encountered an unexplained error while processing your request. Please check your connection and try again.";
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
        agents: ['Research']
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImportChat = (importedMessages: Message[]) => {
    setMessages(importedMessages);
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        messages={messages}
        onNewChat={() => setMessages([])}
        onImportChat={handleImportChat}
      />
      
      <main className="flex-1 flex flex-col relative min-w-0">
        <ChatInterface 
          messages={messages} 
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          activeAgents={activeAgents}
          selectedLang={selectedLang}
          setSelectedLang={setSelectedLang}
          userLocation={userLocation}
        />
      </main>
    </div>
  );
}

