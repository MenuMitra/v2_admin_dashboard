// Server component for layout with generateStaticParams
export const generateStaticParams = async () => {
  // Generate placeholder IDs (1-500) for static export
  return Array.from({ length: 500 }, (_, i) => ({
    id: String(i + 1),
  }));
};

// Simple layout component
export default function RoleMappingLayout({ children }) {
  return children;
} 