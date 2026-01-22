import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Entity, AiLog, ProjectStatus, ValidationResult } from './types';
import { EMPTY_PROJECT, generateId } from './constants';
import { validateProject } from './utils';

interface AppState {
  projects: Project[];
  entities: Entity[];
  currentProject: Project | null;
  validation: ValidationResult | null;
  apiKey: string | null;
  user: any | null;

  // Actions
  setUser: (user: any | null) => void;
  createProject: (base?: Partial<Project>) => void;
  loadProject: (id: string) => void;
  updateProject: (data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  runValidation: () => void;
  addAiLog: (log: AiLog) => void;
  setApiKey: (key: string | null) => void;
  loadDemo: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [],
      entities: [],
      currentProject: null,
      validation: null,
      apiKey: null,
      user: null,

      setUser: (user) => set({ user }),

      createProject: (base) => {
        const newProject = {
          ...EMPTY_PROJECT,
          ...base,
          id: generateId(),
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        set(state => ({
          projects: [newProject, ...state.projects],
          currentProject: newProject
        }));
      },

      loadProject: (id) => {
        const p = get().projects.find(p => p.id === id);
        if (p) set({ currentProject: p, validation: validateProject(p) });
      },

      updateProject: (data) => {
        const { currentProject, projects } = get();
        if (!currentProject) return;

        const updated = { ...currentProject, ...data, updatedAt: Date.now() };
        const updatedList = projects.map(p => p.id === updated.id ? updated : p);

        set({
          currentProject: updated,
          projects: updatedList,
          validation: validateProject(updated)
        });
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
            updatedAt: Date.now(),
            status: ProjectStatus.Draft
          };
          set(state => ({ projects: [copy, ...state.projects] }));
        }
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

      setApiKey: (key) => set({ apiKey: key }),

      loadDemo: () => {
        const { DEMO_PROJECT } = require('./lib/seedData');
        const demo = { ...DEMO_PROJECT, id: generateId(), createdAt: Date.now(), updatedAt: Date.now() };
        set(state => ({
          projects: [demo, ...state.projects],
          currentProject: demo,
          validation: validateProject(demo)
        }));
      }
    }),
    {
      name: 'asistente-donaciones-storage',
      partialize: (state) => ({
        projects: state.projects,
        entities: state.entities,
        apiKey: state.apiKey
      }),
    }
  )
);
