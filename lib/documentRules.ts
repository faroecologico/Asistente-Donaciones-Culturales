import { BeneficiaryType, DocRule } from "../types";

// Helper Interface locally
interface InternalDocRule {
    name: string;
    required: boolean;
    maxAgeDays?: number;
}

export const getRequiredDocuments = (type: BeneficiaryType, category: string, classType: string): InternalDocRule[] => {
    const docs: InternalDocRule[] = [
        { name: "Cédula de Identidad Representante Legal", required: true },
        { name: "Estatutos de la Entidad", required: true },
        { name: "Certificado de Vigencia (Pers. Jurídica)", required: true, maxAgeDays: 90 },
        { name: "RUT de la Entidad (SII)", required: true }
    ];

    if (type === BeneficiaryType.Juridica) {
        docs.push({ name: "Acta de Directorio Vigente", required: true });
        docs.push({ name: "Acreditación de domicilio", required: true });
    }

    if (category === "Corporación" || category === "Fundación") {
        docs.push({ name: "Certificado de inscripción en Registro Civil", required: true });
    }

    // Example dynamic rule
    if (classType === "Museo") {
        docs.push({ name: "Certificado de inscripción en Registro de Museos", required: true });
    }

    return docs;
};
