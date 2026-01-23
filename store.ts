import { Project, ValidationResult } from './types';
import { EMPTY_PROJECT, generateId } from './constants';
import { getRequiredDocuments } from './lib/documentRules';
import { runQualityGates } from './lib/validators';

interface AppState {
  projects: Project[];
  currentProject: Project | null;
  apiKey: string | null;

  createProject: (base?: Partial<Project>) => void;
  loadProject: (id: string) => void;
  updateProject: (data: Partial<Project>) => void; // Shallow for top-level
  updateDeepProject: (path: string, value: any) => void; // Deep update helper
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  setApiKey: (key: string | null) => void;

  // Logic
  recalcDocuments: () => void;
}

// Simple Deep Merge/Set Helper
const setByPath = (obj: any, path: string, value: any): any => {
  const parts = path.split('.');
  const newObj = { ...obj };
  let current = newObj;
  for (let i = 0; i < parts.length - 1; i++) {
    current[parts[i]] = { ...current[parts[i]] };
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
  return newObj;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      apiKey: null,

      createProject: (base) => {
        const id = generateId();
        const newProject: Project = {
          ...EMPTY_PROJECT,
          ...base,
          id,
          meta: { ...EMPTY_PROJECT.meta, createdAt: Date.now(), updatedAt: Date.now() }
        };
        // Initial docs
        // const docs = getRequiredDocuments(newProject);
        // newProject.paso5_documentos.admisibilidad_obligatoria = docs;

        set(state => ({
          projects: [newProject, ...state.projects],
          currentProject: newProject
        }));
      },

      loadProject: (id) => {
        const p = get().projects.find(x => x.id === id);
        if (p) set({ currentProject: p });
      },

      updateProject: (data) => {
        const { currentProject, projects } = get();
        if (!currentProject) return;

        const updated = { ...currentProject, ...data, meta: { ...currentProject.meta, updatedAt: Date.now() } };
        const newProjects = projects.map(p => p.id === updated.id ? updated : p);

        set({ currentProject: updated, projects: newProjects });
      },

      updateDeepProject: (path, value) => {
        const { currentProject, projects } = get();
        if (!currentProject) return;

        const updated = setByPath(currentProject, path, value);
        updated.meta.updatedAt = Date.now();

        const newProjects = projects.map(p => p.id === updated.id ? updated : p);
        set({ currentProject: updated, projects: newProjects });
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
            meta: { ...p.meta, createdAt: Date.now(), updatedAt: Date.now() }
          };
          set(state => ({ projects: [copy, ...state.projects] }));
        }
      },

      recalcDocuments: () => {
        const { currentProject, updateProject } = get();
        if (!currentProject) return;
        const docs = getRequiredDocuments(currentProject);

        // Merge? For MVP replace logic for admisibilidad
        updateProject({
          paso5_documentos: {
            ...currentProject.paso5_documentos,
            admisibilidad_obligatoria: docs
          }
        });
      },

      setApiKey: (key) => set({ apiKey: key })
    }),
    {
      name: 'donaciones-mvp-storage-v2', // Version bump
      partialize: (state) => ({ projects: state.projects, apiKey: state.apiKey })
    }
  )
);
