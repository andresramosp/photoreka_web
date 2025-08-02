# Google Photos Picker API Integration

Este proyecto ha sido actualizado para usar la nueva **Google Photos Picker API** en lugar de la antigua Google Photos Library API.

## Configuración requerida

### 1. Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Google Picker API
   - Google Photos Library API (solo para metadatos)

### 2. Crear credenciales

1. Ve a la sección "Credenciales" en Google Cloud Console
2. Crea una **Clave de API**:

   - Clic en "Crear credenciales" > "Clave de API"
   - Copia la clave generada

3. Crea un **ID de cliente OAuth 2.0**:
   - Clic en "Crear credenciales" > "ID de cliente de OAuth 2.0"
   - Tipo de aplicación: "Aplicación web"
   - Agrega tu dominio a "Orígenes de JavaScript autorizados"
   - Copia el ID de cliente generado

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VUE_APP_GOOGLE_API_KEY=tu_api_key_aqui
VUE_APP_GOOGLE_CLIENT_ID=tu_client_id_aqui
```

O actualiza directamente el archivo `src/config/google.js` con tus credenciales.

## Cambios principales

### ✅ Ventajas de la nueva implementación:

- **Sin backend requerido**: Todo se maneja desde el frontend
- **Más seguro**: No necesitas manejar tokens en el servidor
- **Interfaz nativa**: Usa el picker oficial de Google
- **Mejor UX**: Selección directa desde la interfaz de Google Photos

### 🔄 Cambios en la funcionalidad:

- **Sin paginación**: El picker permite seleccionar fotos directamente, no hay "load more"
- **Selección inmediata**: Las fotos seleccionadas ya vienen marcadas
- **Sin callbacks de URL**: No necesita manejar redirects o tokens en la URL

## Archivos modificados

1. **`src/composables/useGooglePhotos.js`**: Completamente reescrito para usar Picker API
2. **`src/components/GooglePhotosSelector.vue`**: Removida funcionalidad de paginación
3. **`src/components/photo-hub/LightboxPhotos.vue`**: Simplificado, removido manejo de callbacks
4. **`src/config/google.js`**: Nuevo archivo de configuración (CREAR)

## Uso

```javascript
// En tu componente
const { triggerGooglePhotos, selectedGooglePhotos } = useGooglePhotos();

// Para abrir el selector
await triggerGooglePhotos();

// Las fotos seleccionadas estarán disponibles en selectedGooglePhotos
```

## Troubleshooting

### Error: "API key not valid"

- Verifica que la API key sea correcta en `src/config/google.js`
- Asegúrate de que Google Picker API esté habilitada

### Error: "Invalid client ID"

- Verifica que el Client ID sea correcto
- Asegúrate de que tu dominio esté en "Orígenes de JavaScript autorizados"

### El picker no se abre

- Revisa la consola del navegador para errores
- Verifica que las credenciales estén configuradas correctamente
- Asegúrate de que las APIs estén habilitadas en Google Cloud Console

## Documentación oficial

- [Google Picker API](https://developers.google.com/picker/docs)
- [Google Photos APIs](https://developers.google.com/photos)
