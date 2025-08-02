// composables/useGooglePhotos.js
import { ref, computed, onMounted } from "vue";
import { useMessage } from "naive-ui";
import { GOOGLE_CONFIG } from "@/config/google.js";

export function useGooglePhotos() {
  const message = useMessage();

  // Estado de Google Photos
  const isGoogleAuthorized = ref(false);
  const googlePhotos = ref([]);
  const selectedGooglePhotos = ref([]);
  const showGoogleSelector = ref(false);
  const isLoadingGooglePhotos = ref(false);
  const isGoogleApiLoaded = ref(false);
  const hasMorePhotos = ref(false); // No hay paginación en Picker API

  // Computed para fotos seleccionadas
  const selectedGooglePhotosCount = computed(
    () => selectedGooglePhotos.value.length
  );

  // Función para cargar la API de Google Photos Picker
  function loadGooglePhotosPickerApi() {
    return new Promise((resolve, reject) => {
      if (isGoogleApiLoaded.value) {
        resolve();
        return;
      }

      // Cargar Google API script si no está cargado
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = () => {
          window.gapi.load("picker", {
            callback: () => {
              isGoogleApiLoaded.value = true;
              resolve();
            },
            onerror: reject,
          });
        };
        script.onerror = reject;
        document.head.appendChild(script);
      } else {
        window.gapi.load("picker", {
          callback: () => {
            isGoogleApiLoaded.value = true;
            resolve();
          },
          onerror: reject,
        });
      }
    });
  }

  // Función para iniciar la autorización de Google Photos usando Picker API
  async function triggerGooglePhotos() {
    try {
      isLoadingGooglePhotos.value = true;

      // Cargar la API de Google Picker
      await loadGooglePhotosPickerApi();

      // Crear y mostrar el picker
      const picker = new google.picker.PickerBuilder()
        .addView(google.picker.ViewId.PHOTOS)
        .setOAuthToken(await getGoogleAuthToken())
        .setDeveloperKey(GOOGLE_CONFIG.API_KEY)
        .setCallback(handlePickerCallback)
        .setSize(1051, 650)
        .build();

      picker.setVisible(true);
    } catch (error) {
      console.error("❌ Error initiating Google Photos picker:", error);
      message.error("Failed to open Google Photos picker");
      isLoadingGooglePhotos.value = false;
    }
  }

  // Función para obtener el token de autenticación de Google
  async function getGoogleAuthToken() {
    return new Promise((resolve, reject) => {
      window.gapi.load("auth2", () => {
        const authInstance = window.gapi.auth2.init({
          client_id: GOOGLE_CONFIG.CLIENT_ID,
        });

        authInstance
          .signIn()
          .then((user) => {
            const authResponse = user.getAuthResponse();
            isGoogleAuthorized.value = true;
            resolve(authResponse.access_token);
          })
          .catch(reject);
      });
    });
  }

  // Función para manejar la respuesta del picker
  function handlePickerCallback(data) {
    isLoadingGooglePhotos.value = false;

    if (data.action === google.picker.Action.PICKED) {
      const docs = data.docs;

      // Transformar los documentos seleccionados al formato esperado
      const photos = docs.map((doc) => ({
        id: doc.id,
        filename: doc.name,
        url: doc.url,
        thumbnailUrl: doc.thumbnails?.[0]?.url || doc.url,
        downloadUrl: doc.downloadUrl || doc.url,
        mimeType: doc.mimeType,
        width: doc.imageMediaMetadata?.width,
        height: doc.imageMediaMetadata?.height,
        size: doc.sizeBytes,
      }));

      googlePhotos.value = photos;
      selectedGooglePhotos.value = [...photos]; // Auto-seleccionar todas las fotos elegidas

      console.log("✅ Fotos seleccionadas desde Google Photos:", photos.length);
      message.success(`Selected ${photos.length} photos from Google Photos`);

      // Mostrar el selector para revisión (opcional, ya que ya están seleccionadas)
      if (photos.length > 0) {
        showGoogleSelector.value = true;
      }
    } else if (data.action === google.picker.Action.CANCEL) {
      console.log("⚠️ Usuario canceló la selección de Google Photos");
    }
  }

  // Función legacy - mantener para compatibilidad pero no usar
  async function handleGoogleCallback(code) {
    console.warn("⚠️ handleGoogleCallback is deprecated with Picker API");
    return false;
  }

  // Función legacy - mantener para compatibilidad pero no usar
  async function handleAccessToken(accessToken) {
    console.warn("⚠️ handleAccessToken is deprecated with Picker API");
    return false;
  }

  // Función legacy - ahora las fotos se obtienen directamente del picker
  async function fetchGooglePhotos(loadMore = false) {
    console.warn(
      "⚠️ fetchGooglePhotos is deprecated with Picker API - use triggerGooglePhotos instead"
    );
    await triggerGooglePhotos();
  }

  // Función para cargar más fotos (no aplicable en Picker API)
  async function loadMoreGooglePhotos() {
    console.warn("⚠️ Pagination not available with Google Photos Picker API");
    message.info("All available photos are already loaded");
    return;
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
    hasMorePhotos.value = false;
  }

  // Función para preparar las fotos seleccionadas para upload
  function prepareSelectedPhotosForUpload() {
    return selectedGooglePhotos.value.map((photo) => ({
      id: photo.id,
      url: photo.downloadUrl || photo.url,
      name: photo.filename || `google-photo-${photo.id}.jpg`,
      type: "google", // Indicar que es de Google Photos
      mimeType: photo.mimeType,
      size: photo.size,
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

    // Funciones principales
    triggerGooglePhotos,
    toggleGooglePhotoSelection,
    selectAllGooglePhotos,
    deselectAllGooglePhotos,
    isGooglePhotoSelected,
    closeGoogleSelector,
    prepareSelectedPhotosForUpload,

    // Funciones legacy para compatibilidad
    handleGoogleCallback,
    handleAccessToken,
    fetchGooglePhotos,
    loadMoreGooglePhotos,
  };
}
