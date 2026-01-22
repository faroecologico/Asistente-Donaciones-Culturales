import { BUDGET_RED_FLAGS } from "./constants";
import { Project, ValidationResult } from "./types";

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

  // 1. Initial Data (RF-05, RF-06)
  if (!project.initial.beneficiaryCategory) addError('initial', 'Falta categoría del beneficiario');
  if (!project.initial.beneficiaryClass) addError('initial', 'Falta clase del beneficiario');

  // 2. Title & Summary (RF-10, RF-11)
  if (!project.content.title) addError('title', 'El título es obligatorio.');
  if (project.content.title.length > 150) addError('title', `El título excede 150 caracteres.`);
  
  if (!project.content.summary) addError('summary', 'El resumen es obligatorio.');
  if (project.content.summary.length > 400) addError('summary', `El resumen excede 400 caracteres.`);

  // 3. Structured Retribution (RF-16)
  if (!project.content.retribution.what) addError('retribution', 'Falta definir "Qué se entrega".');
  if (!project.content.retribution.who) addError('retribution', 'Falta definir "A quién".');
  if (!project.content.retribution.location) addError('retribution', 'Falta definir "Dónde".');
  
  // Regla: Al menos 1 métrica (interpretado como cantidad > 0 en el modelo estructurado o array de metrics)
  if (project.content.retribution.quantity <= 0) addError('retribution', 'La cantidad estimada (métrica) debe ser mayor a 0.');
  
  // Regla: Al menos 1 evidencia
  if (project.retributionMeta.evidence.length === 0) addError('retribution', 'Debe seleccionar al menos 1 medio probatorio.');

  // 4. Cronograma (RF-19)
  if (project.timeline.length === 0) addError('timeline', 'Debe tener al menos 1 actividad.');

  // 5. Presupuesto (RF-22)
  if (project.budget.length === 0) {
    addError('budget', 'El presupuesto está vacío.');
  } else {
    const total = project.budget.reduce((sum, item) => sum + item.amount, 0);
    if (total <= 0) addError('budget', 'El monto total debe ser mayor a 0.');
    
    // Red Flags
    project.budget.forEach((item, idx) => {
        if (!item.description) addError('budget', `El ítem #${idx+1} no tiene descripción.`);
        
        const lowerDesc = item.description.toLowerCase();
        BUDGET_RED_FLAGS.forEach(flag => {
            if (lowerDesc.includes(flag)) {
                addWarning('budget', `Posible gasto objetable en ítem "${item.description}": "${flag}".`);
            }
        });
    });
  }

  // 6. Documentos (RF-23, RF-25)
  const missingDocs = project.documents.filter(d => d.required && d.status === "Pendiente");
  if (missingDocs.length > 0) {
    addError('documents', `Faltan ${missingDocs.length} documentos obligatorios.`);
  }

  if (project.content.hasIntellectualProperty) {
      const authDoc = project.documents.find(d => d.name === "Autorización Derechos de Autor" || d.name === "Registro Propiedad Intelectual");
      if (!authDoc || authDoc.status === "Pendiente") {
          addError('documents', 'Marcó Propiedad Intelectual pero no ha adjuntado autorización/registro.');
      }
  }

  return result;
};