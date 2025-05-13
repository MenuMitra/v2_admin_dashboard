import { generateStaticParamsForIds } from '@/utils/staticRouteHandler';

export const generateStaticParams = () => {
  return generateStaticParamsForIds(50);
};

export default function OutletEditLayout({ children }) {
  return children;
} 