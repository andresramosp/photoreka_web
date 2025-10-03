/**
 * Composable for creating LOD textures at multiple resolutions
 * Returns textures ready to use with THREE.LOD.addLevel()
 */

import * as THREE from "three";

/**
 * Resize image to specific dimensions maintaining aspect ratio
 * @param {HTMLImageElement} imageElement - Source image
 * @param {number} targetSize - Target size for longest dimension
 * @returns {HTMLCanvasElement} Resized canvas
 */
function resizeImageToSize(imageElement, targetSize) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", {
    alpha: true,
    willReadFrequently: false,
  });

  const aspectRatio = imageElement.width / imageElement.height;
  let targetWidth, targetHeight;

  if (imageElement.width > imageElement.height) {
    targetWidth = Math.min(imageElement.width, targetSize);
    targetHeight = targetWidth / aspectRatio;
  } else {
    targetHeight = Math.min(imageElement.height, targetSize);
    targetWidth = targetHeight * aspectRatio;
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(imageElement, 0, 0, targetWidth, targetHeight);

  return canvas;
}

/**
 * Create THREE.js texture from canvas
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @returns {THREE.CanvasTexture} THREE.js texture
 */
function createTextureFromCanvas(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Create THREE.js material with texture and optional opacity
 * @param {THREE.Texture} texture - Texture to apply
 * @param {number} opacity - Material opacity (0.0 to 1.0)
 * @returns {THREE.MeshBasicMaterial} Material with texture
 */
function createMaterialWithTexture(texture, opacity = 1.0) {
  return new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: opacity,
  });
}

/**
 * Create textures at multiple resolutions for LOD with pre-established opacity
 * @param {HTMLImageElement} imageElement - Source image
 * @param {Array} sizes - Array of {size, distance, opacity} objects
 * @returns {Array} Array of {material, texture, canvas, distance} objects
 */
export function createLODTextures(imageElement, sizes) {
  if (!imageElement) return [];

  return sizes
    .map(({ size, distance, opacity = 1.0 }) => {
      try {
        const canvas = resizeImageToSize(imageElement, size);
        const texture = createTextureFromCanvas(canvas);
        const material = createMaterialWithTexture(texture, opacity);

        return { material, texture, canvas, distance };
      } catch (error) {
        console.error(`Error creating LOD texture at size ${size}:`, error);
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Dispose LOD textures and materials
 * @param {Array} lodTextures - Array of {material, texture} objects
 */
export function disposeLODTextures(lodTextures) {
  if (!lodTextures) return;

  lodTextures.forEach(({ material, texture, canvas }) => {
    if (texture) texture.dispose();
    if (material) material.dispose();
    canvas = null;
  });
}
