# 🚀 CONFIGURACIÓN DE GEMINI API - ESCALA DIGITAL

## 📋 PASOS RÁPIDOS PARA OBTENER TU API KEY

### 1. 🌐 Acceder a Google AI Studio
```
https://makersuite.google.com/app/apikey
```

### 2. 🔐 Iniciar Sesión
- Usa tu cuenta de Google (Gmail, Workspace, etc.)
- Acepta los términos de servicio si es necesario

### 3. ⚡ Crear API Key
- Haz clic en el botón **"Create API Key"** (azul)
- Asigna un nombre descriptivo: `Escala Digital App`
- Haz clic en **"Create"**

### 4. 📋 Copiar API Key
- Tu API key se verá así: `AIzaSyD...` (larga cadena)
- **CÓPIALA COMPLETAMENTE** - es única e irrecuperable

### 5. 🔧 Configurar en la App
## 5. Configurar en el servidor
1. Crea `server/gemini-proxy/.env` a partir de `server/gemini-proxy/.env.example`.
2. Define `GEMINI_API_KEY` con la clave generada.
3. Mantén esa clave solo en el servidor. No la agregues a `src/`, a archivos versionados ni a variables `REACT_APP_*`.
4. Para desarrollo local, inicia el proxy junto con la app con `npm run start:dev`.

## ⚠️ IMPORTANTE

- **NO compartas tu API key** con nadie
- **NO la subas a repositorios públicos**
- **GUÁRDALA en lugar seguro**
- Cada API key es **única e irrepetible**

## 🎯 Verificación

Comprueba que `http://localhost:3001/health` responda y prueba la generación desde la app. En producción, despliega el proxy como servicio backend y configura `GEMINI_API_KEY` en el gestor de secretos del proveedor.

## 🆘 Soporte

Si tienes problemas:
1. Verifica que el proxy responda en `/health`.
2. Revisa los logs del servidor y la cuota de Google AI Studio.
3. Confirma que `GEMINI_API_KEY` está configurada en el entorno del servidor, no en el bundle frontend.

## 🔄 Si la key no funciona

- Genera una **NUEVA API KEY** (no intentes reusar)
- La anterior puede estar expirada o con problemas
- Cada key es completamente nueva

---

**¡Listo! Tu Escala Digital App ahora tiene IA de Google Gemini funcionando! 🎉**
