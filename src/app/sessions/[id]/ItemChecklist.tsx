'use client';

import { useOptimistic, useTransition } from 'react';
import { toggleItemReturn } from '@/lib/actions';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Item {
  id: string;
  isReturned: boolean;
  cloth: {
    name: string;
    imageUrl: string;
  };
}

export default function ItemChecklist({ items }: { items: Item[] }) {
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    items,
    (state, { id, isReturned }: { id: string; isReturned: boolean }) =>
      state.map((item) => (item.id === id ? { ...item, isReturned } : item))
  );
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (id: string, isReturned: boolean) => {
    startTransition(async () => {
      addOptimisticItem({ id, isReturned });
      try {
        await toggleItemReturn(id, isReturned);
      } catch (error) {
        console.error('Failed to toggle item return status:', error);
        // In a real app, you might want to revert the optimistic update or show a toast
      }
    });
  };

  return (
    <div className="space-y-4">
      {optimisticItems.map((item) => (
        <div 
          key={item.id} 
          className={`flex items-center space-x-4 p-4 border rounded-lg transition-colors ${
            item.isReturned ? 'bg-accent/20' : 'hover:bg-accent/50'
          }`}
        >
          {/* Accessibility Strategy Implementation:
              - Proper label association with htmlFor
              - aria-label for clear screen reader feedback
              - High contrast focus indicators (handled by shadcn checkbox)
          */}
          <Checkbox
            id={item.id}
            checked={item.isReturned}
            onCheckedChange={(checked) => handleToggle(item.id, checked === true)}
            aria-label={`Mark ${item.cloth.name} as ${item.isReturned ? 'not returned' : 'returned'}`}
            disabled={isPending}
          />
          <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0 border bg-muted">
            <img 
              src={item.cloth.imageUrl} 
              alt={item.cloth.name} 
              className="h-full w-full object-cover"
            />
          </div>
          <Label 
            htmlFor={item.id} 
            className={`flex-grow cursor-pointer font-medium ${
              item.isReturned ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {item.cloth.name}
          </Label>
        </div>
      ))}
      {optimisticItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
          No items in this session.
        </div>
      )}
    </div>
  );
}
