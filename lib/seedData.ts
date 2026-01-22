import { Project, ProjectType, BeneficiaryType, ProjectStatus } from "../types";
import { generateId } from "../constants";

export const DEMO_PROJECT: Project = {
    id: "demo-project-id",
    name: "Festival de Teatro Comunitario 2026",
    status: ProjectStatus.Draft,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    initial: {
        projectType: ProjectType.Actividades,
        beneficiaryType: BeneficiaryType.Juridica,
        beneficiaryCategory: "Corporación Cultural",
        beneficiaryClass: "Privada sin fines de lucro"
    },
    beneficiary: {
        entity: {
            id: "ent-1",
            name: "Corporación Cultural Innova",
            rut: "76.123.456-K",
            address: "Av. Las Rosas 123, Santiago",
            type: BeneficiaryType.Juridica,
            category: "Cultura",
            classType: "Fundación",
            web: "www.culturainnova.cl"
        },
        legalRep: {
            name: "Juan Pérez García",
            rut: "12.345.678-9",
            email: "jperez@culturainnova.cl"
        }
    },
    content: {
        title: "Festival de Teatro Comunitario itinerante en la Región del Maule",
        summary: "Este proyecto consiste en la realización de 12 funciones de teatro gratuitas en 4 comunas rurales de la Región del Maule (Curicó, Linares, San Javier y Empedrado), beneficiando a más de 2.000 personas que no suelen tener acceso a oferta cultural presencial.",
        objectivesGeneral: "Fortalecer el acceso democrático a las artes escénicas en zonas rurales del Maule.",
        objectivesSpecific: [
            "Realizar 12 funciones de teatro profesional.",
            "Vincular a la comunidad local mediante conversatorios post-función.",
            "Capacitar a 4 gestores locales en producción de eventos."
        ],
        durationMonths: 6,
        startDate: "2026-04-01",
        targetAudienceType: "Comunidades rurales y escolares",
        targetAudienceAmount: 2000,
        targetAudienceComment: "Población con escaso acceso a infraestructura cultural.",
        locationRegion: "Maule",
        locationComuna: "Curicó, Linares, San Javier, Empedrado",
        locationSpace: "Plazas de Armas y Casas de la Cultura locales",
        culturalRetribution: "Funciones gratuitas para toda la comunidad, con entrega de programas educativos.",
        retributionStructured: {
            what: "Funciones de teatro gratuitas",
            who: "Población general de comunas rurales",
            quantity: 12,
            location: "Espacios públicos locales",
            when: "Fines de semana de mayo a agosto 2026",
            accessCondition: "Gratuito"
        }
    },
    retributionMeta: {
        metrics: ["12 funciones realizadas", "2000 asistentes estimados"],
        evidence: ["Lista de asistencia", "Fotografías con geolocalización", "Acta de recepción"]
    },
    timeline: [
        { id: "t1", name: "Producción y Ensayos", unit: "meses", duration: 2, description: "Preparación de la puesta en escena y logística técnico-administrativa." },
        { id: "t2", name: "Ejecución de Funciones", unit: "meses", duration: 3, description: "Despliegue territorial y realización de conversatorios." },
        { id: "t3", name: "Cierre y Evaluación", unit: "meses", duration: 1, description: "Elaboración de informe final y rendición de cuentas." }
    ],
    budget: [
        { id: "b1", description: "Honorarios Actores y Técnicos", amount: 15000000, category: "Recursos Humanos" },
        { id: "b2", description: "Arriendo de Equipamiento y Escenario", amount: 8000000, category: "Producción" },
        { id: "b3", description: "Difusión y Prensa", amount: 2000000, category: "Difusión" }
    ],
    documents: [
        { id: "d1", name: "Cédula de Identidad Representante Legal", required: true, status: "Adjunto", fileName: "rut_representante.pdf" },
        { id: "d2", name: "Certificado de Vigencia de la Entidad", required: true, status: "Validado", fileName: "vigencia_2026.pdf" },
        { id: "d3", name: "Estatutos de la Entidad", required: true, status: "Adjunto", fileName: "estatutos_firmados.pdf" }
    ],
    aiHistory: []
};
