// This function is needed for static site generation with dynamic routes
export async function generateStaticParams() {
  // Generate placeholder IDs (1-500) for static export
  return Array.from({ length: 500 }, (_, i) => ({
    id: String(i + 1),
  }));
} 