import { GoogleGenAI } from '@google/genai';
import { AiRequestPayload, AiResponsePayload } from '../types';

// SYSTEM INSTRUCTION
const SYSTEM_INSTRUCTION = `
You are an expert consultant for the Chilean "Ley de Donaciones Culturales" (Cultural Donations Law). 
Your task is to assist in formulating cultural projects for the official portal. 
RULES:
1. Produce valid JSON output ONLY.
2. Do not invent facts, dates, or specific budgets if not provided; use "[PENDIENTE]".
3. Use a professional, formal Chilean Spanish tone.
4. Respect character limits strictly.
5. If the user suggests a mix of project types, flag it.
`;

const buildPrompt = (payload: AiRequestPayload): string => {
    const { task, field, projectContext, userNotes, constraints } = payload;
    const ctx = JSON.stringify(projectContext);
    const limit = constraints?.maxChars ? `Max length: ${constraints.maxChars} chars.` : "";
    const notes = userNotes ? `User Notes: ${userNotes}` : "";

    switch (task) {
        case 'generate_title':
            return `Task: Generate 3 distinct, professional project titles (<=150 chars).
      Context: ${ctx}
      ${notes}
      Output JSON format: { "suggestions": ["Title 1", "Title 2", "Title 3"] }`;

        case 'generate_summary':
            return `Task: Write two versions of an executive summary: one <=400 chars and one <=250 chars.
      Context: ${ctx}
      ${notes}
      Output JSON format: { "suggestions": ["Summary (400 chars)", "Summary (250 chars)"] }`;

        case 'generate_objectives':
            return `Task: Generate 1 General Objective and 3-5 Specific Objectives. They must be verifiable and use action verbs.
      Context: ${ctx}
      ${notes}
      Output JSON format: { "suggestions": [{ "general": "...", "specific": ["...", "...", "..."] }] }`;

        case 'generate_retribution':
            return `Task: Formulate the "Cultural Retribution" plan.
      Structure: Qué se entrega, A quién, Cuántas veces, Dónde, Cuándo, Condición de acceso.
      Suggest specific metrics and evidence list.
      Context: ${ctx}
      ${notes}
      Output JSON format: { 
        "suggestions": [{ 
            "text": "Full text description...", 
            "structured": { "what": "...", "who": "...", "quantity": 0, "location": "...", "when": "...", "access": "..." },
            "metrics": ["...", "..."], 
            "evidence": ["...", "..."] 
        }] 
      }`;

        case 'generate_timeline':
            return `Task: Create a timeline skeleton based on project type and duration.
      Context: ${ctx}
      ${notes}
      Output JSON format: { "suggestions": [[{ "id": "uuid", "name": "Activity Name", "unit": "meses", "duration": 1, "description": "..." }, ... ]] }`;

        case 'generate_budget_skeleton':
            return `Task: Create a budget skeleton (Human Resources, Diffusion, Production) based on context. 
      Context: ${ctx}
      ${notes}
      Output JSON format: { "suggestions": [[{ "id": "uuid", "description": "...", "category": "...", "amount": 0 }, ... ]] }`;

        case 'rewrite_to_limit':
            return `Task: Rewrite text to meet maxChars limit without losing core meaning.
      Text: ${field}
      Limit: ${constraints?.maxChars}
      Context: ${ctx}
      Output JSON format: { "suggestions": ["Rewritten text"] }`;

        default:
            return `Task: Assist with request. Context: ${ctx} Output JSON: { "suggestions": ["..."] }`;
    }
};

export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-api-key');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const payload = req.body as AiRequestPayload;
    const headerKey = req.headers['x-gemini-api-key'];
    const envKey = process.env.GEMINI_API_KEY;
    const effectiveKey = (typeof headerKey === 'string' && headerKey.length > 10) ? headerKey : envKey;

    if (!effectiveKey) {
        return res.status(200).json({
            suggestions: ["MOCK: Please configure API Key."],
            meta: { model: "mock", timestamp: Date.now() },
            traceId: "mock-" + Date.now()
        });
    }

    try {
        const ai = new GoogleGenAI(effectiveKey);
        const model = ai.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SYSTEM_INSTRUCTION
        });

        const prompt = buildPrompt(payload);
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Attempt to parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonContent = jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestions: [text] };

        res.status(200).json({
            ...jsonContent,
            meta: { model: 'gemini-1.5-flash', timestamp: Date.now() },
            traceId: `trace-${Date.now()}`
        });
    } catch (error: any) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "AI Generation Failed", details: error.message });
    }
}
