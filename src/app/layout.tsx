import './globals.css';
import { Navbar } from '@/components/Navbar';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { ClientOnly } from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Laundry Tracker',
  description: 'Effortlessly track your laundry sessions and wardrobe items.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-background focus:border-b"
        >
          Skip to main content
        </a>
        <ClientOnly>
          <Navbar />
        </ClientOnly>
        <main id="main-content" className="container mx-auto p-4 md:p-8">{children}</main>   
        <ClientOnly>
          <Toaster />
        </ClientOnly>

      </body>
    </html>
  );
}
