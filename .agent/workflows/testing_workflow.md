---
description: Cómo ejecutar las pruebas automatizadas (Backend y E2E)
---

# Ejecución de Pruebas Automatizadas

Este flujo de trabajo describe cómo ejecutar las pruebas de backend (Jest) y frontend (Cypress) en el proyecto SmartPYME.

## 1. Pruebas de Backend (Jest + Supertest)

Estas pruebas verifican la lógica del servidor, la base de datos y los endpoints de la API. No requieren que el servidor de desarrollo (`npm run dev`) esté corriendo, pero sí requieren acceso a la base de datos MySQL.

**Pasos:**
1.  Abrir una terminal.
2.  Navegar a la carpeta `backend`.
3.  Ejecutar el comando de prueba.

```powershell
cd backend
npm test
```

## 2. Pruebas E2E (Cypress)

Estas pruebas simulan un usuario real navegando por la aplicación. **Requieren que tanto el frontend como el backend estén en ejecución.**

**Requisitos previos:**
-   Backend corriendo en `http://localhost:3000` (o puerto configurado).
-   Frontend corriendo en `http://localhost:5173`.

**Opción A: Ejecución en modo "Headless" (Consola)**
Ejecuta todas las pruebas en la terminal y muestra los resultados. Ideal para verificación rápida.

```powershell
cd frontend
npm run cypress:run
```

**Opción B: Ejecución en modo Interactivo (Interfaz Gráfica)**
Abre la ventana de Cypress para ver las pruebas ejecutarse en tiempo real y depurar.

```powershell
cd frontend
npx cypress open
```
-   En la ventana que se abre, seleccionar "E2E Testing".
-   Seleccionar el navegador (ej. Chrome).
-   Hacer clic en el archivo de prueba `purchase_flow.cy.js`.
