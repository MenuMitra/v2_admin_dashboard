import { generateStaticParamsForIds } from '@/utils/staticRouteHandler';

export const generateStaticParams = () => {
  return generateStaticParamsForIds(20);
};

export default function PartnerViewLayout({ children }) {
  return children;
} 