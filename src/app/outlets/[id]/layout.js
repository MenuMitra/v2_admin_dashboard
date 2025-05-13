import { generateStaticParamsForIds } from '@/utils/staticRouteHandler';

export const generateStaticParams = () => {
  return generateStaticParamsForIds(50);
};

export default function OutletLayout({ children }) {
  return children;
} 