
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AiTask, Project, AiResponsePayload } from "../types";
import { generateContent, AiServiceError } from "../services/geminiService";
import { useAppStore } from "../store";
import { generateId } from "../constants";

interface AiAssistantProps {
  project: Project;
  task: AiTask;
  fieldLabel: string;
  onApply: (content: any) => void;
  className?: string;
  constraints?: any;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  project,
  task,
  fieldLabel,
  onApply,
  className,
  constraints,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [traceId, setTraceId] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addAiLog = useAppStore((state) => state.addAiLog);
  const markAiLogApplied = useAppStore((state: any) => state.markAiLogApplied);
  const apiKey = useAppStore((state) => state.apiKey);

  const modalRef = useRef<HTMLDivElement | null>(null);

  const canGenerate = useMemo(() => !loading, [loading]);

  const close = () => {
    setIsOpen(false);
    setError(null);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Focus trap workaround
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      modalRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus();
    }, 100);
    return () => clearTimeout(t);
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!apiKey) {
        setError("Se requiere una API Key de Gemini. Configúrala en el menú superior.");
        return;
    }

    setLoading(true);
    setError(null);
    setWarnings([]);
    setTraceId(null);

    const logId = generateId();
    const startedAt = Date.now();

    try {
      const response: AiResponsePayload = await generateContent({
        projectId: project.id,
        task,
        projectContext: project,
        userNotes,
        constraints,
      });

      setSuggestions(Array.isArray(response.suggestions) ? response.suggestions : []);
      setWarnings(Array.isArray((response as any).warnings) ? (response as any).warnings : []);
      setTraceId((response as any).traceId ?? null);

      addAiLog({
        id: logId,
        timestamp: startedAt,
        task,
        prompt: userNotes?.trim() ? userNotes.trim() : "Auto-generation",
        response: JSON.stringify(
          {
            suggestions: response.suggestions,
            warnings: (response as any).warnings ?? [],
            traceId: (response as any).traceId ?? null,
          },
          null,
          2
        ),
        applied: false,
      });
    } catch (err: any) {
      if (err instanceof AiServiceError) {
        setError(err.message);
      } else {
        setError("Error conectando con Gemini. Verifica que el backend esté corriendo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (content: any, appliedLogId?: string) => {
    onApply(content);
    if (typeof markAiLogApplied === "function" && appliedLogId) {
      markAiLogApplied(appliedLogId);
    }
    close();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-slideUp border border-white/20"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">
                <span className="material-icons-outlined text-white text-lg">auto_awesome</span>
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight">Asistente Gemini</h3>
                <p className="text-[11px] text-slate-500 font-medium">{fieldLabel}</p>
            </div>
          </div>
          <button type="button" onClick={close} className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full p-1 transition-colors">
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Instrucciones (Contexto Extra)
            </label>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder='Ej: "Usa un tono formal", "Enfócate en inclusión social"...'
              className="w-full bg-white text-slate-900 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm resize-none"
              rows={3}
            />
          </div>

          {!apiKey && (
              <div className="mb-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-200 flex items-center gap-2">
                  <span className="material-icons-outlined">warning</span>
                  Configura tu API Key en el menú superior para usar la IA.
              </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-start gap-2">
              <span className="material-icons-outlined text-sm mt-0.5">error_outline</span>
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
               <div className="relative w-12 h-12">
                   <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
               </div>
              <p className="text-sm font-medium text-slate-500 animate-pulse">Generando sugerencias...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Resultados</p>
                {traceId && <span className="text-[10px] text-gray-300 font-mono">ID: {traceId.slice(-6)}</span>}
              </div>

              {suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-accent/30 transition-all group"
                >
                  <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {typeof sug === "string" ? sug : JSON.stringify(sug, null, 2)}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleApply(sug)}
                      className="text-xs font-semibold bg-slate-100 hover:bg-accent hover:text-white text-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span className="material-icons-outlined text-sm">check</span>
                      Aplicar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
                  <span className="material-icons-outlined text-3xl text-gray-300">lightbulb</span>
              </div>
              <p className="text-sm text-slate-500 max-w-[200px] mx-auto">Agrega notas opcionales y genera contenido automático para tu proyecto.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || !apiKey}
            className="px-5 py-2.5 text-sm font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            {loading ? "Procesando..." : suggestions.length > 0 ? "Regenerar" : "Generar"}
            {!loading && <span className="material-icons-outlined text-sm">auto_awesome</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors ${className ?? ""}`}
      >
        <span className="material-icons-outlined text-sm">auto_awesome</span>
        Generar con IA
      </button>
      {isOpen && createPortal(modalContent, document.body)}
    </>
  );
};
