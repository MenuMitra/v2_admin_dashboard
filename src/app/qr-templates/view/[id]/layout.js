// Use a separate server component for layout to avoid conflicts with "use client"
// This is needed because generateStaticParams must be in a server component

export const generateStaticParams = async () => {
  // Generate placeholder IDs (1-20) for static export
  return Array.from({ length: 20 }, (_, i) => ({
    id: String(i + 1),
  }));
};

// Simple layout component that just renders children
export default function QrTemplateViewLayout({ children }) {
  return children;
} 