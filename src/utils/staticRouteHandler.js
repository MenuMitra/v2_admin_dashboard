/**
 * Utility function to generate static parameters for dynamic routes
 * Used in generateStaticParams() functions in layout or page components
 * 
 * @param {number} count - Number of placeholder IDs to generate (1 to count)
 * @returns {Array<{id: string}>} Array of ID objects for static generation
 */
export function generateStaticParamsForIds(count = 20) {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1)
  }));
} 