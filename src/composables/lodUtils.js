/**
 * LOD (Level of Detail) utilities for 3D photo viewer
 * Uses THREE.js native LOD system with 3 quality levels
 */

// LOD Configuration - Texture sizes and distances for THREE.LOD.addLevel()
export const LOD_LEVELS = {
  HIGH: {
    size: 768,
    distance: 0, // Show from 0 to 15 units
  },
  MEDIUM: {
    size: 128,
    distance: 15, // Show from 15 to 80 units
  },
  LOW: {
    size: 24,
    distance: 80, // Show from 60+ units
  },
};

/**
 * Get array of LOD configurations sorted by distance (for THREE.LOD.addLevel)
 * @returns {Array} Array of {level, size, distance} objects
 */
export function getLODConfigurations() {
  return [
    {
      level: "HIGH",
      size: LOD_LEVELS.HIGH.size,
      distance: LOD_LEVELS.HIGH.distance,
    },
    {
      level: "MEDIUM",
      size: LOD_LEVELS.MEDIUM.size,
      distance: LOD_LEVELS.MEDIUM.distance,
    },
    {
      level: "LOW",
      size: LOD_LEVELS.LOW.size,
      distance: LOD_LEVELS.LOW.distance,
    },
  ];
}
