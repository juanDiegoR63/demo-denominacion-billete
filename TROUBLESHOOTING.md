# 🔧 Solución de Problemas - Cámara

## ❌ Problema: La cámara no se abre

### Soluciones paso a paso:

### 1️⃣ **Verificar Permisos del Navegador**

#### En Chrome/Edge (PC):
1. Haz clic en el 🔒 o ⓘ en la barra de direcciones
2. Busca "Cámara" en los permisos
3. Selecciona "Permitir"
4. Recarga la página (F5)

#### En Chrome (Android):
1. Toca los tres puntos (⋮) en Chrome
2. Ve a "Configuración"
3. Toca "Configuración del sitio"
4. Toca "Cámara"
5. Asegúrate de que esté en "Permitir"

#### En Safari (iPhone):
1. Ve a Ajustes → Safari → Cámara
2. Selecciona "Preguntar" o "Permitir"
3. También revisa Ajustes → [Nombre de la app] → Cámara

### 2️⃣ **Usar HTTPS o localhost**

⚠️ **Importante**: Los navegadores modernos **solo permiten acceso a la cámara en**:
- `https://` (conexión segura)
- `http://localhost` o `http://127.0.0.1`

Si estás probando desde tu celular usando tu IP local (`http://192.168.x.x`), necesitas HTTPS.

#### Solución para desarrollo local con HTTPS:

```bash
# Instalar el paquete para servidor HTTPS local
npm install -D @vitejs/plugin-basic-ssl

# O usar ngrok (recomendado para pruebas móviles)
npm install -g ngrok
ngrok http 5173
```

Luego actualiza `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    https: true,
    host: true
  }
})
```

### 3️⃣ **Probar con archivo de test**

Abre en tu navegador:
```
http://localhost:5173/test-camera.html
```

Este archivo te mostrará:
- Si tu navegador soporta getUserMedia
- Qué error específico está ocurriendo
- Información de tu cámara

### 4️⃣ **Verificar que ninguna otra app use la cámara**

- Cierra Zoom, Teams, Skype, etc.
- En Windows: Verifica en Administrador de tareas
- Reinicia el navegador

### 5️⃣ **Navegadores Compatibles**

✅ **Compatibles:**
- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 79+

❌ **No compatibles:**
- Internet Explorer
- Navegadores muy antiguos

### 6️⃣ **Consola de Desarrollador**

Abre la consola (F12) y busca errores:

**Error común:** `NotAllowedError`
- **Causa**: Permisos denegados
- **Solución**: Revisar paso 1️⃣

**Error común:** `NotFoundError`
- **Causa**: No se encuentra cámara
- **Solución**: Conectar una cámara o verificar drivers

**Error común:** `NotReadableError`
- **Causa**: Cámara en uso por otra app
- **Solución**: Cerrar otras aplicaciones

### 7️⃣ **Para pruebas en celular (desarrollo)**

#### Opción A: Usar ngrok (Recomendado)

```bash
# Instalar ngrok
npm install -g ngrok

# En una terminal, ejecuta tu app
npm run dev

# En otra terminal
ngrok http 5173
```

Ngrok te dará una URL HTTPS como: `https://abc123.ngrok.io`
Abre esa URL en tu celular.

#### Opción B: Certificado SSL local

```bash
npm install -D @vitejs/plugin-basic-ssl
```

Actualiza `vite.config.js` como se mostró arriba y accede con:
```
https://TU_IP:5173
```

(Acepta el certificado no seguro en el navegador)

### 8️⃣ **Verificación Rápida**

Ejecuta este código en la consola del navegador (F12):

```javascript
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('✅ Cámara funciona!', stream);
    stream.getTracks().forEach(t => t.stop());
  })
  .catch(err => console.error('❌ Error:', err));
```

## 📱 Prueba desde móvil

### Método 1: ngrok (Más fácil)
```bash
ngrok http 5173
# Usa la URL HTTPS que te da
```

### Método 2: Vercel/Netlify (Producción)
```bash
npm run build
# Despliega la carpeta dist/
```

## 🆘 ¿Aún no funciona?

1. Verifica que estés en HTTPS o localhost
2. Revisa los permisos del sistema operativo (no solo del navegador)
3. Intenta en modo incógnito
4. Prueba con otro navegador
5. Reinicia el dispositivo

## 📞 Contacto

Si sigues teniendo problemas, abre la consola (F12), copia el error completo y compártelo.
