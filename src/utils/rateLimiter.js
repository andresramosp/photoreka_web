import pLimit from "p-limit";

// Rate limiting específico para texturas Three.js para evitar 429s de Cloudflare
// Ajustado a concurrencia baja para ambientes con throttling agresivo.
// Si se observa subutilización del ancho de banda se puede subir gradualmente (4 -> 6 -> 8)
const textureLimit = pLimit(25);

// Parámetros de retry exponencial
const MAX_RETRIES = 4; // Total intentos (1 inicial + 3 reintentos)
const BASE_DELAY_MS = 250; // Delay inicial
const MAX_DELAY_MS = 2000; // Tope

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function calcBackoffDelay(attempt) {
  // attempt comienza en 1 (primer fallo) => BASE * 2^(attempt-1) + jitter
  const exp = BASE_DELAY_MS * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 150; // jitter para desincronizar
  return Math.min(exp + jitter, MAX_DELAY_MS);
}

/**
 * Carga una textura Three.js con rate limiting + retries exponenciales en 429 / errores de red.
 * No reintenta errores claramente definitivos (404, 401, 403).
 * @param {THREE.TextureLoader} loader - Loader de Three.js
 * @param {string} url - URL de la textura
 * @returns {Promise<THREE.Texture>}
 */
export const loadTextureWithLimit = (loader, url) => {
  const attemptLoad = (attempt = 0) => {
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (texture) => {
          texture.colorSpace = "srgb";
          resolve(texture);
        },
        undefined,
        async (error) => {
          // Extraemos código HTTP si existe (Three.js a veces envuelve en Error genérico)
          const status = error?.target?.status; // XHR status
          const isDefinitive = [401, 403, 404].includes(status);
          const shouldRetry = !isDefinitive && attempt < MAX_RETRIES;

          // Cloudflare 429 o errores de red genéricos => retry
          if (shouldRetry) {
            const delay = calcBackoffDelay(attempt + 1);
            console.warn(
              `[TextureLoader][retry ${attempt + 1}] ${url} status:${
                status ?? "n/a"
              } esperando ${Math.round(delay)}ms`
            );
            await sleep(delay);
            attemptLoad(attempt + 1)
              .then(resolve)
              .catch(reject);
          } else {
            console.warn(`Failed to load texture (final): ${url}`, error);
            reject(error);
          }
        }
      );
    });
  };

  return textureLimit(() => attemptLoad(0));
};
