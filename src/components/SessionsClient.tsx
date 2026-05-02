'use client'

import { useState, useTransition } from 'react'
import { format } from "date-fns"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchBar } from "@/components/ui/SearchBar"
import { Trash2, Loader2, CheckSquare, Square, History, ChevronRight, Waves } from 'lucide-react'
import { deleteLaundrySessionsBulk } from '@/lib/actions'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ClientOnly } from '@/components/ClientOnly'

interface SessionWithCounts {
  id: string;
  createdAt: Date;
  expectedReturnDate: Date | null;
  status: "active" | "completed";
  totalItemsCount: number;
  returnedItemsCount: number;
}

interface SessionsClientProps {
  initialSessions: SessionWithCounts[]
  q?: string
}

export function SessionsClient({ initialSessions, q }: SessionsClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedIds.length === initialSessions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(initialSessions.map((s) => s.id))
    }
  }

  const handleDeleteBulk = () => {
    startTransition(async () => {
      try {
        await deleteLaundrySessionsBulk(selectedIds)
        toast.success(`${selectedIds.length} sessions deleted successfully`)
        setSelectedIds([])
        setIsDeleteDialogOpen(false)
      } catch (error) {
        console.error('Failed to delete sessions:', error)
        toast.error('Failed to delete sessions. Please try again.')
      }
    })
  }

  const activeSessions = initialSessions.filter(s => s.status === 'active');
  const completedSessions = initialSessions.filter(s => s.status === 'completed');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laundry Sessions</h1>
          <p className="text-muted-foreground">Manage and track all your laundry sessions.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <ClientOnly>
            <SearchBar defaultValue={q} placeholder="Search sessions..." />
          </ClientOnly>
          {initialSessions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
              className="h-9"
            >
              {selectedIds.length === initialSessions.length ? (
                <CheckSquare className="mr-2 h-4 w-4" />
              ) : (
                <Square className="mr-2 h-4 w-4" />
              )}
              {selectedIds.length === initialSessions.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-30 flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            <span className="font-semibold">{selectedIds.length} sessions selected</span>
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
                  <DialogTitle>Delete Multiple Sessions</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete <strong>{selectedIds.length}</strong> sessions? All history for these sessions will be lost. This action cannot be undone.
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

      <div className="grid gap-8">
        {/* Active Sessions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Waves className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Active Sessions</h2>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {activeSessions.length}
            </span>
          </div>
          
          {activeSessions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-muted-foreground">
                {q ? `No active sessions matching "${q}"` : "No active sessions at the moment."}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeSessions.map((session) => (
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  isSelected={selectedIds.includes(session.id)}
                  onToggle={() => toggleSelection(session.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Completed Sessions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <History className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">History</h2>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              {completedSessions.length}
            </span>
          </div>

          {completedSessions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {q ? `No sessions in history matching "${q}"` : "Your history is empty."}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completedSessions.map((session) => (
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  isSelected={selectedIds.includes(session.id)}
                  onToggle={() => toggleSelection(session.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SessionCard({ 
  session, 
  isSelected, 
  onToggle 
}: { 
  session: SessionWithCounts;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const progress = (session.returnedItemsCount / (session.totalItemsCount || 1)) * 100;
  
  return (
    <div className="relative group">
      <div className="absolute top-3 left-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          className="h-5 w-5 bg-white data-[state=checked]:bg-primary shadow-sm"
        />
      </div>
      <Link href={`/sessions/${session.id}`}>
        <Card className={cn(
          "hover:shadow-md transition-shadow group cursor-pointer h-full pl-8",
          isSelected ? "ring-2 ring-primary border-primary" : ""
        )}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                {format(session.createdAt, "PPP")}
              </CardTitle>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {session.returnedItemsCount} / {session.totalItemsCount}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden border">
                <div 
                  className={cn(
                    "h-full transition-all bg-primary",
                    session.status === 'active' && "shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  session.status === 'active' 
                    ? "bg-blue-100 text-blue-700" 
                    : "bg-green-100 text-green-700"
                )}>
                  {session.status}
                </span>
              </div>
              {session.expectedReturnDate && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="font-medium">Return:</span>
                  {format(session.expectedReturnDate, "MMM dd, yyyy")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
