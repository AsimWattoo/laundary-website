import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';

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
        <nav className="border-b px-4 py-3 sticky top-0 bg-background/95 backdrop-blur z-50">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Laundry Tracker
            </Link>
            <div className="flex gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/wardrobe" className="hover:text-primary transition-colors">
                Wardrobe
              </Link>
              <Link href="/sessions/new" className="hover:text-primary transition-colors">
                New Session
              </Link>
            </div>
          </div>
        </nav>
        <main id="main-content" className="container mx-auto p-4 md:p-8">{children}</main>
      </body>
    </html>
  );
}
