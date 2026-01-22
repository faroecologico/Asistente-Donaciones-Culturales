// Enums
export enum ProjectType {
  Actividades = "Actividades",
  Equipamiento = "Equipamiento",
  Funcionamiento = "Funcionamiento",
  Infraestructura = "Infraestructura",
  Patrimonio = "Patrimonio"
}

export enum BeneficiaryType {
  Juridica = "Juridica",
  Natural = "Natural",
  Estatal = "Estatal"
}

export enum ProjectStatus {
  Draft = "Borrador",
  Ready = "Listo",
  Exported = "Exportado"
}

// 6.1 Entity Management
export interface Entity {
  id: string;
  name: string;
  rut: string;
  address: string;
  type: BeneficiaryType;
  category: string; 
  classType: string;
}

export interface LegalRep {
  name: string;
  rut: string;
  email: string;
}

export interface TimelineActivity {
  id: string;
  name: string;
  unit: "dias" | "semanas" | "meses"; // RF-17
  duration: number;
  description: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  amount: number;
  category: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  required: boolean;
  status: "Pendiente" | "Adjunto" | "Validado";
  fileName?: string;
  maxAgeDate?: string; // RF-26 Control de vigencia
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

export interface AiLog {
  id: string;
  timestamp: number;
  task: string;
  prompt: string;
  response: string;
  applied: boolean;
}

// RF-16 Structured Retribution
export interface RetributionDetails {
  what: string;
  who: string;
  quantity: number; // Cuantas veces / beneficiarios
  location: string;
  when: string;
  accessCondition: "Gratuito" | "Pagado" | "Beneficio";
}

// Main Project Interface
export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;

  initial: {
    entityId?: string; // Link to the source entity
    projectType: ProjectType;
    beneficiaryType: BeneficiaryType;
    beneficiaryCategory: string; // RF-06
    beneficiaryClass: string;    // RF-06
  };

  beneficiary: {
    entity: Entity; // Snapshot of entity data
    legalRep: LegalRep;
  };

  content: {
    title: string;
    summary: string;
    objectivesGeneral: string;
    objectivesSpecific: string[];
    durationMonths: number;
    startDate: string;
    
    // RF-14 & RF-15
    targetAudienceType: string;
    targetAudienceAmount: number;
    targetAudienceComment: string;
    
    locationRegion: string;
    locationComuna: string;
    locationSpace: string;

    retribution: RetributionDetails; // RF-16
    
    hasIntellectualProperty: boolean; // RF-25
  };

  retributionMeta: {
    metrics: string[];
    evidence: string[];
  };

  timeline: TimelineActivity[];
  budget: BudgetItem[];
  documents: DocumentItem[];

  aiHistory: AiLog[];
}

// API Types
export type AiTask = 
  | "generate_title" 
  | "generate_summary" 
  | "generate_objectives" 
  | "generate_retribution" 
  | "generate_timeline" 
  | "generate_budget_skeleton" 
  | "rewrite_to_limit";

export interface AiRequestPayload {
  projectId: string;
  task: AiTask;
  field?: string;
  constraints?: Record<string, any>;
  projectContext: Partial<Project>;
  userNotes?: string;
}

export interface AiResponsePayload {
  suggestions: string[] | any[];
  meta: {
    tokens?: number;
    model: string;
    timestamp: number;
  };
  warnings?: string[];
  traceId: string;
}
