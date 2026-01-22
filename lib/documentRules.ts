import { DocumentItem, BeneficiaryType } from "../types";

export interface DocRule {
    name: string;
    required: boolean;
    maxAgeDays?: number;
}

export const getRequiredDocuments = (type: BeneficiaryType, category: string, classType: string): DocRule[] => {
    const baseDocs: DocRule[] = [
        { name: "Cédula de Identidad Representante Legal", required: true },
        { name: "Certificado de Vigencia de la Entidad", required: true, maxAgeDays: 90 },
        { name: "Estatutos de la Entidad", required: true }
    ];

    if (type === BeneficiaryType.Juridica) {
        baseDocs.push({ name: "RUT de la Entidad", required: true });
        baseDocs.push({ name: "Acta de última elección de Directorio", required: true });
    }

    if (category === "Organización Comunitaria") {
        baseDocs.push({ name: "Certificado de Directiva Vigente", required: true, maxAgeDays: 60 });
    }

    return baseDocs;
};
