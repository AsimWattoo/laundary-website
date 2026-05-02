import './globals.css';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-background focus:border-b"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="container mx-auto p-4 md:p-8">{children}</main>
      </body>
    </html>
  );
}
