import { Collection } from '@shared/schema';
import { Edit, Trash2, Image } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { formatDistance } from 'date-fns';

interface CollectionCardProps {
  collection: Collection;
  viewType: 'grid' | 'list';
}

export default function CollectionCard({ collection, viewType }: CollectionCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await apiRequest('DELETE', `/api/collections/${collection.id}`);
      
      toast({
        title: "Collection deleted",
        description: "Your collection has been deleted successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete collection. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (viewType === 'list') {
    return (
      <div className="photo-card bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 flex items-center">
          <div className="h-16 w-16 bg-[hsl(var(--love-pink))] rounded-md mr-4 flex-shrink-0 overflow-hidden">
            {collection.coverImage ? (
              <img 
                src={collection.coverImage} 
                alt={collection.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[hsl(var(--love-red))]">
                <Image size={24} />
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            <Link href={`/collection/${collection.id}`} className="hover:text-[hsl(var(--love-dark))]">
              <h3 className="font-display text-xl font-semibold">{collection.name}</h3>
            </Link>
            <p className="text-gray-600 text-sm mb-1 font-body">{collection.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm font-body">
                {formatDistance(new Date(collection.createdAt), new Date(), { addSuffix: true })}
                {' · '}
                <span className="inline-flex items-center">
                  <Image size={14} className="mr-1" /> {collection.itemCount || 0} items
                </span>
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-[hsl(var(--love-dark))] transition duration-300"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                // Handle edit functionality
              }}
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-[hsl(var(--love-red))] transition duration-300"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="photo-card bg-white rounded-lg shadow-md overflow-hidden">
        <Link href={`/collection/${collection.id}`} className="block">
          <div className="h-48 bg-[hsl(var(--love-pink))] relative overflow-hidden">
            {collection.coverImage ? (
              <img 
                src={collection.coverImage} 
                alt={collection.name} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-opacity-70">
                <Image size={48} />
              </div>
            )}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-30"></div>
            <div className="absolute bottom-4 right-4">
              <span className="bg-white bg-opacity-80 text-[hsl(var(--love-dark))] px-2 py-1 rounded-full text-sm font-body inline-flex items-center">
                <Image size={14} className="mr-1" /> {collection.itemCount || 0} items
              </span>
            </div>
          </div>
        </Link>
        <div className="p-4">
          <Link href={`/collection/${collection.id}`} className="hover:text-[hsl(var(--love-dark))]">
            <h3 className="font-display text-xl font-semibold mb-2">{collection.name}</h3>
          </Link>
          <p className="text-gray-600 text-sm mb-3 font-body">{collection.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm font-body">
              {formatDistance(new Date(collection.createdAt), new Date(), { addSuffix: true })}
            </span>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-[hsl(var(--love-dark))] transition duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  // Handle edit functionality
                }}
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-[hsl(var(--love-red))] transition duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{collection.name}" collection and all its photos and videos.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
