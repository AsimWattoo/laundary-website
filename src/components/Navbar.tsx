"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Accessibility: Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/sessions", label: "Sessions" },
    { href: "/wardrobe", label: "Wardrobe" },
    { href: "/sessions/new", label: "New Session" },
  ];

  return (
    /* Accessibility: Use semantic <nav> landmark */
    <nav 
      className="border-b px-4 py-3 sticky top-0 bg-primary shadow-md z-50"
      aria-label="Main Navigation"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xl font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-sm transition-opacity hover:opacity-90"
        >
          <Logo className="w-8 h-8" />
          <span>Laundry Tracker</span>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={cn(
                "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-sm px-2 py-1",
                pathname === link.href 
                  ? "text-primary-foreground bg-white/10" 
                  : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/5"
              )}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-primary-foreground hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-md transition-colors" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close main menu" : "Open main menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {/* Accessibility: id matches aria-controls, hidden/visible states handled */}
      <div 
        id="mobile-menu"
        className={cn(
          "md:hidden absolute top-full left-0 right-0 bg-primary border-t border-white/10 p-4 flex flex-col gap-2 shadow-xl transition-all duration-200 origin-top",
          isOpen ? "opacity-100 scale-y-100 visible" : "opacity-0 scale-y-95 invisible pointer-events-none"
        )}
      >
        {navLinks.map((link) => (
          <Link 
            key={link.href}
            href={link.href} 
            onClick={() => setIsOpen(false)} 
            className={cn(
              "text-lg font-medium p-3 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground",
              pathname === link.href 
                ? "text-primary-foreground bg-white/20" 
                : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
            )}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
