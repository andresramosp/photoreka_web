import pLimit from "p-limit";

// Rate limiting específico para texturas Three.js para evitar 429s de Cloudflare
const textureLimit = pLimit(20); // Max 3 texturas concurrentes

/**
 * Carga una textura Three.js con rate limiting
 * @param {THREE.TextureLoader} loader - Loader de Three.js
 * @param {string} url - URL de la textura
 * @returns {Promise<THREE.Texture>}
 */
export const loadTextureWithLimit = (loader, url) => {
  return textureLimit(() => {
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        // onLoad
        (texture) => {
          texture.colorSpace = "srgb";
          resolve(texture);
        },
        // onProgress
        undefined,
        // onError
        (error) => {
          console.warn(`Failed to load texture: ${url}`, error);
          reject(error);
        }
      );
    });
  });
};
