
'use client';

import { usePathname } from 'next/navigation';
import { FloatingNav } from './floating-nav';

export function FloatingNavWrapper() {
  const pathname = usePathname();

  // Don't show the floating nav on the welcome page
  if (pathname === '/welcome') {
    return null;
  }

  return <FloatingNav />;
}
