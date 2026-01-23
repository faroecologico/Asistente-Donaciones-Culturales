import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Entity, AiLog, ProjectStatus, ValidationResult, DocumentItem } from './types';
import { EMPTY_PROJECT, generateId } from './constants';
import { validateProject } from './utils';
import { getRequiredDocuments } from './lib/documentRules';

interface AppState {
  projects: Project[];
  entities: Entity[];
  currentProject: Project | null;
  validation: ValidationResult | null;
  apiKey: string | null;

  createProject: (base?: Partial<Project>) => void;
  loadProject: (id: string) => void;
  updateProject: (data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  runValidation: () => void;
  recalcDocuments: () => void;
  setApiKey: (key: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [],
      entities: [],
      currentProject: null,
      validation: null,
      apiKey: null,

      createProject: (base) => {
        const id = generateId();
        const newProject: Project = {
          ...EMPTY_PROJECT,
          ...base,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        // Initial docs calculation
        const rules = getRequiredDocuments(newProject.initial.beneficiaryType, "", "");
        newProject.documents = rules.map(r => ({
          id: generateId(),
          name: r.name,
          required: r.required,
          status: "Pendiente",
          maxAgeDays: r.maxAgeDays
        }));

        set(state => ({
          projects: [newProject, ...state.projects],
          currentProject: newProject,
          validation: validateProject(newProject)
        }));
      },

      loadProject: (id) => {
        const p = get().projects.find(x => x.id === id);
        if (p) set({ currentProject: p, validation: validateProject(p) });
      },

      updateProject: (data) => {
        const { currentProject, projects } = get();
        if (!currentProject) return;

        const updated = { ...currentProject, ...data, updatedAt: Date.now() };

        // If initial classification changed, we should ideally re-calc documents, 
        // but we'll leave that to explicit 'recalcDocuments' call or check if those fields changed.

        const newProjects = projects.map(p => p.id === updated.id ? updated : p);

        set({
          currentProject: updated,
          projects: newProjects,
          validation: validateProject(updated)
        });
      },

      recalcDocuments: () => {
        const { currentProject, updateProject } = get();
        if (!currentProject) return;
        const { beneficiaryType, beneficiaryCategory, beneficiaryClass } = currentProject.initial;
        const rules = getRequiredDocuments(beneficiaryType, beneficiaryCategory, beneficiaryClass);

        // Merge existing docs? For MVP, we'll just regenerate to align with rules
        const newDocs: DocumentItem[] = rules.map(r => ({
          id: generateId(),
          name: r.name,
          required: r.required,
          status: "Pendiente",
          maxAgeDays: r.maxAgeDays
        }));

        updateProject({ documents: newDocs });
      },

      deleteProject: (id) => {
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject
        }));
      },

      duplicateProject: (id) => {
        const p = get().projects.find(x => x.id === id);
        if (p) {
          const copy = {
            ...JSON.parse(JSON.stringify(p)),
            id: generateId(),
            name: `${p.name} (Copia)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: ProjectStatus.Draft
          };
          set(state => ({ projects: [copy, ...state.projects] }));
        }
      },

      runValidation: () => {
        const { currentProject } = get();
        if (currentProject) set({ validation: validateProject(currentProject) });
      },

      setApiKey: (key) => set({ apiKey: key })
    }),
    {
      name: 'donaciones-mvp-storage',
      partialize: (state) => ({ projects: state.projects, entities: state.entities, apiKey: state.apiKey })
    }
  )
);
