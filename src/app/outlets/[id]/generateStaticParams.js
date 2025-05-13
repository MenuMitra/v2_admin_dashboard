// This function is needed for static site generation with dynamic routes
// For a real app, you would fetch actual outlet IDs from your API
// For now, we'll use placeholder IDs that will be replaced with actual data at runtime
export async function generateStaticParams() {
  // Generate placeholder IDs (1-50) for static export
  return Array.from({ length: 50 }, (_, i) => ({
    id: String(i + 1),
  }));
} 