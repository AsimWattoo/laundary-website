'use client'

import { useState } from 'react'
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
import { createClothingGroup } from '@/lib/actions'
import { Layers, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AddGroupDialogProps {
  clothes: {
    id: string
    name: string
    imageUrl: string
  }[]
}

export function AddGroupDialog({ clothes }: AddGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [name, setName] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleCreateGroup = async () => {
    if (!name || selectedIds.length === 0) {
      toast.error('Please provide a name and select at least one item.')
      return
    }

    setIsPending(true)
    try {
      await createClothingGroup(name, selectedIds)
      setOpen(false)
      setName('')
      setSelectedIds([])
      toast.success('Group created successfully!')
    } catch (error) {
      console.error('Failed to create group:', error)
      toast.error('Failed to create group. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Layers className="mr-2 h-4 w-4" aria-hidden="true" />
            Create Group
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Clothing Group</DialogTitle>
          <DialogDescription>
            Combine items (e.g., Shalwar + Qameez) into a single group for easier laundry management.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="e.g., Shalwar Qameez Set"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label>Select Items</Label>
            <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
              {clothes.map((item) => {
                const isSelected = selectedIds.includes(item.id)
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelection(item.id)}
                    className={cn(
                      "group relative cursor-pointer rounded-md border-2 p-1 transition-all hover:border-primary/50",
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
                      <div className="absolute top-1 right-1 h-3 w-3 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                        <Check className="h-2 w-2" />
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
          <Button onClick={handleCreateGroup} disabled={isPending || !name || selectedIds.length === 0}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Group'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
