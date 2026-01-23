import { Project } from "../types";

// Configuration JSON as requested
const DOCUMENT_RULES = {
    "Jurídica": {
        "Privada": {
            "Corporación": [
                { name: "Cédula de Identidad Representante Legal", required: true },
                { name: "Estatutos de la Entidad", required: true },
                { name: "Certificado de Vigencia", required: true, maxAgeDays: 60, observacion: "Fecha no superior a 60 días" },
                { name: "RUT de la Entidad (SII)", required: true },
                { name: "Acta de Directorio Vigente", required: true },
                { name: "Acreditación de domicilio", required: true },
                { name: "Certificado de inscripción en Registro Civil", required: true }
            ],
            "Fundación": [
                { name: "Cédula de Identidad Representante Legal", required: true },
                { name: "Estatutos de la Entidad", required: true },
                { name: "Certificado de Vigencia", required: true, maxAgeDays: 60, observacion: "Fecha no superior a 60 días" },
                { name: "RUT de la Entidad (SII)", required: true },
                { name: "Acta de Directorio Vigente", required: true },
                { name: "Acreditación de domicilio", required: true },
                { name: "Certificado de inscripción en Registro Civil", required: true }
            ],
            "default": [
                { name: "Cédula de Identidad Representante Legal", required: true },
                { name: "Estatutos de la Entidad", required: true },
                { name: "Certificado de Vigencia", required: true, maxAgeDays: 60 },
                { name: "RUT de la Entidad (SII)", required: true },
                { name: "Acreditación de domicilio", required: true }
            ]
        },
        "default": [
            { name: "Cédula de Identidad Representante Legal", required: true },
            { name: "RUT de la Entidad (SII)", required: true }
        ]
    },
    "Natural": {
        "default": [
            { name: "Cédula de Identidad", required: true },
            { name: "Curriculum Vitae", required: true },
            { name: "Acreditación de domicilio", required: true }
        ]
    },
    "Estatal": {
        "default": [
            { name: "Decreto de Nombramiento", required: true },
            { name: "RUT de la Entidad", required: true }
        ]
    }
};

export const getRequiredDocuments = (project: Project) => {
    const type = project.clasificacion.tipo_beneficiario as keyof typeof DOCUMENT_RULES;
    const cat = project.clasificacion.categoria_beneficiario;

    // 1. Mandatory Admissibility
    let rules = [];
    const typeRules = DOCUMENT_RULES[type];
    if (typeRules) {
        // @ts-ignore
        rules = typeRules[cat] || typeRules["default"] || [];
    }

    // 2. Declaración Jurada (Always required)
    rules = [...rules, { name: "Declaración Jurada Simple", required: true, observacion: "Obligatoria para todos" }];

    // 3. Intellectual Property
    if (project.paso5_documentos.propiedad_intelectual.declara_uso) {
        rules.push({
            name: "Documento de Autorización de Uso de Obra/Licencia",
            required: true,
            observacion: "Requerido por uso de propiedad intelectual"
        });
    }

    return rules.map(r => ({
        id: Math.random().toString(36).substring(7),
        name: r.name,
        required: r.required,
        status: "Pendiente",
        maxAgeDays: r.maxAgeDays,
        observacion: r.observacion
    }));
};
