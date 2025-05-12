import { useState, useEffect } from 'react';
import { MediaItem } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Download, 
  Share, 
  Trash,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface PhotoViewerProps {
  item: MediaItem;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  collectionId: string;
}

export default function PhotoViewer({ item, onClose, onNext, onPrevious, collectionId }: PhotoViewerProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('PATCH', `/api/media/${item.id}/favorite`, {
        isFavorite: !item.isFavorite
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/collections/${collectionId}/media`] });
    }
  });

  // Delete media mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/media/${item.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/collections/${collectionId}/media`] });
      onClose();
      toast({
        title: "Item deleted",
        description: "The media item has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the media item. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrevious();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrevious]);

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-90 flex items-center justify-center" onClick={onClose}>
        <div className="relative w-full max-w-5xl p-2 md:p-4" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:text-[hsl(var(--love-pink))] z-50 text-2xl bg-transparent"
            onClick={onClose}
          >
            <X size={24} />
          </Button>
          
          <div className="flex items-center justify-center h-full">
            {item.type === 'video' ? (
              <video 
                src={item.url} 
                controls 
                className="max-h-[80vh] max-w-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img 
                src={item.url} 
                alt={item.description || item.filename} 
                className="max-h-[80vh] max-w-full object-contain"
              />
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-[hsl(var(--love-pink))] bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
          >
            <ChevronLeft size={36} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-[hsl(var(--love-pink))] bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <ChevronRight size={36} />
          </Button>
          
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-display">
                  {item.description || item.filename}
                  {item.type === 'video' && (
                    <span className="ml-2 inline-flex items-center">
                      <Video size={16} className="mr-1" /> Video
                    </span>
                  )}
                </h3>
                <p className="text-gray-300 text-sm font-body">
                  Added {format(new Date(item.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`hover:text-[hsl(var(--love-pink))] transition duration-300 ${item.isFavorite ? 'text-red-500' : 'text-white'}`}
                  onClick={() => toggleFavoriteMutation.mutate()}
                >
                  <Heart size={20} fill={item.isFavorite ? "currentColor" : "none"} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-[hsl(var(--love-pink))] transition duration-300"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = item.url;
                    link.download = item.filename || `download-${item.id}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-[hsl(var(--love-pink))] transition duration-300"
                >
                  <Share size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-[hsl(var(--love-pink))] transition duration-300"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMediaMutation.mutate()}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
