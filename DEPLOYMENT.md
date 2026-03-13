# Guía de Despliegue Oficial: Motor Showroom Impulsa Studio

Esta guía está diseñada paso a paso, asumiendo que no tienes nada instalado y partes desde cero. Te guiará para poner tu nuevo Showroom Interactivo en línea utilizando plataformas gratuitas y de alto rendimiento.

## Entendiendo la Arquitectura Serverless (La vía Firebase)

¡No necesitas pagar ni mantener un servidor Node.js (VPS) corriendo 24/7!

Dado el modelo de negocios *Lean* de Impulsa Studio, la mejor ruta para este Showroom es una arquitectura **Serverless (Sin Servidor) utilizando Firebase** y Static Site Generation (SSG). Esto reduce tus costos operativos de servidor literalmente a $0 dólares al mes.

---

## Opción 1: Despliegue Rápido usando Vercel (Recomendado)

Vercel está altamente optimizado para frameworks modernos como Astro.

### Paso 1: Sincronizar el código a GitHub
Vercel necesita leer tu código desde un repositorio en la nube.
1. Crea una cuenta gratuita en [GitHub](https://github.com/).
2. Sube esta carpeta (tu proyecto) a un nuevo repositorio privado o público.

### Paso 2: Crear cuenta en Vercel
1. Entra a [Vercel.com](https://vercel.com/) y regístrate usando tu cuenta de GitHub.
2. Una vez en tu panel de control (Dashboard), haz clic en el botón negro **"Add New..."** y luego en **"Project"**.
3. Verás una lista de tus repositorios de GitHub. Encuentra el repositorio del Showroom y haz clic en **"Import"**.

### Paso 3: Configurar el Adaptador de Vercel en tu Código
Actualmente el proyecto usa el adaptador genérico de Node. Para que funcione perfectamente en Vercel sin configuración manual de servidores, debemos cambiarlo.

**En tu computadora (antes de subir a GitHub), ejecuta en la terminal:**
```bash
npm uninstall @astrojs/node
npm install @astrojs/vercel
```

**Luego, abre tu archivo `astro.config.mjs` y déjalo así:**
```javascript
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless'; // <-- NUEVO
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react()],
  output: 'server',
  adapter: vercel(), // <-- NUEVO
  vite: { plugins: [tailwindcss()] },
});
```
*Sube este cambio a GitHub (haz un git commit y push).*

### Paso 4: Desplegar en Vercel
1. De vuelta en la pantalla de Vercel, en la sección **"Framework Preset"**, asegúrate de que diga **Astro** (normalmente lo detecta automático).
2. Haz clic en el botón azul **"Deploy"**.
3. ¡Espera un par de minutos! Vercel instalará las dependencias y construirá tu proyecto. Al terminar, te dará una URL (ej. `impulsa-showroom.vercel.app`).
4. Entra a la web, presiona `Ctrl+Shift+A` y verifica que tu panel de control carga correctamente en vivo.

---

## Opción 2: Despliegue Total en Firebase (Hosting + Firestore)

Si ya estás utilizando Firebase para otros proyectos como *Eficell*, puedes alojar todo el Showroom 3D allí usando la capa gratuita (Spark Plan).

### Paso 1: Configurar la Base de Datos (Firestore)
En lugar de que el endpoint `/api/saveConfig` guarde un archivo temporal, el botón "Publicar" en tu panel de control se conectará directamente al SDK de Firebase en el cliente.
1. Cuando le des a "Publicar", React enviará el `useStore.getState().config` a tu base de datos de **Firestore**.
2. **Seguridad Nativa:** Puedes usar *Firebase Auth* para que solo las cuentas con el correo `@impulsastudio.cl` puedan escribir en esa base de datos.

### Paso 2: Firebase Hosting
Astro puede exportar la página entera como una carpeta de archivos estáticos que se sirve rapidísimo desde el CDN global de Firebase.
1. Ejecuta el comando en tu terminal:
```bash
npm run build
```
Esto generará la carpeta `dist/`.
2. Luego, despliega esa carpeta a Firebase ejecutando:
```bash
firebase deploy --only hosting
```

### Paso 3: Sincronización en Tiempo Real
La gran ventaja de Firebase es que no necesitas "Endpoints API" tradicionales. El componente `SceneClient.jsx` puede suscribirse a *Firestore* (`onSnapshot`).
Así, cuando cambies un color en el panel desde tu computadora, la base de datos se actualizará y la pantalla del cliente que esté visitando la web en ese mismo segundo **cambiará de color en vivo**, sin siquiera tener que recargar la página.

---

## 🔒 Consideraciones de Seguridad Post-Despliegue

Actualmente el panel se abre pulsando `Ctrl+Shift+A`. En un entorno local está bien, pero en producción **cualquier usuario** que presione esas teclas podría editar el JSON temporalmente.

Antes de mandar esto a clientes, asegúrate de:
1. Conectar tu API de `saveConfig.js` a una Base de Datos real.
2. Reemplazar la validación `isAdminMode` por una librería de autenticación real (ej. Supabase Auth o Firebase Auth) para que pida usuario y contraseña de Impulsa Studio.