'use client';

import { useEffect, useState } from 'react';
import { GitHubLink } from './GitHubLink';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      {children}
      <GitHubLink />
    </>
  );
}
