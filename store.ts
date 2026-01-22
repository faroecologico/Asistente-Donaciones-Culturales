
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, ValidationResult, AiLog, ProjectStatus, Entity } from './types';
import { EMPTY_PROJECT, SEED_PROJECT, MOCK_ENTITIES, generateId } from './constants';
import { validateProject } from './utils';
import { supabase } from './lib/supabaseClient';

// Supabase User type definition mock (to avoid heavy dependency in types.ts)
interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}

interface AppState {
  projects: Project[];
  entities: Entity[];
  currentProject: Project | null;
  validation: ValidationResult | null;
  
  // Auth & Settings State
  currentUser: User | null;
  apiKey: string | null; // Local user API Key
  isSaving: boolean;     // Remote save loading state
  
  // Actions
  loadProject: (id: string) => void;
  createProject: (entityId?: string) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  updateProject: (data: Partial<Project>) => void;
  runValidation: () => void;
  addAiLog: (log: AiLog) => void;
  
  // Entity Actions
  addEntity: (entity: Entity) => void;

  // Auth & Settings Actions
  setCurrentUser: (user: User | null) => void;
  setApiKey: (key: string | null) => void;
  saveRemoteProject: () => Promise<boolean>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [SEED_PROJECT],
      entities: MOCK_ENTITIES,
      currentProject: null,
      validation: null,
      currentUser: null,
      apiKey: null,
      isSaving: false,

      loadProject: (id) => {
        const p = get().projects.find(p => p.id === id);
        if (p) {
            set({ currentProject: JSON.parse(JSON.stringify(p)), validation: validateProject(p) });
        }
      },

      createProject: (entityId) => {
        let baseProject = { ...EMPTY_PROJECT, id: generateId(), createdAt: Date.now() };
        
        // RF-03 Pre-fill entity if selected
        if (entityId) {
            const ent = get().entities.find(e => e.id === entityId);
            if (ent) {
                baseProject.initial.entityId = ent.id;
                baseProject.initial.beneficiaryType = ent.type;
                baseProject.initial.beneficiaryCategory = ent.category;
                baseProject.initial.beneficiaryClass = ent.classType;
                baseProject.beneficiary.entity = { ...ent };
            }
        }

        set(state => ({
          projects: [...state.projects, baseProject],
          currentProject: baseProject,
          validation: validateProject(baseProject)
        }));
      },

      deleteProject: (id) => {
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject
        }));
      },

      duplicateProject: (id) => {
        const p = get().projects.find(p => p.id === id);
        if (p) {
          const copy: Project = { 
            ...JSON.parse(JSON.stringify(p)), 
            id: generateId(), 
            name: `${p.name} (Copia)`,
            createdAt: Date.now(),
            status: ProjectStatus.Draft
          };
          set(state => ({ projects: [...state.projects, copy] }));
        }
      },

      updateProject: (data) => {
        const { currentProject, projects } = get();
        if (!currentProject) return;

        const updated = { ...currentProject, ...data, updatedAt: Date.now() };
        const updatedList = projects.map(p => p.id === updated.id ? updated : p);

        set({
          currentProject: updated,
          projects: updatedList,
        });
      },

      runValidation: () => {
        const { currentProject } = get();
        if (currentProject) {
          set({ validation: validateProject(currentProject) });
        }
      },

      addAiLog: (log) => {
        const { currentProject } = get();
        if (!currentProject) return;
        const newHistory = [log, ...currentProject.aiHistory];
        get().updateProject({ aiHistory: newHistory });
      },

      addEntity: (entity) => {
          set(state => ({ entities: [...state.entities, entity] }));
      },

      setCurrentUser: (user) => {
        set({ currentUser: user });
      },

      setApiKey: (key) => {
        set({ apiKey: key });
      },

      saveRemoteProject: async () => {
        const { currentProject, currentUser } = get();
        if (!currentProject || !currentUser) return false;

        set({ isSaving: true });
        try {
            // Upsert project to Supabase 'projects' table
            // Assuming table exists: id (uuid), user_id (uuid), content (jsonb), updated_at (timestamptz)
            const { error } = await supabase
                .from('projects')
                .upsert({
                    id: currentProject.id, // Ensure this ID format matches DB (UUID vs Short ID might need conversion in real app)
                    user_id: currentUser.id,
                    name: currentProject.name,
                    status: currentProject.status,
                    content: currentProject, // Dump full JSON
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            
            // Simulation delay for UX
            await new Promise(r => setTimeout(r, 800)); 
            
            set({ isSaving: false });
            return true;
        } catch (e) {
            console.error("Error saving to Supabase:", e);
            set({ isSaving: false });
            return false;
        }
      }

    }),
    {
      name: 'cultural-donations-storage',
      partialize: (state) => ({ 
        projects: state.projects, 
        entities: state.entities,
        apiKey: state.apiKey
      }),
    }
  )
);
