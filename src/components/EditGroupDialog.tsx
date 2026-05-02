'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateClothingGroup } from '@/lib/actions'
import { Pencil, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Cloth {
  id: string
  name: string
  imageUrl: string
}

interface EditGroupDialogProps {
  group: {
    id: string
    name: string
    items: Cloth[]
  }
  allClothes: Cloth[]
}

export function EditGroupDialog({ group, allClothes }: EditGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(group.name)
  const [selectedIds, setSelectedIds] = useState<string[]>(
    group.items.map((item) => item.id)
  )

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleUpdateGroup = () => {
    if (!name || selectedIds.length === 0) {
      toast.error('Please provide a name and select at least one item.')
      return
    }

    startTransition(async () => {
      try {
        await updateClothingGroup(group.id, name, selectedIds)
        setOpen(false)
        toast.success('Group updated successfully!')
      } catch (error) {
        console.error('Failed to update group:', error)
        toast.error('Failed to update group. Please try again.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/70 border-none backdrop-blur-sm text-white rounded-md transition-all shadow-md">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit Group</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Clothing Group</DialogTitle>
          <DialogDescription>
            Update the items in this group or change its name.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-group-name">Group Name</Label>
            <Input
              id="edit-group-name"
              placeholder="e.g., Shalwar Qameez Set"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label id={`edit-group-select-items-label-${group.id}`}>Select Items</Label>
            <div 
              className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1"
              role="listbox"
              aria-labelledby={`edit-group-select-items-label-${group.id}`}
              aria-multiselectable="true"
            >
              {allClothes.map((item) => {
                const isSelected = selectedIds.includes(item.id)
                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleSelection(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleSelection(item.id)
                      }
                    }}
                    tabIndex={0}
                    className={cn(
                      "group relative cursor-pointer rounded-md border-2 p-1 transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isSelected ? "border-primary bg-primary/5" : "border-transparent bg-muted/30"
                    )}
                  >
                    <div className="aspect-square overflow-hidden rounded-sm mb-1">
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-[10px] font-medium text-center truncate">
                      {item.name}
                    </p>
                    {isSelected && (
                      <div className="absolute top-1 right-1 h-4 w-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpdateGroup} disabled={isPending || !name || selectedIds.length === 0}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
