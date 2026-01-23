import { GoogleGenAI } from '@google/generative-ai';
import { AiRequestPayload } from '../types';

export const config = {
    runtime: 'nodejs',
};

// 4.1 Prompt maestro (SYSTEM)
const SYSTEM_PROMPT = `
Rol: Eres un asistente experto en formulación de proyectos para la Plataforma de Donaciones Culturales (Art. 8° Ley 18.985).
Objetivo: Dado un brief del usuario, debes producir un borrador completo del formulario del proyecto, más validaciones, checklist de documentos y un cronograma coherente.

Reglas duras (no romper):
1. El proyecto debe clasificarse en un solo Tipo de Proyecto: Actividades, Equipamiento, Funcionamiento, Infraestructura o Patrimonio Cultural.
2. El Título debe ser <=150 caracteres y el Resumen <=400 caracteres.
3. Lugar de ejecución: si es Chile, incluir regiones y comunas; si es extranjero, país y ciudad; si es digital, URL.
4. La Retribución Cultural debe ser clara, medible e indicar medios probatorios.
5. Estilo de salida: Responde en español de Chile.
6. Transparencia: Si faltan datos (RUT, fechas, montos), completa con supuestos explícitos. No inventes datos legales.
7. Coherencia: Objetivos, cronograma, presupuesto y retribución cultural deben ser consistentes entre sí.
8. OUTPUT JSON ONLY.
`;

// Helper to build prompts
const buildUserPrompt = (payload: AiRequestPayload): string => {
    const { task, field, projectContext, userNotes } = payload;
    const ctx = JSON.stringify(projectContext);

    // 4.2 Prompt de inicio (USER)
    if (task === 'generate_initial_draft') {
        return `
    Genera un borrador completo del proyecto Cultural basado en esta idea:
    Idea del proyecto: "${userNotes}"
    
    INSTRUCCIONES:
    1. Clasifica el proyecto en 'clasificacion'.
    2. Completa 'paso1_beneficiario', 'paso2_datos_proyecto', 'paso3_cronograma' y 'paso4_presupuesto'.
    3. Usa estrictamente las claves:
       - "clasificacion": { "tipo_proyecto": "...", "tipo_beneficiario": "..." }
       - "paso1_beneficiario": { "entidad": {...}, "representante_legal": {...} }
       - "paso2_datos_proyecto": { "titulo": {"texto": "..."}, "resumen": {"texto": "..."}, "objetivos": {...}, "retribucion_cultural": {...} }
       - "paso3_cronograma": { "actividades": [...] }
       - "paso4_presupuesto": { "items": [...] }
       - "paso5_documentos": { "propiedad_intelectual": { "declara_uso": false } }
    
    Devuelve estrictamente un JSON con esta estructura.
    `;
    }

    // 4.3 Prompt para “refinar un campo”
    if (task === 'refine_field') {
        return `
    Quiero mejorar el campo: ${field}
    Texto actual (borrador): "${userNotes}"
    Contexto del proyecto: ${ctx}
    Ajustes solicitados: "${userNotes}"
    
    Reglas: respeta límites de caracteres si aplica, y mantén consistencia.
    Devuelve JSON: { "suggestions": ["Versión mejorada 1", "Versión mejorada 2"] }
    `;
    }

    // 4.4 Prompt para “validador final” (QA)
    if (task === 'qa_review') {
        return `
    Revisa este proyecto JSON y genera:
    1. Errores duros (impiden enviar).
    2. Inconsistencias (presupuesto vs cronograma).
    3. Recomendaciones concretas.
    
    Contexto: ${ctx}
    
    Devuelve JSON: { 
        "errores": ["..."], 
        "advertencias": ["..."], 
        "sugerencias_mejora": ["..."] 
    }
    `;
    }

    // 4.5 Validar API Key
    if (task === 'validate_key') {
        return `
        Esto es una prueba de conexión. Responde estrictamente:
        { "suggestions": ["OK"] }
        `;
    }

    // Fallback for smaller tasks if needed (Legacy)
    return `
  Task: ${task}.
  Context: ${ctx}
  User Notes: ${userNotes}
  Output JSON.
  `;
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const payload: AiRequestPayload = req.body;
        // Check both headers (lowercase in node)
        const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(200).json({
                suggestions: ["MOCK RESPONSE: Configure API Key"],
                meta: { model: 'mock' }
            });
        }

        const ai = new GoogleGenAI(apiKey as string);
        const model = ai.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = buildUserPrompt(payload);
        const result = await model.generateContent(prompt);
        let text = result.response.text();

        // Sanitize: Remove markdown code blocks if present
        text = text.replace(/```json\s*/g, "").replace(/```\s*/g, ""); // Basic strip

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error:", text);
            // Fallback: try to find first { and last }
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                try {
                    data = JSON.parse(text.substring(start, end + 1));
                } catch (e2) {
                    throw new Error("Failed to parse AI response as JSON");
                }
            } else {
                throw new Error("Invalid JSON format from AI");
            }
        }

        return res.status(200).json({
            ...data,
            meta: { model: 'gemini-1.5-flash', timestamp: Date.now() },
            suggestions: data.suggestions || [JSON.stringify(data)],
        });

    } catch (err: any) {
        console.error("API Error:", err);
        return res.status(500).json({ error: err.message, stack: err.stack });
    }
}
