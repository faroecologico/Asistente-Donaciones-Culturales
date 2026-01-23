import { GoogleGenAI } from '@google/genai';
import { AiRequestPayload } from '../types';

export const config = {
    runtime: 'edge', // Use Edge runtime for better performance on Vercel
};

const SYSTEM_PROMPT = `
Act as an expert consultant for the Chilean "Ley de Donaciones Culturales" (Law 18.985).
Your goal is to assist in formulating high-quality cultural projects.
RULES:
1. OUTPUT JSON ONLY. No markdown, no preambles.
2. Language: Formal Chilean Spanish.
3. Be specific and realistic. Do not invent financial figures unless asked for a skeleton.
4. If information is missing, use placeholders like "[PENDIENTE]".
`;

const buildUserPrompt = (payload: AiRequestPayload): string => {
    const { task, projectContext, userNotes, constraints } = payload;
    const ctx = JSON.stringify(projectContext);
    const notes = userNotes ? `\nUser Notes: ${userNotes}` : "";
    const maxChars = constraints?.maxChars ? `\nMax Characters: ${constraints.maxChars}` : "";

    switch (task) {
        case 'generate_title':
            return `
      Generate 3 distinct, professional titles for this project.
      Context: ${ctx} ${notes}
      Output JSON: { "suggestions": ["Title 1", "Title 2", "Title 3"] }
      `;

        case 'generate_summary':
            return `
      Draft an Executive Summary.
      Version 1: Full (approx 400 chars).
      Version 2: Short (approx 250 chars).
      Context: ${ctx} ${notes}
      Output JSON: { "suggestions": ["Full Summary...", "Short Summary..."] }
      `;

        case 'generate_objectives':
            return `
      Draft 1 General Objective and 3-5 Specific Objectives.
      Use action verbs (e.g., Fomentar, Difundir, Capacitar).
      Context: ${ctx} ${notes}
      Output JSON: { "suggestions": [{ "general": "...", "specific": ["...", "...", "..."] }] }
      `;

        case 'generate_retribution':
            return `
      Propose a Cultural Retribution plan.
      Must answer: What, Who, Where, When, How Many.
      Context: ${ctx} ${notes}
      Output JSON: { 
        "suggestions": [{
             "text": "Full narrative description...",
             "structured": {
                 "what": "...",
                 "who": "...",
                 "quantity": 100,
                 "location": "...",
                 "when": "...",
                 "accessCondition": "Gratuito" 
             },
             "metrics": ["Métrica 1", "Métrica 2"],
             "evidence": ["Lista de asistencia", "Fotos"]
        }]
      }
      `;

        // Fallback
        default:
            return `
      Task: ${task}.
      Context: ${ctx} ${notes}
      Output JSON: { "suggestions": ["Result..."] }
      `;
    }
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    try {
        const payload: AiRequestPayload = await req.json();
        const apiKey = req.headers.get('x-gemini-api-key') || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({
                suggestions: ["MOCK RESPONSE: Please configure API Key"],
                meta: { model: 'mock', timestamp: Date.now() },
                traceId: 'mock'
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        const ai = new GoogleGenAI(apiKey);
        const model = ai.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = buildUserPrompt(payload);
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Parse response
        const data = JSON.parse(text);

        return new Response(JSON.stringify({
            ...data,
            meta: { model: 'gemini-1.5-flash', timestamp: Date.now() },
            traceId: crypto.randomUUID()
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
