import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Collection, MediaItem } from '@shared/schema';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhotoCard from './PhotoCard';
import PhotoViewer from './PhotoViewer';
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  MoreVertical, 
  Search, 
  Grid, 
  List,
  Edit,
  Share,
  Trash,
  Heart,
  Film,
  Image
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { format } from 'date-fns';

interface CollectionDetailProps {
  id: string;
}

export default function CollectionDetail({ id }: CollectionDetailProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites' | 'videos'>('all');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  // Fetch collection details
  const { 
    data: collection,
    isLoading: collectionLoading,
    error: collectionError
  } = useQuery<Collection>({
    queryKey: [`/api/collections/${id}`],
  });

  // Fetch media items in collection
  const {
    data: mediaItems,
    isLoading: mediaLoading,
    error: mediaError
  } = useQuery<MediaItem[]>({
    queryKey: [`/api/collections/${id}/media`],
  });

  // Delete collection mutation
  const deleteCollectionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/collections/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Collection deleted",
        description: "The collection has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete collection. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Upload files mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/collections/${id}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Your media has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/collections/${id}/media`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload media. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Download selected items
  const downloadSelectedItems = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to download.",
        variant: "destructive",
      });
      return;
    }

    // For each selected item, create a download link
    selectedItems.forEach(itemId => {
      const item = mediaItems?.find(media => media.id === itemId);
      if (item) {
        const link = document.createElement('a');
        link.href = item.url;
        link.download = item.filename || `download-${itemId}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });

    toast({
      title: "Download started",
      description: `Downloading ${selectedItems.length} item(s).`,
    });
  };

  // Handle file upload
  const handleFileUpload = (files: FileList) => {
    if (files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    uploadMutation.mutate(formData);
  };

  // Handle drop zone
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  // Filter media items based on search and filter
  const filteredItems = mediaItems?.filter(item => {
    const matchesSearch = searchTerm ? 
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchTerm.toLowerCase())) : 
      true;
    
    const matchesFilter = filter === 'all' ? 
      true : 
      filter === 'favorites' ? 
        item.isFavorite : 
        item.type === 'video';
    
    return matchesSearch && matchesFilter;
  }) || [];

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Open viewer for an item
  const openViewer = (index: number) => {
    setCurrentItemIndex(index);
    setViewerOpen(true);
  };

  // Handle viewer navigation
  const handleViewerNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentItemIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else {
      setCurrentItemIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    }
  };

  const isLoading = collectionLoading || mediaLoading;
  const hasError = collectionError || mediaError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading collection...</p>
      </div>
    );
  }

  if (hasError || !collection) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-gray-700">Failed to load collection details</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-4"
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Link href="/" className="flex items-center text-gray-600 hover:text-[hsl(var(--love-dark))] mb-2 transition duration-300 font-body">
            <ArrowLeft className="mr-2" size={16} /> Back to Collections
          </Link>
          <h2 className="font-display text-2xl text-gray-800 font-bold">{collection.name}</h2>
          <p className="text-gray-600 font-body">
            {mediaItems?.length || 0} items · {format(new Date(collection.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button
            onClick={() => document.getElementById('file-upload-input')?.click()}
            className="bg-[hsl(var(--love-pink))] hover:bg-[hsl(var(--love-red))] text-[hsl(var(--love-dark))] hover:text-white py-2 px-4 rounded-lg transition duration-300 font-body flex items-center"
          >
            <Upload className="mr-2" size={16} /> Upload
            <input
              id="file-upload-input"
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </Button>
          <Button
            onClick={downloadSelectedItems}
            disabled={selectedItems.length === 0}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition duration-300 font-body flex items-center"
          >
            <Download className="mr-2" size={16} /> Download
            {selectedItems.length > 0 && ` (${selectedItems.length})`}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition duration-300">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center font-body cursor-pointer">
                <Edit className="mr-2" size={16} /> Edit Collection
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center font-body cursor-pointer">
                <Share className="mr-2" size={16} /> Share
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center text-red-600 font-body cursor-pointer"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash className="mr-2" size={16} /> Delete Collection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center flex-wrap gap-2">
          <Button
            onClick={() => setFilter('all')}
            className={`${
              filter === 'all' 
                ? 'bg-[hsl(var(--love-pink))] text-[hsl(var(--love-dark))]' 
                : 'bg-white text-gray-600 hover:bg-[hsl(var(--love-pink))] hover:text-[hsl(var(--love-dark))]'
            } px-3 py-1 rounded-full font-body text-sm transition duration-300`}
          >
            All Photos
          </Button>
          <Button
            onClick={() => setFilter('favorites')}
            className={`${
              filter === 'favorites' 
                ? 'bg-[hsl(var(--love-pink))] text-[hsl(var(--love-dark))]' 
                : 'bg-white text-gray-600 hover:bg-[hsl(var(--love-pink))] hover:text-[hsl(var(--love-dark))]'
            } px-3 py-1 rounded-full font-body text-sm transition duration-300 flex items-center`}
          >
            <Heart className="mr-1" size={14} /> Favorites
          </Button>
          <Button
            onClick={() => setFilter('videos')}
            className={`${
              filter === 'videos' 
                ? 'bg-[hsl(var(--love-pink))] text-[hsl(var(--love-dark))]' 
                : 'bg-white text-gray-600 hover:bg-[hsl(var(--love-pink))] hover:text-[hsl(var(--love-dark))]'
            } px-3 py-1 rounded-full font-body text-sm transition duration-300 flex items-center`}
          >
            <Film className="mr-1" size={14} /> Videos
          </Button>
          
          <div className="ml-auto flex items-center space-x-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-[hsl(var(--love-red))] focus:ring focus:ring-[hsl(var(--love-pink))] focus:ring-opacity-50 transition duration-300 font-body w-full"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search size={16} />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewType('grid')}
              className={`text-gray-500 hover:text-[hsl(var(--love-dark))] p-2 rounded-full transition duration-300 ${viewType === 'grid' ? 'text-[hsl(var(--love-dark))]' : ''}`}
              title="Grid View"
            >
              <Grid size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewType('list')}
              className={`text-gray-500 hover:text-[hsl(var(--love-dark))] p-2 rounded-full transition duration-300 ${viewType === 'list' ? 'text-[hsl(var(--love-dark))]' : ''}`}
              title="List View"
            >
              <List size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Media Gallery */}
      <div 
        className={`grid ${viewType === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'} gap-4`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <PhotoCard
              key={item.id}
              item={item}
              onClick={() => openViewer(index)}
              onSelect={() => toggleItemSelection(item.id)}
              isSelected={selectedItems.includes(item.id)}
              viewType={viewType}
            />
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-gray-500">
            <p className="mb-2">No items found{searchTerm ? ' matching your search' : ''}.</p>
            {!searchTerm && (
              <p>Upload some photos or videos to get started!</p>
            )}
          </div>
        )}
        
        {/* Upload Zone */}
        <div 
          className={`upload-zone h-64 rounded-lg flex flex-col items-center justify-center cursor-pointer ${isDragging ? 'dragover' : ''}`}
          onClick={() => document.getElementById('file-upload-input')?.click()}
        >
          <div className="text-[hsl(var(--love-pink))] text-4xl mb-2">
            <Upload size={36} />
          </div>
          <p className="text-[hsl(var(--love-dark))] font-semibold font-body">Upload New</p>
          <p className="text-gray-500 text-sm font-body">Drop files or click to browse</p>
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {viewerOpen && filteredItems.length > 0 && (
        <PhotoViewer
          item={filteredItems[currentItemIndex]}
          onClose={() => setViewerOpen(false)}
          onNext={() => handleViewerNavigation('next')}
          onPrevious={() => handleViewerNavigation('prev')}
          collectionId={id}
        />
      )}

      {/* Delete Collection Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{collection.name}"? This action cannot be undone,
              and all photos and videos in this collection will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCollectionMutation.mutate()}
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
