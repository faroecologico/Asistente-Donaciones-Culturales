import { GoogleGenAI } from '@google/genai';
import { AiRequestPayload, AiResponsePayload } from '../types';

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
    // CORS Handling
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin, or restrict to your Vercel URL
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-gemini-api-key');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const payload = req.body as AiRequestPayload;

    // Initialize AI Client
    const headerKey = req.headers['x-gemini-api-key'];
    const envKey = process.env.GEMINI_API_KEY;
    const effectiveKey = (typeof headerKey === 'string' && headerKey.length > 10) ? headerKey : envKey;

    if (!effectiveKey) {
        // MOCK MODE if no key
        const mockResponse: AiResponsePayload = {
            suggestions: ["MOCK RESPONSE (Vercel): Please configure GEMINI_API_KEY in Vercel Settings."],
            meta: { model: "mock", timestamp: Date.now() },
            traceId: "mock-trace-vercel"
        };

        if (payload.task === 'generate_objectives') {
            mockResponse.suggestions = [{ general: "Objetivo General Mock (Vercel)", specific: ["Esp 1", "Esp 2"] }];
        }
        if (payload.task === 'generate_timeline') {
            mockResponse.suggestions = [[{ id: "m1", name: "Mock Actividad 1", unit: "meses", duration: 1, description: "Desc" }]];
        }

        return res.status(200).json(mockResponse);
    }

    // SYSTEM INSTRUCTION
    const SYSTEM_INSTRUCTION = `
You are an expert consultant for the Chilean "Ley de Donaciones Culturales" (Cultural Donations Law). 
Your task is to assist in formulating cultural projects. 
You must produce valid JSON output ONLY. 
Do not invent facts (dates, budgets) if not provided; mark them as "[PENDIENTE]".
Ensure the tone is professional, formal, and specific to the arts/culture sector.
`;

    // BUILD PROMPT
    const buildPrompt = (payload: AiRequestPayload): string => {
        const { task, field, projectContext, userNotes, constraints } = payload;
        const ctx = JSON.stringify(projectContext);
        const limit = constraints?.maxChars ? `Max length: ${constraints.maxChars} chars.` : "";
        const notes = userNotes ? `User Notes: ${userNotes}` : "";

        switch (task) {
            case 'generate_title':
                return `Task: Generate 3 distinct, professional project titles based on the context.
            Context: ${ctx}
            ${notes}
            ${limit}
            Output JSON format: { "suggestions": ["Title 1", "Title 2", "Title 3"] }`;

            case 'generate_summary':
                return `Task: Write an executive summary.
            Context: ${ctx}
            ${notes}
            ${limit}
            Output JSON format: { "suggestions": ["Summary text here..."] }`;

            case 'generate_objectives':
                return `Task: Generate 1 General Objective and 3-5 Specific Objectives. They must be verifiable.
            Context: ${ctx}
            ${notes}
            Output JSON format: { "suggestions": [{ "general": "...", "specific": ["...", "..."] }] }`;

            case 'generate_retribution':
                return `Task: Formulate the "Cultural Retribution" (Retribución Cultural) plan.
            Include specific metrics (beneficiaries, events) and evidence (photos, lists).
            Context: ${ctx}
            ${notes}
            Output JSON format: { 
                "suggestions": [{ 
                    "text": "Full text description of what/who/where/when...", 
                    "metrics": ["N beneficiaries", "N workshops"], 
                    "evidence": ["Attendance list", "Geotagged photos"] 
                }] 
            }`;

            case 'generate_timeline':
                return `Task: Create a timeline of activities based on the project duration.
            Context: ${ctx}
            ${notes}
            Output JSON format: { "suggestions": [[{ "id": "uuid", "name": "Activity Name", "unit": "meses", "duration": 1, "description": "Details..." }, ... ]] }`;

            case 'generate_budget_skeleton':
                return `Task: Create a budget skeleton with categories (RRHH, Difusión, Producción) and estimated items based on context. Set amounts to 0 if unknown.
            Context: ${ctx}
            ${notes}
            Output JSON format: { "suggestions": [[{ "id": "uuid", "description": "Coordinator", "category": "RRHH", "amount": 0 }, ... ]] }`;

            case 'rewrite_to_limit':
                return `Task: Rewrite the following text to comply with a maximum character limit of ${constraints?.maxChars || 'N/A'}.
             Field to rewrite: ${field}
             Original Context: ${ctx}
             ${notes}
             Goal: Reduce length without losing the core meaning and professional tone.
             Output JSON format: { "suggestions": ["Rewritten text..."] }`;

            default:
                return `Task: Assist with the following request. ${ctx} ${notes} Output JSON format: { "suggestions": ["Response..."] }`;
        }
    };

    try {
        const ai = new GoogleGenAI({ apiKey: effectiveKey });
        const prompt = buildPrompt(payload);

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash', // Using latest model which is often available
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json"
            }
        });

        const textResponse = response.text;
        if (!textResponse) throw new Error("Empty response from AI");

        const jsonContent = JSON.parse(textResponse);

        let suggestions = jsonContent.suggestions || jsonContent;
        if (!Array.isArray(suggestions)) suggestions = [suggestions];

        const payloadResponse: AiResponsePayload = {
            suggestions: suggestions,
            meta: {
                model: 'gemini-2.0-flash',
                timestamp: Date.now()
            },
            traceId: `trace-${Date.now()}`
        };

        res.status(200).json(payloadResponse);

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to generate content", details: error instanceof Error ? error.message : String(error) });
    }
}
