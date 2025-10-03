/**
 * LOD (Level of Detail) utilities for 3D photo viewer
 * Uses THREE.js native LOD system with 3 quality levels
 */

// Maximum distance beyond which photos are completely hidden (no rendering, no computation)
// This is NOT an LOD level - photos beyond this distance consume ZERO resources
export const MAX_DISTANCE_VISIBLE = 180;

// LOD Configuration - Texture sizes, distances and opacity for THREE.LOD.addLevel()
// Opacity is pre-established per LOD level for better performance
export const LOD_LEVELS = {
  ULTRA: {
    size: 768,
    distance: 0, // Show from 0 to 5 units
    opacity: 1.0, // Fully visible - very close photos
  },
  HIGH: {
    size: 512,
    distance: 5, // Show from 5 to 15 units
    opacity: 1.0, // Fully visible - close photos
  },
  MEDIUM: {
    size: 128,
    distance: 15, // Show from 15 to 60 units
    opacity: 0.85, // Slightly faded - medium distance
  },
  LOW: {
    size: 24,
    distance: 60, // Show from 60 to 100 units
    opacity: 0.5, // More faded - far distance
  },
  VERY_LOW: {
    size: 4,
    distance: 100, // Show from 100+ units (very distant)
    opacity: 0.3, // Heavily faded - very far distance
  },
};

/**
 * Get array of LOD configurations sorted by distance (for THREE.LOD.addLevel)
 * @returns {Array} Array of {level, size, distance, opacity} objects
 */
export function getLODConfigurations() {
  return [
    {
      level: "ULTRA",
      size: LOD_LEVELS.ULTRA.size,
      distance: LOD_LEVELS.ULTRA.distance,
      opacity: LOD_LEVELS.ULTRA.opacity,
    },
    {
      level: "HIGH",
      size: LOD_LEVELS.HIGH.size,
      distance: LOD_LEVELS.HIGH.distance,
      opacity: LOD_LEVELS.HIGH.opacity,
    },
    {
      level: "MEDIUM",
      size: LOD_LEVELS.MEDIUM.size,
      distance: LOD_LEVELS.MEDIUM.distance,
      opacity: LOD_LEVELS.MEDIUM.opacity,
    },
    {
      level: "LOW",
      size: LOD_LEVELS.LOW.size,
      distance: LOD_LEVELS.LOW.distance,
      opacity: LOD_LEVELS.LOW.opacity,
    },
    {
      level: "VERY_LOW",
      size: LOD_LEVELS.VERY_LOW.size,
      distance: LOD_LEVELS.VERY_LOW.distance,
      opacity: LOD_LEVELS.VERY_LOW.opacity,
    },
  ];
}

/**
 * Check if a photo should be visible based on distance from camera
 * Returns true if within MAX_DISTANCE_VISIBLE, false otherwise
 * @param {number} distance - Distance from camera to photo
 * @returns {boolean} Whether the photo should be visible
 */
export function isPhotoWithinVisibleDistance(distance) {
  return distance <= MAX_DISTANCE_VISIBLE;
}

/**
 * Filter photos by visible distance from camera position
 * @param {Array} photos - Array of photo objects with position property
 * @param {Object} cameraPosition - Camera position {x, y, z}
 * @returns {Array} Filtered array of photos within visible distance
 */
export function filterPhotosByVisibleDistance(photos, cameraPosition) {
  return photos.filter((photo) => {
    const dx = photo.position[0] - cameraPosition.x;
    const dy = photo.position[1] - cameraPosition.y;
    const dz = photo.position[2] - cameraPosition.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return isPhotoWithinVisibleDistance(distance);
  });
}
