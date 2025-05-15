import { generateStaticParamsForIds } from '@/utils/staticRouteHandler';

export const generateStaticParams = () => {
  return generateStaticParamsForIds(500);
};

export default function EditTemplateLayout({ children }) {
  // No additional layout - directly pass children through
  return children;
} 