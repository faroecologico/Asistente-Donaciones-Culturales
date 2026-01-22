import { Project, ValidationResult } from "./types";
import { BUDGET_RED_FLAGS } from "./constants";

export const validateProject = (project: Project): ValidationResult => {
  const result: ValidationResult = {
    valid: true,
    errors: {},
    warnings: {}
  };

  const addError = (field: string, msg: string) => {
    if (!result.errors[field]) result.errors[field] = [];
    result.errors[field].push(msg);
    result.valid = false;
  };

  const addWarning = (field: string, msg: string) => {
    if (!result.warnings[field]) result.warnings[field] = [];
    result.warnings[field].push(msg);
  };

  // Título: <= 150 caracteres
  if (!project.content.title) addError('title', 'El título es obligatorio.');
  else if (project.content.title.length > 150) addError('title', 'El título excede los 150 caracteres.');

  // Resumen: <= 400 caracteres
  if (!project.content.summary) addError('summary', 'El resumen es obligatorio.');
  else if (project.content.summary.length > 400) addError('summary', 'El resumen excede los 400 caracteres.');

  // Retribución cultural
  const ret = project.content.retributionStructured;
  if (!ret.what || !ret.who || !ret.location) {
    addError('retribution', 'La retribución cultural debe estar completa (Qué, Quién, Dónde).');
  }
  if (ret.quantity <= 0 && project.retributionMeta.metrics.length === 0) {
    addError('retribution', 'Debe tener al menos 1 métrica (cantidad o métrica explícita).');
  }
  if (project.retributionMeta.evidence.length === 0) {
    addError('retribution', 'Debe seleccionar al menos 1 evidencia.');
  }

  // Cronograma: al menos 1 actividad
  if (project.timeline.length === 0) {
    addError('timeline', 'El cronograma debe tener al menos 1 actividad.');
  }

  // Presupuesto: al menos 1 ítem con monto > 0
  if (project.budget.length === 0) {
    addError('budget', 'El presupuesto debe tener al menos 1 ítem.');
  } else {
    const hasValidItem = project.budget.some(item => item.amount > 0);
    if (!hasValidItem) addError('budget', 'Al menos un ítem debe tener un monto mayor a 0.');

    // Warnings for Red Flags
    project.budget.forEach(item => {
      const desc = item.description.toLowerCase();
      BUDGET_RED_FLAGS.forEach(flag => {
        if (desc.includes(flag)) {
          addWarning('budget', `Gasto posiblemente objetable: "${item.description}" contiene "${flag}".`);
        }
      });
    });
  }

  // Documentos: los obligatorios no pueden estar en “pendiente”
  const missingDocs = project.documents.filter(doc => doc.required && doc.status === 'Pendiente');
  if (missingDocs.length > 0) {
    addError('documents', `Faltan ${missingDocs.length} documentos obligatorios por adjuntar.`);
  }

  return result;
};