import { generateStaticParamsForIds } from '@/utils/staticRouteHandler';

export const generateStaticParams = () => {
  return generateStaticParamsForIds(500);
};

export default function OutletEditLayout({ children }) {
  return children;
} 