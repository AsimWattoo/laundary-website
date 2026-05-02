'use client';

import { useState } from 'react';
import { updateSessionItems } from '@/lib/actions';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Item {
  id: string;
  isReturned: boolean;
  cloth: {
    name: string;
    imageUrl: string;
    type: string;
  };
}

export default function ItemChecklist({ sessionId, items }: { sessionId: string; items: Item[] }) {
  const [returnedIds, setReturnedIds] = useState<string[]>(
    items.filter(i => i.isReturned).map(i => i.id)
  );
  const [isPending, setIsPending] = useState(false);

  // Check if there are any changes compared to initial data
  const initialReturnedIds = items.filter(i => i.isReturned).map(i => i.id);
  const hasChanges = 
    returnedIds.length !== initialReturnedIds.length ||
    !returnedIds.every(id => initialReturnedIds.includes(id));

  const handleToggle = (id: string) => {
    setReturnedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsPending(true);
    try {
      await updateSessionItems(sessionId, returnedIds);
      toast.success('Session items updated successfully!');
    } catch (error) {
      console.error('Failed to update session items:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-20 z-10 bg-background/95 backdrop-blur py-4 border-y flex justify-between items-center px-1">
        <p className="text-sm font-medium text-muted-foreground">
          {returnedIds.length} of {items.length} items selected
        </p>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || isPending}
          className="shadow-sm"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const isSelected = returnedIds.includes(item.id);
          return (
            <div 
              key={item.id} 
              className={`flex items-center space-x-4 p-4 border rounded-lg transition-colors ${
                isSelected 
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' 
                  : 'bg-yellow-50/50 border-yellow-100 hover:bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/30'
              }`}
            >
              <Checkbox
                id={item.id}
                checked={isSelected}
                onCheckedChange={() => handleToggle(item.id)}
                aria-label={`Mark ${item.cloth.name} as returned`}
                disabled={isPending}
              />
              <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0 border bg-muted">
                <img 
                  src={item.cloth.imageUrl} 
                  alt={item.cloth.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-grow min-w-0">
                <Label 
                  htmlFor={item.id} 
                  className={`block truncate font-medium cursor-pointer ${
                    isSelected 
                      ? 'text-blue-700 dark:text-blue-300' 
                      : 'text-yellow-800 dark:text-yellow-600'
                  }`}
                >
                  {item.cloth.name}
                </Label>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{item.cloth.type}</p>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
            No items in this session.
          </div>
        )}
      </div>
    </div>
  );
}
