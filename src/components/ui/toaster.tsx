'use client';

import { useEffect, useState } from 'react';

export function Toaster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Dynamically import Sonner only on the client
  const { Toaster: SonnerToaster } = require('sonner');
  return <SonnerToaster position="bottom-right" richColors />;
}
