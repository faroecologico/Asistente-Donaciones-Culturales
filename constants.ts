import { ProjectType, BeneficiaryType, ProjectStatus, Project } from './types';

export const generateId = () => Math.random().toString(36).substring(2, 11);

export const EMPTY_PROJECT: Project = {
  id: '',
  name: '',
  status: ProjectStatus.Draft,
  createdAt: 0,
  updatedAt: 0,
  initial: {
    projectType: ProjectType.Actividades,
    beneficiaryType: BeneficiaryType.Juridica,
    beneficiaryCategory: '',
    beneficiaryClass: ''
  },
  beneficiary: {
    entity: null,
    legalRep: { name: '', rut: '', email: '' }
  },
  content: {
    title: '',
    summary: '',
    objectivesGeneral: '',
    objectivesSpecific: [],
    durationMonths: 1,
    startDate: '',
    targetAudienceType: 'General',
    targetAudienceAmount: 0,
    targetAudienceComment: '',
    locationRegion: '',
    locationComuna: '',
    locationSpace: '',
    culturalRetribution: '',
    retributionStructured: {
      what: '',
      who: '',
      quantity: 0,
      location: '',
      when: '',
      accessCondition: 'Gratuito'
    }
  },
  retributionMeta: {
    metrics: [],
    evidence: []
  },
  timeline: [],
  budget: [],
  documents: [],
  aiHistory: []
};

export const BUDGET_RED_FLAGS = [
  "alcohol", "bebidas alcohólicas", "propinas", "multas", "intereses", "regalos", "premios en efectivo"
];

export const RETRIBUTION_EVIDENCE_OPTIONS = [
  "Lista de asistencia",
  "Fotografías con geolocalización",
  "Acta de recepción",
  "Link de publicación en redes sociales",
  "Aparición en prensa",
  "Certificado de autoridad local"
];
export const RETRIBUTION_METRICS_OPTIONS = [
  "N° de beneficiarios directos",
  "N° de actividades realizadas",
  "N° de ejemplares distribuidos",
  "Porcentaje de becas otorgadas",
  "N° de horas de mediación"
];
