import { BeneficiaryType, DocumentItem } from "./types";

interface DocumentRule {
    id: string;
    name: string;
    required: boolean;
    condition: (bType: BeneficiaryType, bCat: string, bClass: string) => boolean;
    maxAgeDays?: number;
}

const RULES: DocumentRule[] = [
    {
        id: "doc-rut-rep",
        name: "Cédula de Identidad Representante Legal",
        required: true,
        condition: () => true // Always required
    },
    {
        id: "doc-vigencia",
        name: "Certificado de Vigencia de la Entidad (PJ)",
        required: true,
        maxAgeDays: 60,
        condition: (t) => t === BeneficiaryType.Juridica
    },
    {
        id: "doc-estatutos",
        name: "Estatutos de la Entidad",
        required: true,
        condition: (t) => t === BeneficiaryType.Juridica
    },
    {
        id: "doc-directorio",
        name: "Certificado de Directorio Vigente",
        required: true,
        condition: (t) => t === BeneficiaryType.Juridica
    },
    {
        id: "doc-residencia",
        name: "Certificado de Residencia",
        required: true,
        condition: (t) => t === BeneficiaryType.Natural
    },
    {
        id: "doc-decreto",
        name: "Decreto de Nombramiento",
        required: true,
        condition: (t) => t === BeneficiaryType.Estatal
    },
    {
        id: "doc-banco",
        name: "Certificado de Cuenta Bancaria Exclusiva",
        required: true,
        condition: () => true // Always required for funds
    },
    {
        id: "doc-declaracion-jurada",
        name: "Declaración Jurada Simple (Art. 8)",
        required: true,
        condition: () => true
    }
];

export const generateChecklist = (
    type: BeneficiaryType,
    category: string,
    classType: string
): DocumentItem[] => {
    return RULES.filter(rule => rule.condition(type, category, classType)).map(rule => ({
        id: rule.id,
        name: rule.name,
        required: rule.required,
        status: "Pendiente",
        maxAgeDays: rule.maxAgeDays
    }));
};
