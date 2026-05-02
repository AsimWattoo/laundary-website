'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useEffect, useState } from 'react';
import { Input } from './input';
import { Search, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

export function SearchBar({ placeholder = 'Search...', className, defaultValue = '' }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);

  // Debounced search
  useEffect(() => {
    // Skip if the value matches the current URL state to prevent loops
    const currentQuery = searchParams.get('q') || '';
    if (value === currentQuery) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }

      const newQuery = params.toString();
      const oldQuery = searchParams.toString();
      
      if (newQuery !== oldQuery) {
        startTransition(() => {
          router.push(`${pathname}${newQuery ? `?${newQuery}` : ''}`);
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
        aria-label="Search"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {value && (
          <button
            onClick={() => setValue('')}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
