# Identificador de Billetes Colombianos 💵

Una aplicación web progresiva (PWA) accesible diseñada específicamente para personas con discapacidad visual. Utiliza inteligencia artificial para identificar billetes colombianos mediante la cámara del dispositivo y proporciona retroalimentación por voz.

## 🎯 Características de Accesibilidad

- � **Síntesis de Voz Automática**: Todos los resultados se leen en voz alta automáticamente
- 👆 **Botón Grande Central**: Interfaz simplificada con un botón grande en el centro de la pantalla
- 📹 **Cámara Automática**: Se activa automáticamente sin necesidad de permisos previos
- 📳 **Retroalimentación Táctil**: Vibración al presionar el botón (en dispositivos compatibles)
- 🗣️ **Instrucciones Habladas**: Guía paso a paso en español colombiano
- ♿ **Diseño Accesible**: Optimizado para personas con discapacidad visual

## � Billetes Colombianos Soportados

La app identifica todos los billetes colombianos actuales:

| Denominación | Color Principal | Características |
|--------------|----------------|-----------------|
| $100,000 | Verde | Billete de cien mil pesos |
| $50,000 | Morado/Violeta | Billete de cincuenta mil pesos |
| $20,000 | Naranja | Billete de veinte mil pesos |
| $10,000 | Rojo Suave | Billete de diez mil pesos |
| $5,000 | Café/Marrón | Billete de cinco mil pesos |
| $2,000 | Azul Claro | Billete de dos mil pesos |

## � Características Técnicas

- **React 18** - Framework de UI
- **Vite** - Build tool y dev server
- **Azure AI Inference** - Análisis de imágenes con IA
- **Web Speech API** - Síntesis de voz nativa
- **MediaDevices API** - Acceso a la cámara
- **Vibration API** - Retroalimentación táctil

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Token de GitHub con acceso a GitHub Models

## 🔧 Instalación

1. Clona el repositorio o usa los archivos proporcionados

2. Instala las dependencias:
```bash
npm install
```

3. El archivo `.env` ya está configurado con el token:
```env
VITE_GITHUB_TOKEN=tu_token_aqui
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

5. Abre tu navegador en `http://localhost:5173`

## 📱 Uso desde Móvil

Para probar en tu celular en la misma red local:

1. Encuentra tu IP local:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`

2. Accede desde tu móvil a:
   ```
   http://TU_IP:5173
   ```

3. El navegador pedirá permisos para acceder a la cámara - acepta los permisos

## 🚀 Despliegue

Para construir la versión de producción:

```bash
npm run build
```

Los archivos estarán en la carpeta `dist/` listos para desplegar en:
- Vercel
- Netlify
- GitHub Pages
- Cualquier hosting estático

### Variables de Entorno en Producción

Asegúrate de configurar la variable de entorno `VITE_GITHUB_TOKEN` en tu plataforma de hosting.

**⚠️ IMPORTANTE DE SEGURIDAD:**
- No commitees el archivo `.env` al repositorio
- El `.gitignore` ya está configurado para ignorarlo
- En producción, usa variables de entorno del hosting
- Considera usar un backend proxy para ocultar el token

## 📖 Cómo Usar (Para Personas con Discapacidad Visual)

1. **Abrir la Aplicación**
   - Al abrir, escucharás: "Bienvenido al identificador de billetes colombianos"
   - La cámara se activa automáticamente

2. **Colocar el Billete**
   - Coloca el billete frente a la cámara trasera del celular
   - Asegúrate de tener buena iluminación
   - El billete debe estar completamente visible

3. **Capturar**
   - Toca el botón grande en el centro de la pantalla
   - Escucharás: "Foto capturada, analizando billete"
   - El teléfono vibrará (si está disponible)

4. **Escuchar el Resultado**
   - Si es un billete: "Billete de [denominación] pesos colombianos"
   - Si no es un billete: Recibirás instrucciones de cómo mejorar la foto
   - El resultado se lee automáticamente en voz alta

5. **Repetir**
   - Después de 5 segundos, puedes capturar otro billete
   - Escucharás: "Listo para capturar otro billete"

## �️ Mensajes de Voz

La aplicación proporciona los siguientes mensajes hablados:

- **Bienvenida**: Al iniciar la app
- **Confirmación**: Al capturar la foto
- **Resultado**: Denominación del billete identificado
- **Instrucciones**: Si no se detecta un billete o la foto está mal tomada
- **Preparación**: Cuando está lista para una nueva captura
- **Errores**: Si hay algún problema técnico

## 🔒 Seguridad

- El token está en `.env` y no se commitea
- `.gitignore` protege archivos sensibles
- Se recomienda usar un backend proxy en producción

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o PR.

---

Desarrollado con ❤️ usando React y Azure AI
