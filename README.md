# Asistente Donaciones Culturales (MVP)

Prototipo de aplicación web para formular proyectos de Ley de Donaciones Culturales usando React y Google Gemini.

## Estructura

- **Frontend**: React + Vite (simulado) + Tailwind + Zustand.
- **Backend**: Node.js + Express + Gemini SDK.

## Instalación y Ejecución

1.  **Frontend**:
    En un entorno real, ejecutarías `npm install` y `npm run dev`.
    Para este entregable, los archivos `App.tsx`, `index.tsx` y `screens/*.tsx` constituyen la app React.

2.  **Backend (Servidor AI)**:
    El archivo `server.ts` contiene la lógica del servidor.
    
    Pasos para correr el backend:
    ```bash
    # 1. Instalar dependencias
    npm install express cors @google/genai uuid
    npm install -D typescript ts-node @types/express @types/cors

    # 2. Configurar API Key
    export API_KEY="tu_clave_gemini_aqui"

    # 3. Correr servidor
    npx ts-node server.ts
    ```

## Uso

1.  Abre la aplicación web (http://localhost:5173 por defecto en Vite).
2.  El Dashboard muestra proyectos existentes. Crea uno nuevo o edita el "seed".
3.  Navega por el Wizard.
4.  En los pasos "Proyecto", "Cronograma" y "Presupuesto", busca el botón **"Generar con IA"** junto a los campos.
5.  Esto llamará a `localhost:3000/api/ai/generate`.

## Features
- Validación en tiempo real (limites de caracteres, campos obligatorios).
- Persistencia en LocalStorage.
- Historial de prompts.
- Checklist documental dinámico según tipo de beneficiario.
