'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { deleteLaundrySession, updateSessionReturnDate } from '@/lib/actions';
import { Trash2, Calendar, Loader2, Edit2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface SessionActionsProps {
  sessionId: string;
  initialReturnDate: Date | null;
  itemCount: number;
}

export default function SessionActions({ sessionId, initialReturnDate, itemCount }: SessionActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingDate, setIsUpdatingDate] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [returnDate, setReturnDate] = useState(
    initialReturnDate ? format(new Date(initialReturnDate), 'yyyy-MM-dd') : ''
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteLaundrySession(sessionId);
      toast.success('Session deleted successfully');
    } catch (error) {
      // If it's a NEXT_REDIRECT error, it's actually a success
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        return;
      }
      console.error('Failed to delete session:', error);
      toast.error('An unexpected error occurred. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleUpdateDate = async () => {
    setIsUpdatingDate(true);
    try {
      const date = returnDate ? new Date(returnDate) : null;
      await updateSessionReturnDate(sessionId, date);
      setIsEditingDate(false);
      toast.success('Return date updated successfully');
    } catch (error) {
      console.error('Failed to update return date:', error);
      toast.error('Failed to update return date. Please try again.');
    } finally {
      setIsUpdatingDate(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 py-4 border-b mb-6">
      {/* Return Date Section */}
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">Expected Return:</span>
        {isEditingDate ? (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="h-8 w-40 text-xs"
              disabled={isUpdatingDate}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleUpdateDate}
              disabled={isUpdatingDate}
            >
              {isUpdatingDate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                setIsEditingDate(false);
                setReturnDate(initialReturnDate ? format(new Date(initialReturnDate), 'yyyy-MM-dd') : '');
              }}
              disabled={isUpdatingDate}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={initialReturnDate ? 'text-foreground' : 'text-muted-foreground italic'}>
              {initialReturnDate ? format(new Date(initialReturnDate), 'PPP') : 'Not set'}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setIsEditingDate(true)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      <div className="ml-auto">
        <Dialog>
          <DialogTrigger 
            render={
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Session
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Laundry Session?</DialogTitle>
              <DialogDescription>
                {itemCount > 0 
                  ? "This session contains items and cannot be deleted. Please remove all items from this session before attempting to delete it."
                  : "This will permanently delete this empty session. This action cannot be undone."
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" disabled={isDeleting}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting || itemCount > 0}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Session'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
