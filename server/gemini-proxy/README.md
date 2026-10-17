GEMINI_API_KEY=your_gemini_api_key

# Mantén el archivo .env fuera del control de versiones. Configura aquí la clave del servidor y nunca la incluyas en el bundle del frontend.

PORT=3001Ejecutar el proxy de Gemini (servidor local)

Objetivo:
- Mantener tu API Key de Gemini en el servidor (no exponerla en el cliente).
- Proveer un endpoint POST `/api/gemini` que acepta `{ prompt }` y devuelve `{ text }`.

Pasos rápidos:

1) Ir a la carpeta del proxy:

```powershell
cd server\gemini-proxy
```

2) Instalar dependencias (usa el package.json raíz si prefieres). Si no quieres crear package.json aquí, instala globalmente en la raíz:

```powershell
npm install express body-parser @google/generative-ai dotenv
```

3) Crear `.env` basado en `.env.example` y poner tu key:

```powershell
copy .env.example .env
# editar .env y poner GEMINI_API_KEY
```

4) Ejecutar el servidor:

```powershell
node index.js
```

5) En desarrollo con CRA, añade en `package.json` del proyecto React:

```json
"proxy": "http://localhost:3001"
```

Esto hace que las llamadas a `/api/gemini` desde el cliente sean redireccionadas al proxy local.

Uso desde el cliente:
- Hacer POST a `/api/gemini` con body `{ prompt: string }`.
- El servidor devuelve `{ text: string }` con la respuesta de Gemini.

## Gemini Proxy

Proxy local para llamadas a la API generativa de Google (Gemini). Mantiene tu clave `GEMINI_API_KEY` en el servidor y expone un endpoint POST `/api/gemini` que acepta `{ prompt }` y devuelve `{ text, parsed? }`.

### Requisitos
- Node 16+
- Crear un archivo `.env` con `GEMINI_API_KEY=tu_api_key` y opcional `GEMINI_MODEL` y `PORT`.

### Instalación y uso

```powershell
cd server\gemini-proxy
npm install
copy .env.example .env
# editar .env y poner GEMINI_API_KEY
npm start
```

En desarrollo la app React usa `proxy` en el `package.json` raíz para redirigir `/api/gemini` a `http://localhost:3001`.

### Rutas importantes
- `POST /api/gemini` body `{ prompt: string }` -> response `{ text: string, parsed?: any }`
- `__LOCAL_TEST__` en el prompt devuelve una respuesta de prueba sin usar la API (útil para desarrollar sin key).

### Seguridad
- No subas el archivo `.env` al repositorio.
- Para producción, despliega el proxy en un entorno seguro (serverless o backend con variables protegidas).

### Notas
- Si el modelo configurado en `GEMINI_MODEL` no está disponible, el proxy devolverá un error 500. En el cliente se debe manejar ese caso (ya hay un fallback en `src/services/gemini.ts`).

