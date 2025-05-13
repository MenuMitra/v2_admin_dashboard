// This function is needed for static site generation with dynamic routes
export async function generateStaticParams() {
  // Generate placeholder IDs (1-50) for static export
  return Array.from({ length: 50 }, (_, i) => ({
    id: String(i + 1),
  }));
} 