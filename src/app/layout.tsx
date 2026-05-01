import './globals.css';
import { Inter, Geist } from 'next/font/google';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <nav className="border-b px-4 py-3">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Laundry Tracker</h1>
          </div>
        </nav>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
