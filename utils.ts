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
  // Métrica check
  if (project.retributionMeta.metrics.length === 0 && ret.quantity <= 0) {
    addError('retribution_meta', 'Debe indicar una cantidad o métrica.');
  }

  // Cronograma: al menos 1 actividad
  if (project.timeline.length === 0) {
    addError('timeline', 'Debe tener al menos 1 actividad en el cronograma.');
  }

  // Presupuesto: al menos 1 ítem con monto > 0
  if (project.budget.length === 0) {
    addError('budget', 'El presupuesto no puede estar vacío.');
  } else {
    const validItems = project.budget.filter(i => i.amount > 0);
    if (validItems.length === 0) addError('budget', 'Debe haber al menos 1 ítem con monto mayor a 0.');

    // Check Red Flags
    project.budget.forEach(item => {
      const text = item.description.toLowerCase();
      BUDGET_RED_FLAGS.forEach(flag => {
        if (text.includes(flag)) {
          addWarning('budget_flags', `Posible gasto objetable: "${flag}" en "${item.description}"`);
        }
      });
    });
  }

  // Documentos
  const missing = project.documents.filter(d => d.required && d.status === 'Pendiente');
  if (missing.length > 0) {
    addError('documents', `Faltan ${missing.length} documentos obligatorios.`);
  }

  return result;
};