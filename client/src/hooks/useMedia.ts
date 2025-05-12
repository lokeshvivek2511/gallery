import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from './use-toast';
import { Media } from '@shared/schema';

interface UseMediaReturn {
  allMedia: Media[] | undefined;
  recentMedia: Media[] | undefined;
  favoriteMedia: Media[] | undefined;
  isLoading: boolean;
  uploadMedia: (files: File[], note?: string, collectionId?: number) => Promise<Media[] | undefined>;
  toggleFavorite: (id: number) => Promise<void>;
  deleteMedia: (id: number) => Promise<void>;
  selectedMedia: number[];
  toggleSelectMedia: (id: number) => void;
  clearSelectedMedia: () => void;
  downloadSelected: () => void;
}

/**
 * Hook for media operations
 */
export function useMedia(): UseMediaReturn {
  const [selectedMedia, setSelectedMedia] = useState<number[]>([]);
  const { toast } = useToast();

  // Queries for media data
  const { data: allMedia, isLoading: isLoadingAll } = useQuery<Media[]>({
    queryKey: ['/api/media'],
  });

  const { data: recentMedia, isLoading: isLoadingRecent } = useQuery<Media[]>({
    queryKey: ['/api/media/recent'],
  });

  const { data: favoriteMedia, isLoading: isLoadingFavorites } = useQuery<Media[]>({
    queryKey: ['/api/media/favorites'],
  });

  const isLoading = isLoadingAll || isLoadingRecent || isLoadingFavorites;

  // Toggle media selection for download
  const toggleSelectMedia = (id: number) => {
    setSelectedMedia(prev => {
      if (prev.includes(id)) {
        return prev.filter(mediaId => mediaId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Clear all selections
  const clearSelectedMedia = () => {
    setSelectedMedia([]);
  };

  // Download selected media files
  const downloadSelected = async () => {
    if (selectedMedia.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to download.",
      });
      return;
    }

    try {
      const selectedItems = allMedia?.filter(media => selectedMedia.includes(media.id));
      
      if (!selectedItems || selectedItems.length === 0) {
        throw new Error("Selected items not found");
      }

      selectedItems.forEach(item => {
        const link = document.createElement('a');
        link.href = item.fileUrl;
        link.download = item.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      
      toast({
        title: "Download started",
        description: `Downloading ${selectedItems.length} files.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading your files.",
        variant: "destructive"
      });
    }
  };

  // Upload mutation
  const uploadMedia = async (files: File[], note?: string, collectionId?: number): Promise<Media[] | undefined> => {
    if (files.length === 0) return;
    
    try {
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('files', file);
      });
      
      if (note) formData.append('note', note);
      if (collectionId) formData.append('collectionId', collectionId.toString());
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      toast({
        title: "Upload successful",
        description: `${files.length} files uploaded successfully.`,
      });
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/media/recent'] });
      if (collectionId) {
        queryClient.invalidateQueries({ queryKey: ['/api/collections', collectionId] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      
      return result;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files.",
        variant: "destructive"
      });
    }
  };

  // Toggle favorite mutation
  const favoriteToggle = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PUT', `/api/media/${id}/favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/media/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/media/recent'] });
    },
    onError: () => {
      toast({
        title: "Action failed",
        description: "Failed to update favorite status.",
        variant: "destructive"
      });
    }
  });

  // Delete media mutation
  const mediaDelete = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/media/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/media/recent'] });
      
      // Clear selection if deleted media was selected
      setSelectedMedia(prev => prev.filter(id => !selectedMedia.includes(id)));
      
      toast({
        title: "Media deleted",
        description: "The media has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete the media. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    allMedia,
    recentMedia,
    favoriteMedia,
    isLoading,
    uploadMedia,
    toggleFavorite: favoriteToggle.mutate,
    deleteMedia: mediaDelete.mutate,
    selectedMedia,
    toggleSelectMedia,
    clearSelectedMedia,
    downloadSelected
  };
}
