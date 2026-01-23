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

export interface Entity {
  id: string;
  name: string;
  rut: string;
  address: string;
  type: BeneficiaryType;
  category: string;
  classType: string;
  web?: string;
}

export interface LegalRep {
  name: string;
  rut: string;
  email: string;
}

export interface TimelineActivity {
  id: string;
  name: string;
  unit: "dias" | "semanas" | "meses";
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
  fileSize?: number;
  maxAgeDays?: number;
  issueDate?: string;
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
  field?: string;
}

export interface RetributionDetails {
  what: string;
  who: string;
  quantity: number;
  location: string;
  when: string;
  accessCondition: "Gratuito" | "Pagado" | "Beneficio";
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;

  initial: {
    entityId?: string;
    projectType: ProjectType;
    beneficiaryType: BeneficiaryType;
    beneficiaryCategory: string;
    beneficiaryClass: string;
  };

  beneficiary: {
    entity: Entity | null;
    legalRep: LegalRep;
  };

  content: {
    title: string;
    summary: string;
    objectivesGeneral: string;
    objectivesSpecific: string[];
    durationMonths: number;
    startDate: string;
    targetAudienceType: string;
    targetAudienceAmount: number;
    targetAudienceComment: string;
    locationRegion: string;
    locationComuna: string;
    locationSpace: string;
    culturalRetribution: string; // Textual description
    retributionStructured: RetributionDetails;
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
  constraints?: {
    maxChars?: number;
    [key: string]: any;
  };
  projectContext: Partial<Project>;
  userNotes?: string;
}

export interface AiResponsePayload {
  suggestions: any[]; // strict usage depends on task
  meta: {
    model: string;
    timestamp: number;
    tokens?: number;
  };
  traceId: string;
}
