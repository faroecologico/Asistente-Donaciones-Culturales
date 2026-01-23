import { Project, ProjectStatus } from './types';

export const generateId = () => Math.random().toString(36).substring(2, 11);

export const EMPTY_PROJECT: Project = {
  id: '',
  meta: {
    version: 'mvp-1',
    language: 'es-CL',
    createdAt: 0,
    updatedAt: 0
  },
  clasificacion: {
    tipo_proyecto: 'Actividades',
    tipo_beneficiario: 'Jurídica',
    categoria_beneficiario: '',
    clase_beneficiario: '',
    requiere_dividir_en_varios_proyectos: false,
    proyectos_sugeridos: []
  },
  paso1_beneficiario: {
    entidad: {
      razon_social: '',
      rut: '',
      domicilio: '',
      comuna: '',
      region: '',
      telefono: '',
      email: '',
      web: ''
    },
    representante_legal: {
      nombre: '',
      rut: '',
      cargo: '',
      email: '',
      telefono: ''
    }
  },
  paso2_datos_proyecto: {
    titulo: { texto: '', char_count: 0 },
    resumen: { texto: '', char_count: 0 },
    objetivos: {
      objetivo_general: '',
      objetivos_especificos: []
    },
    duracion: {
      fecha_inicio_estimada: '',
      meses: 0
    },
    publico_objetivo: {
      segmento: '',
      rango_etario: '',
      cantidad_beneficiarios: 0,
      comentarios: ''
    },
    lugar_ejecucion: {
      tipo: 'Chile',
      detalle: ''
    },
    retribucion_cultural: {
      descripcion: '',
      acciones: []
    }
  },
  paso3_cronograma: {
    actividades: []
  },
  paso4_presupuesto: {
    items: [],
    archivo_detalle_requerido: true
  },
  paso5_documentos: {
    admisibilidad_obligatoria: [],
    adicionales_opcionales: [],
    propiedad_intelectual: {
      declara_uso: false,
      documento_autorizacion_requerido: false
    }
  },
  validaciones: {
    errores: [],
    advertencias: [],
    faltantes: [],
    sugerencias_mejora: []
  }
};

export const RETRIBUTION_EVIDENCE_OPTIONS = [
  "lista_asistencia", "afiches", "publicaciones_web", "rrss", "prensa", "otros"
];
