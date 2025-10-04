/**
 * LOD (Level of Detail) utilities for 3D photo viewer
 * Uses THREE.js native LOD system with 3 quality levels
 */

// Base maximum distance for 2000+ photos beyond which photos are completely hidden
// This is NOT an LOD level - photos beyond this distance consume ZERO resources
const BASE_MAX_DISTANCE_VISIBLE = 180;

// LOD Configuration - Base configuration for 2000+ photos
// Texture sizes and opacity are fixed, distances are dynamically adjusted based on visible photo count
// Opacity is pre-established per LOD level for better performance
const multiplier = 1; // Adjust this multiplier to scale all distances uniformly if needed
export const LOD_LEVELS = {
  ULTRA: {
    size: 768 * multiplier,
    baseDistance: 0, // Base distance for 2000+ photos
    opacity: 1.0, // Fully visible - very close photos
  },
  HIGH: {
    size: 512 * multiplier,
    baseDistance: 5, // Base distance for 2000+ photos
    opacity: 1.0, // Fully visible - close photos
  },
  MEDIUM: {
    size: 128 * multiplier,
    baseDistance: 15, // Base distance for 2000+ photos
    opacity: 0.85, // Slightly faded - medium distance
  },
  LOW: {
    size: 56 * multiplier,
    baseDistance: 60, // Base distance for 2000+ photos
    opacity: 0.5, // More faded - far distance
  },
  VERY_LOW: {
    size: 4 * multiplier,
    baseDistance: 100, // Base distance for 2000+ photos (very distant)
    opacity: 0.3, // Heavily faded - very far distance
  },
};

// Reference photo count for base configuration
const BASE_PHOTO_COUNT = 2000;

/**
 * Calculate LOD distance scaling factor based on visible photo count
 * Uses an exponential formula to smoothly scale distances
 *
 * Formula: scaleFactor = (BASE_PHOTO_COUNT / photoCount) ^ 0.5
 *
 * Examples:
 * - 2000 photos -> factor = 1.0 (no scaling, base configuration)
 * - 1000 photos -> factor = 1.41 (distances increased by 41%)
 * - 500 photos -> factor = 2.0 (distances doubled)
 * - 100 photos -> factor = 4.47 (distances increased by 4.5x - mostly ULTRA/HIGH)
 * - 50 photos -> factor = 6.32 (distances increased by 6.3x - almost all ULTRA)
 *
 * @param {number} photoCount - Number of visible photos after filters
 * @returns {number} Scaling factor for LOD distances
 */
function calculateLODScaleFactor(photoCount) {
  if (photoCount >= BASE_PHOTO_COUNT) {
    return 1.0; // No scaling for 2000+ photos
  }

  // Ensure minimum of 1 photo to avoid division by zero
  const safePhotoCount = Math.max(1, photoCount);

  // Exponential scaling with square root for smooth progression
  // The 0.5 exponent provides a balanced curve:
  // - Not too aggressive at high photo counts
  // - Significant boost at low photo counts
  const scaleFactor = Math.sqrt(BASE_PHOTO_COUNT / safePhotoCount);

  // Cap maximum scale factor at 10x for very low photo counts (< 20 photos)
  return Math.min(scaleFactor, 10);
}

/**
 * Calculate maximum visible distance based on photo count
 * Uses the same scaling formula as LOD distances
 *
 * Formula: maxDistance = BASE_MAX_DISTANCE_VISIBLE * scaleFactor
 *
 * Examples:
 * - 2000 photos -> 180 units (base configuration)
 * - 1000 photos -> 254 units
 * - 500 photos -> 360 units
 * - 100 photos -> 805 units
 * - 50 photos -> 1138 units (almost all photos visible)
 *
 * @param {number} photoCount - Number of visible photos after filters
 * @returns {number} Maximum distance in units
 */
export function getMaxVisibleDistance(photoCount = BASE_PHOTO_COUNT) {
  const scaleFactor = calculateLODScaleFactor(photoCount);
  return Math.round(BASE_MAX_DISTANCE_VISIBLE * scaleFactor);
}

/**
 * Get array of LOD configurations with dynamically adjusted distances
 * Distances scale based on visible photo count to maintain visual quality
 *
 * @param {number} photoCount - Number of visible photos after filters (default: BASE_PHOTO_COUNT)
 * @returns {Array} Array of {level, size, distance, opacity} objects
 */
export function getLODConfigurations(photoCount = BASE_PHOTO_COUNT) {
  const scaleFactor = calculateLODScaleFactor(photoCount);

  return [
    {
      level: "ULTRA",
      size: LOD_LEVELS.ULTRA.size,
      distance: LOD_LEVELS.ULTRA.baseDistance, // Always 0
      opacity: LOD_LEVELS.ULTRA.opacity,
    },
    {
      level: "HIGH",
      size: LOD_LEVELS.HIGH.size,
      distance: Math.round(LOD_LEVELS.HIGH.baseDistance * scaleFactor),
      opacity: LOD_LEVELS.HIGH.opacity,
    },
    {
      level: "MEDIUM",
      size: LOD_LEVELS.MEDIUM.size,
      distance: Math.round(LOD_LEVELS.MEDIUM.baseDistance * scaleFactor),
      opacity: LOD_LEVELS.MEDIUM.opacity,
    },
    {
      level: "LOW",
      size: LOD_LEVELS.LOW.size,
      distance: Math.round(LOD_LEVELS.LOW.baseDistance * scaleFactor),
      opacity: LOD_LEVELS.LOW.opacity,
    },
    {
      level: "VERY_LOW",
      size: LOD_LEVELS.VERY_LOW.size,
      distance: Math.round(LOD_LEVELS.VERY_LOW.baseDistance * scaleFactor),
      opacity: LOD_LEVELS.VERY_LOW.opacity,
    },
  ];
}

/**
 * Check if a photo should be visible based on distance from camera
 * Returns true if within dynamically calculated max visible distance
 * @param {number} distance - Distance from camera to photo
 * @param {number} photoCount - Number of visible photos (for dynamic distance calculation)
 * @returns {boolean} Whether the photo should be visible
 */
export function isPhotoWithinVisibleDistance(
  distance,
  photoCount = BASE_PHOTO_COUNT
) {
  const maxDistance = getMaxVisibleDistance(photoCount);
  return distance <= maxDistance;
}

/**
 * Filter photos by visible distance from camera position
 * @param {Array} photos - Array of photo objects with position property
 * @param {Object} cameraPosition - Camera position {x, y, z}
 * @param {number} photoCount - Number of visible photos (for dynamic distance calculation)
 * @returns {Array} Filtered array of photos within visible distance
 */
export function filterPhotosByVisibleDistance(
  photos,
  cameraPosition,
  photoCount = null
) {
  const effectivePhotoCount = photoCount !== null ? photoCount : photos.length;
  const maxDistance = getMaxVisibleDistance(effectivePhotoCount);

  return photos.filter((photo) => {
    const dx = photo.position[0] - cameraPosition.x;
    const dy = photo.position[1] - cameraPosition.y;
    const dz = photo.position[2] - cameraPosition.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return distance <= maxDistance;
  });
}
