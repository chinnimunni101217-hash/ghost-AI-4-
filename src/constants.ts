import { 
  Shield, 
  Search, 
  ListChecks, 
  PenTool, 
  Code2, 
  Scale, 
  BrainCircuit, 
  MapPin, 
  Mic, 
  FileText 
} from 'lucide-react';
import { AgentInfo } from './types';

export const AGENTS: AgentInfo[] = [
  {
    type: 'Research',
    name: 'Research Agent',
    description: 'Web search and summarization',
    icon: 'Search',
  },
  {
    type: 'Planning',
    name: 'Planning Agent',
    description: 'Step-by-step strategic plans',
    icon: 'ListChecks',
  },
  {
    type: 'Writing',
    name: 'Writing Agent',
    description: 'Documents, emails, and creative content',
    icon: 'PenTool',
  },
  {
    type: 'Coding',
    name: 'Coding Agent',
    description: 'Generate and debug code',
    icon: 'Code2',
  },
  {
    type: 'Decision',
    name: 'Decision Agent',
    description: 'Compare options and recommend',
    icon: 'Scale',
  },
  {
    type: 'Memory',
    name: 'Memory Agent',
    description: 'User preferences and history',
    icon: 'BrainCircuit',
  },
  {
    type: 'Map',
    name: 'Map Agent',
    description: 'Location and directions',
    icon: 'MapPin',
  },
  {
    type: 'Voice',
    name: 'Voice Agent',
    description: 'Speech-to-text and text-to-speech',
    icon: 'Mic',
  },
  {
    type: 'File',
    name: 'File Agent',
    description: 'Analyze and summarize files',
    icon: 'FileText',
  },
];
