import { BeneficiaryType, Entity, Project, ProjectStatus, ProjectType } from "./types";

export const generateId = () => Math.random().toString(36).substring(2, 9);

// RF-06: Classification Hierarchy
export const BENEFICIARY_HIERARCHY = {
    [BeneficiaryType.Juridica]: {
        categories: {
            "Privada sin fines de lucro": ["Fundación", "Corporación", "Organización Comunitaria"],
            "Universidades": ["Pública", "Privada"]
        }
    },
    [BeneficiaryType.Natural]: {
        categories: {
            "Persona Natural": ["Artista", "Gestor", "Investigador"]
        }
    },
    [BeneficiaryType.Estatal]: {
        categories: {
            "Institución Pública": ["Museo", "Biblioteca", "Teatro Municipal"]
        }
    }
};

// RF-22 Budget Red Flags
export const BUDGET_RED_FLAGS = [
    "alcohol", "vino", "cerveza", "cóctel",
    "propinas",
    "multas", "intereses", "deudas",
    "regalos", "premios en dinero"
];

// RF-23 Dynamic Checklist Base
export const DOCUMENT_BASE_RULES: Record<string, string[]> = {
    "Juridica": ["Estatutos", "Certificado Vigencia", "RUT Entidad", "Cédula Rep. Legal"],
    "Natural": ["Cédula Identidad", "Curriculum Vitae", "Dossier Obra"],
    "Estatal": ["Decreto Nombramiento", "RUT Institución"]
};

export const MOCK_ENTITIES: Entity[] = [
    {
        id: "ent-1",
        name: "Corporación Cultural Los Andes",
        rut: "65.111.222-3",
        address: "Av. Principal 123, Valparaíso",
        type: BeneficiaryType.Juridica,
        category: "Privada sin fines de lucro",
        classType: "Corporación"
    },
    {
        id: "ent-2",
        name: "Teatro Municipal de Rancagua",
        rut: "60.999.888-K",
        address: "Plaza Héroes s/n",
        type: BeneficiaryType.Estatal,
        category: "Institución Pública",
        classType: "Teatro Municipal"
    }
];

export const EMPTY_PROJECT: Project = {
  id: "",
  name: "Nuevo Proyecto",
  status: ProjectStatus.Draft,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  initial: {
    projectType: ProjectType.Actividades,
    beneficiaryType: BeneficiaryType.Juridica,
    beneficiaryCategory: "",
    beneficiaryClass: ""
  },
  beneficiary: {
    entity: { id:"", name: "", rut: "", address: "", type: BeneficiaryType.Juridica, category:"", classType:"" },
    legalRep: { name: "", rut: "", email: "" },
  },
  content: {
    title: "",
    summary: "",
    objectivesGeneral: "",
    objectivesSpecific: [],
    durationMonths: 6,
    startDate: "",
    targetAudienceType: "General",
    targetAudienceAmount: 0,
    targetAudienceComment: "",
    locationRegion: "",
    locationComuna: "",
    locationSpace: "",
    hasIntellectualProperty: false,
    retribution: {
        what: "",
        who: "",
        quantity: 0,
        location: "",
        when: "",
        accessCondition: "Gratuito"
    }
  },
  retributionMeta: {
    metrics: [],
    evidence: [],
  },
  timeline: [],
  budget: [],
  documents: [],
  aiHistory: []
};

// Seed Data
export const SEED_PROJECT: Project = {
  ...EMPTY_PROJECT,
  id: "seed-123",
  name: "Festival de Teatro Comunitario 2024",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  initial: {
    projectType: ProjectType.Actividades,
    beneficiaryType: BeneficiaryType.Juridica,
    beneficiaryCategory: "Privada sin fines de lucro",
    beneficiaryClass: "Corporación"
  },
  content: {
    ...EMPTY_PROJECT.content,
    title: "Festival Itinerante de Artes Escénicas en Sectores Rurales",
    summary: "Este proyecto busca llevar obras de teatro de alta calidad a 5 comunas rurales de la región.",
    locationRegion: "Maule",
    locationComuna: "Talca",
    locationSpace: "Centros Comunitarios",
    retribution: {
        what: "3 Funciones de teatro",
        who: "Vecinos de zonas rurales",
        quantity: 300,
        location: "Sedes sociales",
        when: "Fines de semana Abril",
        accessCondition: "Gratuito"
    }
  },
  documents: [
    { id: "d1", name: "Estatutos Vigentes", required: true, status: "Pendiente" },
    { id: "d2", name: "Certificado de Vigencia (PJ)", required: true, status: "Adjunto", fileName: "vigencia.pdf" },
  ]
};
