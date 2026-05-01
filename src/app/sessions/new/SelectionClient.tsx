'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createLaundrySession } from '@/lib/actions'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectionClientProps {
  initialClothes: {
    id: string
    name: string
    imageUrl: string
  }[]
}

/**
 * SelectionClient handles the interactive selection of clothes for a laundry session.
 * It follows WCAG 2.2 Level AA standards for accessibility.
 */
export function SelectionClient({ initialClothes }: SelectionClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, setIsPending] = useState(false)

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleStartLaundry = async () => {
    setIsPending(true)
    try {
      await createLaundrySession(selectedIds)
    } catch (error) {
      console.error(error)
      setIsPending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      toggleSelection(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* 
        Action bar with counter and submit button. 
        The counter is in an aria-live region to notify screen readers of changes.
      */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-4 border-b flex justify-between items-center">
        <div aria-live="polite" className="text-sm font-medium">
          {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
        </div>
        <Button
          onClick={handleStartLaundry}
          disabled={selectedIds.length === 0 || isPending}
          className="min-w-[140px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Starting...
            </>
          ) : (
            'Start Laundry'
          )}
        </Button>
      </div>

      {/* 
        Grid of clothes. 
        Uses role="listbox" with aria-multiselectable="true" for semantic selection.
      */}
      <div
        role="listbox"
        aria-multiselectable="true"
        aria-label="Select clothes for laundry session"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      >
        {initialClothes.map((cloth) => {
          const isSelected = selectedIds.includes(cloth.id)
          return (
            <div
              key={cloth.id}
              role="option"
              aria-selected={isSelected}
              tabIndex={0}
              onClick={() => toggleSelection(cloth.id)}
              onKeyDown={(e) => handleKeyDown(e, cloth.id)}
              className={cn(
                "group relative cursor-pointer rounded-lg border-2 bg-card p-2 transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isSelected ? "border-primary bg-primary/5" : "border-transparent"
              )}
            >
              <div className="aspect-square overflow-hidden rounded-md mb-2">
                <img
                  src={cloth.imageUrl}
                  alt="" // Decorative if name is below, or describe if name is not enough. Here name is descriptive.
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <p className="text-sm font-medium text-center truncate px-1">
                {cloth.name}
              </p>
              
              {/* Visual indicator for selection */}
              <div 
                className={cn(
                  "absolute top-2 right-2 h-5 w-5 rounded-full border bg-background flex items-center justify-center transition-colors",
                  isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted"
                )}
                aria-hidden="true"
              >
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {initialClothes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Your wardrobe is empty.</p>
          <p className="text-sm">Add some clothes to get started!</p>
        </div>
      )}
    </div>
  )
}
