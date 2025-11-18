# 🚀 Guía de Deployment - Frontend Angular en Railway

## ⚠️ IMPORTANTE: Railway NO es recomendado para frontends Angular

Railway está optimizado para backends/APIs. Para frontends Angular, **es MUCHO mejor usar:**

1. **Vercel** (Recomendado) - Gratis, optimizado para Angular/React
2. **Netlify** - Gratis, muy fácil de usar
3. **Cloudflare Pages** - Gratis, súper rápido
4. **GitHub Pages** - Gratis para repos públicos

---

## 🎯 OPCIÓN 1: Vercel (RECOMENDADA)

### **¿Por qué Vercel?**
- ✅ Completamente gratis
- ✅ Optimizado para Angular
- ✅ CDN global automático
- ✅ SSL automático
- ✅ Deploy en segundos
- ✅ Sin límite de sitios
- ✅ Preview automático de PRs

### **Pasos para Vercel:**

#### 1. Actualizar la URL del backend

Edita `src/environments/environment.ts`:

\`\`\`typescript
export const environment = {
  production: true,
  API_BASE_URL: 'https://tu-backend.up.railway.app/api'
};
\`\`\`

#### 2. Crear cuenta en Vercel

1. Ve a https://vercel.com
2. Haz clic en **"Sign Up"**
3. Selecciona **"Continue with GitHub"**

#### 3. Importar proyecto

1. Haz clic en **"Add New..."** → **"Project"**
2. Selecciona tu repositorio de GitHub
3. Vercel detectará automáticamente que es Angular

#### 4. Configurar el proyecto

Vercel pre-configura todo, pero verifica:

- **Framework Preset:** Angular
- **Build Command:** `npm run build` (ya está configurado)
- **Output Directory:** `dist/game-store/browser`
- **Install Command:** `npm install`

#### 5. Deploy

1. Haz clic en **"Deploy"**
2. Espera ~2 minutos
3. ¡Listo! Te dará una URL como: `https://game-store-xyz.vercel.app`

#### 6. Actualizar CORS en el backend

Ve a tu backend en Railway y actualiza la variable:

\`\`\`bash
FRONTEND_URL=https://game-store-xyz.vercel.app
\`\`\`

---

## 🎯 OPCIÓN 2: Netlify

### **Pasos para Netlify:**

#### 1. Crear cuenta

1. Ve a https://netlify.com
2. **"Sign Up"** → **"GitHub"**

#### 2. Importar proyecto

1. **"Add new site"** → **"Import an existing project"**
2. Selecciona tu repo de GitHub

#### 3. Configurar build

- **Build command:** `npm run build`
- **Publish directory:** `dist/game-store/browser`
- **Node version:** 18

#### 4. Crear archivo `netlify.toml` en la raíz:

\`\`\`toml
[build]
  command = "npm run build"
  publish = "dist/game-store/browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
\`\`\`

#### 5. Deploy

1. Haz clic en **"Deploy site"**
2. Te dará una URL como: `https://game-store-xyz.netlify.app`

---

## 🎯 OPCIÓN 3: Railway (NO RECOMENDADA)

**Desventajas de Railway para frontends:**
- ❌ Consume tu crédito mensual ($5)
- ❌ No es CDN (más lento)
- ❌ Requiere servidor web adicional (nginx)
- ❌ Más complejo de configurar

### **Solo usa Railway si realmente lo necesitas:**

#### 1. Crear `server.js` en la raíz:

\`\`\`javascript
const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos de Angular
app.use(express.static(path.join(__dirname, 'dist/game-store/browser')));

// Todas las rutas redirigen a index.html (para SPA)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/game-store/browser/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Frontend corriendo en puerto \${PORT}\`);
});
\`\`\`

#### 2. Instalar Express:

\`\`\`bash
npm install express
\`\`\`

#### 3. Actualizar `package.json`:

\`\`\`json
{
  "scripts": {
    "start": "node server.js",
    "build": "ng build --configuration production",
    "railway": "npm run build && npm start"
  }
}
\`\`\`

#### 4. En Railway:

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

---

## 📝 Checklist Pre-Deploy

- [ ] URL del backend actualizada en `environment.ts`
- [ ] Código en GitHub
- [ ] Build funciona localmente: `npm run build`
- [ ] No hay errores de compilación

---

## 🔗 Conexión Backend-Frontend

Después del deploy:

1. **Frontend desplegado en:** `https://tu-frontend.vercel.app`
2. **Backend desplegado en:** `https://tu-backend.railway.app`

3. **Actualizar variable en Railway:**
   \`\`\`
   FRONTEND_URL=https://tu-frontend.vercel.app
   \`\`\`

4. **Probar la conexión:**
   - Abre el frontend
   - Verifica que las peticiones al backend funcionen
   - Revisa la consola del navegador (F12)

---

## 🎉 ¡Recomendación Final!

**USA VERCEL** - Es gratis, rápido, y está hecho para esto. Railway es mejor para tu backend.

- **Backend:** Railway
- **Frontend:** Vercel

Así aprovechas lo mejor de cada plataforma y no gastas el crédito de Railway.
