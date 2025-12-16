import { HelmetProvider } from 'react-helmet-async';
import { ReactNode } from 'react';

interface SEOProviderProps {
  children: ReactNode;
}

export function SEOProvider({ children }: SEOProviderProps) {
  return <HelmetProvider>{children}</HelmetProvider>;
}
