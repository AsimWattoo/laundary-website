'use client'

import { useState, useTransition } from 'react'
import { AddClothDialog } from '@/components/AddClothDialog'
import { AddGroupDialog } from '@/components/AddGroupDialog'
import { DeleteClothButton } from '@/components/DeleteClothButton'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/ui/SearchBar'
import { Trash2, Loader2, CheckSquare, Square, Tag } from 'lucide-react'
import { deleteClothesBulk } from '@/lib/actions'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ClientOnly } from '@/components/ClientOnly'

interface WardrobeClientProps {
  initialClothes: {
    id: string
    name: string
    imageUrl: string
    type: string
  }[]
  q?: string
}

export function WardrobeClient({ initialClothes, q }: WardrobeClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedIds.length === initialClothes.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(initialClothes.map((c) => c.id))
    }
  }

  const handleDeleteBulk = () => {
    startTransition(async () => {
      try {
        await deleteClothesBulk(selectedIds)
        toast.success(`${selectedIds.length} items deleted successfully`)
        setSelectedIds([])
        setIsDeleteDialogOpen(false)
      } catch (error) {
        console.error('Failed to delete clothes:', error)
        toast.error('Failed to delete items. Please try again.')
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Wardrobe</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <ClientOnly>
            <SearchBar defaultValue={q} placeholder="Search clothes..." />
          </ClientOnly>
          <div className="flex items-center gap-2">
            {initialClothes.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAll}
                className="hidden sm:flex h-9"
              >
                {selectedIds.length === initialClothes.length ? (
                  <CheckSquare className="mr-2 h-4 w-4" />
                ) : (
                  <Square className="mr-2 h-4 w-4" />
                )}
                {selectedIds.length === initialClothes.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
            <AddGroupDialog clothes={initialClothes} />
            <AddClothDialog />
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-30 flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            <span className="font-semibold">{selectedIds.length} items selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Cancel
            </Button>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger
                render={
                  <Button
                    size="sm"
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-none shadow-md"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Multiple Items</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete <strong>{selectedIds.length}</strong> items? This will also remove them from all laundry history. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteBulk} disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete All'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {initialClothes.length === 0 ? (
        <div 
          className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-lg border-2 border-dashed"
          role="status"
          aria-label="Empty wardrobe"
        >
          <p className="text-muted-foreground text-lg">
            {q ? `No clothes found matching "${q}"` : "Your wardrobe is empty."}
          </p>
          <p className="text-muted-foreground">
            {q ? "Try a different search term or clear the search." : "Add your first piece of clothing to get started!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {initialClothes.map((cloth) => {
            const isSelected = selectedIds.includes(cloth.id)
            return (
              <div 
                key={cloth.id} 
                className={cn(
                  "group relative bg-card rounded-lg border shadow-sm overflow-hidden transition-all hover:shadow-md",
                  isSelected ? "ring-2 ring-primary border-primary" : ""
                )}
              >
                <div className="aspect-square relative overflow-hidden bg-muted">
                  <img
                    src={cloth.imageUrl}
                    alt={`Photo of ${cloth.name}`}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Selection Overlay */}
                  <div 
                    className={cn(
                      "absolute inset-0 bg-black/20 transition-opacity cursor-pointer",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                    onClick={() => toggleSelection(cloth.id)}
                  />

                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelection(cloth.id)}
                    className="absolute top-2 left-2 h-5 w-5 bg-white data-[state=checked]:bg-primary shadow-sm"
                  />
                  
                  <DeleteClothButton clothId={cloth.id} clothName={cloth.name} />

                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded-md flex items-center gap-1">
                    <Tag className="h-3 w-3 text-white/70" />
                    <span className="text-[10px] text-white font-medium uppercase tracking-wider">{cloth.type}</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium truncate" title={cloth.name}>{cloth.name}</h3>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
