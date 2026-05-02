'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createLaundrySession } from '@/lib/actions'
import { Loader2, Layers, Tag, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SelectionClientProps {
  initialClothes: {
    id: string
    name: string
    imageUrl: string
    type: string
  }[]
  initialGroups: {
    id: string
    name: string
    itemIds: string[]
  }[]
}

export function SelectionClient({ initialClothes, initialGroups }: SelectionClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, setIsPending] = useState(false)

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleGroup = (itemIds: string[]) => {
    const availableItemIds = itemIds.filter(id => initialClothes.some(c => c.id === id))
    const allSelected = availableItemIds.every(id => selectedIds.includes(id))
    
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !availableItemIds.includes(id)))
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...availableItemIds])))
    }
  }

  const handleStartLaundry = async () => {
    setIsPending(true)
    try {
      await createLaundrySession(selectedIds)
      toast.success('Laundry session started successfully!')
    } catch (error) {
      console.error('Failed to start laundry session:', error)
      toast.error('Failed to start laundry session. Please try again.')
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-8">
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

      {/* Groups Section */}
      {initialGroups.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Clothing Groups</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {initialGroups.map((group) => {
              const availableItemIds = group.itemIds.filter(id => initialClothes.some(c => c.id === id))
              const isSelected = availableItemIds.length > 0 && availableItemIds.every(id => selectedIds.includes(id))
              const isDisabled = availableItemIds.length === 0

              return (
                <div
                  key={group.id}
                  role="button"
                  tabIndex={isDisabled ? -1 : 0}
                  aria-pressed={isSelected}
                  aria-disabled={isDisabled}
                  onClick={() => !isDisabled && toggleGroup(group.itemIds)}
                  onKeyDown={(e) => {
                    if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      toggleGroup(group.itemIds)
                    }
                  }}
                  className={cn(
                    "group relative p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    isDisabled ? "opacity-50 grayscale cursor-not-allowed border-dashed bg-muted/20" : "cursor-pointer hover:border-primary/50 bg-card",
                    isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-transparent border-muted/50"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm truncate w-full max-w-[120px]">{group.name}</p>
                    <p className="text-[10px] text-muted-foreground">{group.itemIds.length} items</p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  {isDisabled && (
                    <p className="text-[8px] text-destructive font-medium uppercase tracking-tighter">Already in laundry</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Individual Items Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Tag className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Individual Items</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {initialClothes.map((cloth) => {
            const isSelected = selectedIds.includes(cloth.id)
            return (
              <div
                key={cloth.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => toggleSelection(cloth.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleSelection(cloth.id)
                  }
                }}
                className={cn(
                  "group relative cursor-pointer rounded-xl border-2 bg-card p-2 transition-all hover:border-primary/50 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-transparent"
                )}
              >
                <div className="aspect-square overflow-hidden rounded-lg mb-2 bg-muted">
                  <img
                    src={cloth.imageUrl}
                    alt={`Photo of ${cloth.name}`}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="px-1 text-center">
                  <p className="text-xs font-semibold truncate">{cloth.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{cloth.type}</p>
                </div>
                
                <div 
                  className={cn(
                    "absolute top-3 right-3 h-5 w-5 rounded-full border bg-background flex items-center justify-center transition-colors shadow-sm",
                    isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {initialClothes.length === 0 && (
        <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed">
          <p className="text-lg font-medium text-muted-foreground">No items available for a new session.</p>
          <p className="text-sm text-muted-foreground/60">Either your wardrobe is empty or all items are currently in laundry.</p>
        </div>
      )}
    </div>
  )
}
