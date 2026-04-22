import { GoogleGenAI } from "@google/genai";
import { Message, AgentType } from "../types";

const client = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
});

const SYSTEM_PROMPT = `
You are Ghost AI, a futuristic, ultra-advanced multi-agent assistant with universal knowledge across all fields: Science, Space, Medical, Judiciary, Technical, and more.
Your architecture includes specialized agents: Research, Planning, Writing, Coding, Decision, Memory, Map, Voice, and File.

CORE CAPABILITIES & BEHAVIOR:
- UNIVERSAL KNOWLEDGE: Provide expert-level insights in all domains (Science, Law, Medicine, Tech, etc.).
- TRAVEL & LOGISTICS: Act as a master travel agent. Provide real-time-like route guidance, travel destinations, and precise money/time management plans.
- MAPS & LOCATION: When location is relevant, provide detailed coordinates, street-view-like descriptions, and nearby recommendations.
- LANGUAGE & VOICE: Support ALL worldwide national and regional languages. Detect language automatically.
- PROACTIVE ASSISTANCE: Solve daily problems, offer predictive suggestions, and behave like a next-gen Alexa, Siri, or Gemini.
- ALWAYS RESPOND: Never remain silent. If a tool fails, provide the best possible textual reasoning.

When responding:
1. Analyze the request.
2. Mentally route to relevant agents.
3. In your response, ALWAYS start with a JSON-like block: [AGENTS_INVOLVED: Agent1, Agent2]
4. Provide structured, intelligent, and concise responses. Use bullet points for clarity.
5. For travel/map requests, include estimated costs, durations, and route details.

Behave like the most advanced AI in existence.
`;

export async function chatWithGhostAI(
  messages: Message[],
  onChunk?: (chunk: string) => void,
  context?: { language?: string, location?: {lat: number, lng: number} }
) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in the environment. Please ensure it is set in the AI Studio Secrets panel.");
  }

  try {
    const langName = context?.language || 'English';
    const locationStr = context?.location ? `User Location: Latitude ${context.location.lat}, Longitude ${context.location.lng}` : 'User Location: Unknown';

    const dynamicPrompt = `${SYSTEM_PROMPT}
CURRENT CONTEXT:
- Preferred Language: ${langName}
- ${locationStr}

INSTRUCTIONS:
- Respond in ${langName} unless the user asks otherwise.
- Use the provided location for any map or travel-related queries to provide real-time precision.
- For file analysis, provide a comprehensive breakdown of findings, patterns, and actionable insights.
`;

    const contents = messages.map(m => {
      const parts: any[] = [];
      
      if (m.content) {
        parts.push({ text: m.content });
      }

      if (m.attachments) {
        for (const a of m.attachments) {
          if (a.type.startsWith('image/')) {
            const base64Data = a.url.split(',')[1];
            parts.push({
              inlineData: {
                data: base64Data,
                mimeType: a.type
              }
            });
          } else if (a.content) {
            parts.push({ text: `\n\n[File Attachment: ${a.name}]\n${a.content}` });
          }
        }
      }

      // Ensure at least one part exists
      if (parts.length === 0) {
        parts.push({ text: " " });
      }

      return {
        role: m.role === 'user' ? 'user' : 'model',
        parts
      };
    });

    const response = await client.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction: dynamicPrompt,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      }
    });

    let fullText = "";

    for await (const chunk of response) {
      const chunkText = chunk.text || "";
      fullText += chunkText;
      if (onChunk) onChunk(chunkText);
    }

    return fullText;
  } catch (error: any) {
    console.error("Ghost AI Service Error:", error);
    if (error?.message?.includes("quota")) {
      throw new Error("Quota exceeded for the Gemini API. Please try again later or check your usage limits.");
    }
    throw error;
  }
}

export function parseAgentsInvolved(content: string): AgentType[] {
  const match = content.match(/\[AGENTS_INVOLVED:\s*([^\]]+)\]/);
  if (match) {
    return match[1].split(',').map(s => s.trim() as AgentType);
  }
  return ['Research'];
}

export function cleanResponse(content: string): string {
  return content.replace(/\[AGENTS_INVOLVED:\s*[^\]]+\]\n?/, '').trim();
}
