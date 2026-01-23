export interface ProjectMeta {
  version: string;
  language: string;
  createdAt: number;
  updatedAt: number;
}

export interface Clasificacion {
  tipo_proyecto: string; // "Actividades" | "Equipamiento" | ...
  tipo_beneficiario: string; // "Jurídica" | "Natural" | "Estatal"
  categoria_beneficiario: string;
  clase_beneficiario: string;
  requiere_dividir_en_varios_proyectos: boolean;
  proyectos_sugeridos: string[];
}

export interface Entidad {
  razon_social: string;
  rut: string;
  domicilio: string;
  comuna: string;
  region: string;
  telefono: string;
  email: string;
  web: string;
}

export interface RepresentanteLegal {
  nombre: string;
  rut: string;
  cargo: string;
  email: string;
  telefono: string;
}

export interface Paso1Beneficiario {
  entidad: Entidad;
  representante_legal: RepresentanteLegal;
}

export interface TextoConCharCount {
  texto: string;
  char_count: number;
}

export interface Objetivos {
  objetivo_general: string;
  objetivos_especificos: string[];
}

export interface Duracion {
  fecha_inicio_estimada: string;
  meses: number;
}

export interface PublicoObjetivo {
  segmento: string;
  rango_etario: string;
  cantidad_beneficiarios: number;
  comentarios: string;
}

export interface LugarEjecucion {
  tipo: string; // "Chile" | "Extranjero" | "Digital"
  detalle: string;
}

export interface AccionRetribucion {
  accion: string;
  cantidad: number;
  beneficio: string; // "gratuito" | "rebajado" | ...
  medible_por: string[];
  medio_probatorio: string[];
}

export interface RetribucionCultural {
  descripcion: string;
  acciones: AccionRetribucion[];
}

export interface Paso2DatosProyecto {
  titulo: TextoConCharCount;
  resumen: TextoConCharCount;
  objetivos: Objetivos;
  duracion: Duracion;
  publico_objetivo: PublicoObjetivo;
  lugar_ejecucion: LugarEjecucion;
  retribucion_cultural: RetribucionCultural;
}

export interface Actividad {
  id?: string; // UI constant
  nombre: string;
  descripcion: string;
  duracion: number;
  unidad: string; // "días" | "semanas" | "meses"
  mes_inicio_relativo: number;
  entregable: string;
  relacion_con_objetivos: string[];
}

export interface Paso3Cronograma {
  actividades: Actividad[];
}

export interface ItemPresupuesto {
  id?: string; // UI constant
  tipo_gasto: string;
  item: string;
  monto_global_clp: number;
  detalle: string;
}

export interface Paso4Presupuesto {
  items: ItemPresupuesto[];
  archivo_detalle_requerido: boolean;
}

export interface Paso5Documentos {
  admisibilidad_obligatoria: any[]; // To be defined dynamically
  adicionales_opcionales: any[];
  propiedad_intelectual: {
    declara_uso: boolean;
    documento_autorizacion_requerido: boolean;
  };
}

export interface Validaciones {
  errores: string[];
  advertencias: string[];
  faltantes: string[];
  sugerencias_mejora: string[];
}

export interface Project {
  id: string; // Internal ID
  meta: ProjectMeta;
  clasificacion: Clasificacion;
  paso1_beneficiario: Paso1Beneficiario;
  paso2_datos_proyecto: Paso2DatosProyecto;
  paso3_cronograma: Paso3Cronograma;
  paso4_presupuesto: Paso4Presupuesto;
  paso5_documentos: Paso5Documentos;
  validaciones: Validaciones;
}

export type AiTask =
  | "generate_title"
  | "generate_summary"
  | "generate_objectives"
  | "generate_initial_draft"
  | "refine_field"
  | "qa_review"
  | "validate_key";

export interface AiRequestPayload {
  projectId: string;
  task: AiTask;
  field?: string;
  projectContext: Partial<Project>;
  userNotes?: string;
}

export interface AiResponsePayload {
  suggestions: any[];
  meta: any;
  traceId: string;
}
