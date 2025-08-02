// composables/useGooglePhotos.js
import { ref, computed } from "vue";
import { api } from "@/utils/axios";
import { useMessage } from "naive-ui";

export function useGooglePhotos() {
  const message = useMessage();

  // Estado de Google Photos
  const isGoogleAuthorized = ref(false);
  const googlePhotos = ref([]);
  const selectedGooglePhotos = ref([]);
  const showGoogleSelector = ref(false);
  const isLoadingGooglePhotos = ref(false);
  const googleToken = ref(null);
  const nextPageToken = ref(null);
  const hasMorePhotos = ref(true);

  // Computed para fotos seleccionadas
  const selectedGooglePhotosCount = computed(
    () => selectedGooglePhotos.value.length
  );

  // Función para iniciar la autorización de Google Photos
  async function triggerGooglePhotos() {
    try {
      // Llamar al endpoint de sync que nos dará la URL de autorización
      const response = await api.get("/api/catalog/google/sync");
      const { authUrl } = response.data;

      // Redirigir a la URL de autorización de Google
      window.location.href = authUrl;
    } catch (error) {
      console.error("❌ Error initiating Google Photos auth:", error);
      message.error("Failed to initiate Google Photos authorization");
    }
  }

  // Función para manejar el callback de Google OAuth (se llamaría desde una ruta)
  async function handleGoogleCallback(code) {
    try {
      // El callback solo nos da el accessToken, no las fotos
      const response = await api.get(
        `/api/catalog/google/callback?code=${code}`
      );
      const { accessToken } = response.data;
      googleToken.value = accessToken;
      isGoogleAuthorized.value = true;

      // Después del callback, obtener las fotos por separado
      await fetchGooglePhotos();

      message.success("Google Photos authorized successfully!");
      return true;
    } catch (error) {
      console.error("❌ Error handling Google callback:", error);
      message.error("Failed to authorize Google Photos");
      return false;
    }
  }

  // Función para manejar el access_token directamente desde la URL
  async function handleAccessToken(accessToken) {
    try {
      console.log(
        "🔑 handleAccessToken llamada con token:",
        accessToken.substring(0, 20) + "..."
      );
      googleToken.value = accessToken;
      isGoogleAuthorized.value = true;
      console.log(
        "✅ Estado actualizado - googleToken y isGoogleAuthorized configurados"
      );

      // Obtener las fotos usando el access token
      console.log("📞 Llamando a fetchGooglePhotos...");
      await fetchGooglePhotos();

      console.log("🏁 handleAccessToken completado exitosamente");
      message.success("Google Photos authorized successfully!");
      return true;
    } catch (error) {
      console.error("❌ Error handling access token:", error);
      console.error("❌ Stack trace:", error.stack);
      message.error("Failed to authorize Google Photos");
      return false;
    }
  }

  // Función para obtener fotos de Google Photos usando el accessToken
  async function fetchGooglePhotos(loadMore = false) {
    if (!googleToken.value) {
      console.log("⚠️  No hay token disponible, iniciando autorización...");
      await triggerGooglePhotos();
      return;
    }

    console.log("📸 Obteniendo fotos de Google Photos...");
    console.log("🔑 Token disponible:", googleToken.value ? "Sí" : "No");

    if (!loadMore) {
      isLoadingGooglePhotos.value = true;
      // Reset pagination when loading fresh data
      nextPageToken.value = null;
      hasMorePhotos.value = true;
    }

    try {
      // Construir URL con paginación
      let url =
        "https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=50";
      if (loadMore && nextPageToken.value) {
        url += `&pageToken=${nextPageToken.value}`;
      }

      console.log("🌐 Haciendo petición directa a Google Photos API...");

      // Llamada directa a Google Photos API para obtener media items
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${googleToken.value}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Google API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Respuesta recibida de Google Photos API:", data);

      // Transformar los datos de Google Photos al formato esperado
      const photos = (data.mediaItems || []).map((item) => ({
        id: item.id,
        filename: item.filename,
        baseUrl: item.baseUrl,
        thumbnailUrl: `${item.baseUrl}=w300-h300-c`,
        downloadUrl: `${item.baseUrl}=d`,
        mimeType: item.mimeType,
        creationTime: item.mediaMetadata?.creationTime,
        width: item.mediaMetadata?.width,
        height: item.mediaMetadata?.height,
      }));

      // Actualizar paginación
      nextPageToken.value = data.nextPageToken || null;
      hasMorePhotos.value = !!data.nextPageToken;

      if (loadMore) {
        // Agregar nuevas fotos al array existente
        googlePhotos.value = [...googlePhotos.value, ...photos];
      } else {
        // Reemplazar todas las fotos
        googlePhotos.value = photos;
      }

      console.log("📊 Número de fotos obtenidas:", photos.length);
      console.log("📊 Total de fotos:", googlePhotos.value.length);
      console.log("📄 Hay más fotos:", hasMorePhotos.value);

      if (!loadMore) {
        console.log("🚀 Estableciendo showGoogleSelector = true...");
        showGoogleSelector.value = true;
        console.log(
          "✅ showGoogleSelector establecido:",
          showGoogleSelector.value
        );
      }

      if (googlePhotos.value.length === 0) {
        console.log("⚠️ No se encontraron fotos, mostrando warning...");
        message.warning("No photos found in your Google Photos library");
      } else {
        console.log("🎉 Todo listo, modal debería abrirse!");
      }
    } catch (error) {
      console.error("❌ Error fetching Google Photos:", error);
      console.error("❌ Error completo:", error.message);
      message.error("Failed to fetch Google Photos");

      // Si falla la autorización (401 o 403), resetear estado
      if (error.message.includes("401") || error.message.includes("403")) {
        console.log("🔄 Token expirado o sin permisos, reseteando estado...");
        isGoogleAuthorized.value = false;
        googleToken.value = null;
      }
    } finally {
      if (!loadMore) {
        console.log(
          "🏁 Finalizando fetchGooglePhotos, isLoadingGooglePhotos = false"
        );
        isLoadingGooglePhotos.value = false;
      }
    }
  }

  // Función para cargar más fotos (paginación)
  async function loadMoreGooglePhotos() {
    if (!hasMorePhotos.value || isLoadingGooglePhotos.value) {
      return;
    }

    await fetchGooglePhotos(true);
  }

  // Función para alternar selección de foto de Google
  function toggleGooglePhotoSelection(photo) {
    const index = selectedGooglePhotos.value.findIndex(
      (p) => p.id === photo.id
    );
    if (index > -1) {
      selectedGooglePhotos.value.splice(index, 1);
    } else {
      selectedGooglePhotos.value.push(photo);
    }
  }

  // Función para seleccionar todas las fotos de Google
  function selectAllGooglePhotos() {
    selectedGooglePhotos.value = [...googlePhotos.value];
  }

  // Función para deseleccionar todas las fotos de Google
  function deselectAllGooglePhotos() {
    selectedGooglePhotos.value = [];
  }

  // Función para verificar si una foto está seleccionada
  function isGooglePhotoSelected(photoId) {
    return selectedGooglePhotos.value.some((p) => p.id === photoId);
  }

  // Función para cerrar el selector de Google Photos
  function closeGoogleSelector() {
    showGoogleSelector.value = false;
    selectedGooglePhotos.value = [];
    // Reset pagination when closing
    nextPageToken.value = null;
    hasMorePhotos.value = true;
  }

  // Función para preparar las fotos seleccionadas para upload
  function prepareSelectedPhotosForUpload() {
    return selectedGooglePhotos.value.map((photo) => ({
      id: photo.id,
      url: photo.downloadUrl || `${photo.baseUrl}=d`, // URL de descarga de Google Photos
      name: photo.filename || `google-photo-${photo.id}.jpg`,
      token: googleToken.value,
      type: "google", // Indicar que es de Google Photos
      mimeType: photo.mimeType,
    }));
  }

  return {
    // Estado
    isGoogleAuthorized,
    googlePhotos,
    selectedGooglePhotos,
    showGoogleSelector,
    isLoadingGooglePhotos,
    selectedGooglePhotosCount,
    hasMorePhotos,

    // Funciones
    triggerGooglePhotos,
    handleGoogleCallback,
    handleAccessToken,
    fetchGooglePhotos,
    loadMoreGooglePhotos,
    toggleGooglePhotoSelection,
    selectAllGooglePhotos,
    deselectAllGooglePhotos,
    isGooglePhotoSelected,
    closeGoogleSelector,
    prepareSelectedPhotosForUpload,
  };
}
