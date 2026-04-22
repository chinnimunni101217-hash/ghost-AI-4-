export type AgentType = 
  | 'Master'
  | 'Research'
  | 'Planning'
  | 'Writing'
  | 'Coding'
  | 'Decision'
  | 'Memory'
  | 'Map'
  | 'Voice'
  | 'File';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agents?: AgentType[];
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
  content?: string; // For text files
}

export interface AgentInfo {
  type: AgentType;
  name: string;
  description: string;
  icon: string;
}
