/**
 * Composable for photo scoring and relevance utilities
 */
export function usePhotoScored() {
  /**
   * Computes the star rating for a photo based on matchScore or matchPercent
   * @param {PhotoWithMatchData} photo - Photo object with matchScore or matchPercent
   * @returns {number} Star rating (0-3)
   */
  function computePhotoStars(photo) {
    // If matchScore exists and is greater than 0, use it directly
    if (photo.matchScore && photo.matchScore > 0) {
      return Math.max(1, Math.min(3, photo.matchScore));
    }

    // If matchPercent exists, convert it to stars
    if (typeof photo.matchPercent === "number" && photo.matchPercent >= 0) {
      const percent = photo.matchPercent;

      if (percent < 30) return 0;
      if (percent >= 75) return 3;
      if (percent >= 45) return 2;
      if (percent >= 30) return 1;
    }

    return 0;
  }

  /**
   * Determines if the low relevance icon should be shown
   * @param {PhotoWithMatchData} photo - Photo object with matchScore or matchPercent
   * @returns {boolean} Whether to show low relevance icon
   */
  function shouldShowLowRelevanceIcon(photo) {
    // If there's a matchScore, don't show low relevance icon
    if (photo.matchScore && photo.matchScore > 0) {
      return false;
    }

    // Show low relevance icon if matchPercent < 30%
    if (typeof photo.matchPercent === "number" && photo.matchPercent >= 0) {
      return photo.matchPercent < 30;
    }

    return false;
  }

  return {
    computePhotoStars,
    shouldShowLowRelevanceIcon,
  };
}
