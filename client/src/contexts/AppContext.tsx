import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { Collection, Media } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface AppContextType {
  isAuthenticated: boolean;
  authenticate: (password: string) => Promise<boolean>;
  logout: () => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  isUploading: boolean;
  uploadProgress: number;
  uploadMedia: (files: File[], note?: string, collectionId?: number) => Promise<void>;
  selectedMedia: number[];
  toggleSelectMedia: (id: number) => void;
  clearSelectedMedia: () => void;
  downloadSelected: () => void;
  toggleFavorite: (id: number) => Promise<void>;
  viewerOpen: boolean;
  setViewerOpen: (open: boolean) => void;
  currentViewMedia: Media | null;
  setCurrentViewMedia: (media: Media | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedMedia, setSelectedMedia] = useState<number[]>([]);
  const [viewerOpen, setViewerOpen] = useState<boolean>(false);
  const [currentViewMedia, setCurrentViewMedia] = useState<Media | null>(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const authenticate = async (password: string): Promise<boolean> => {
    try {
      await apiRequest('POST', '/api/auth/login', { password });
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Incorrect password. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  const uploadMedia = async (files: File[], note?: string, collectionId?: number) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
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
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const toggleSelectMedia = (id: number) => {
    setSelectedMedia(prev => {
      if (prev.includes(id)) {
        return prev.filter(mediaId => mediaId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const clearSelectedMedia = () => {
    setSelectedMedia([]);
  };

  const downloadSelected = async () => {
    if (selectedMedia.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to download.",
      });
      return;
    }

    try {
      const mediaItems = await queryClient.fetchQuery({
        queryKey: ['/api/media'],
      }) as Media[];
      
      const selectedItems = mediaItems.filter(media => selectedMedia.includes(media.id));
      
      selectedItems.forEach(async (item) => {
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

  const toggleFavorite = async (id: number) => {
    try {
      await apiRequest('PUT', `/api/media/${id}/favorite`);
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/media/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/media/recent'] });
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Failed to update favorite status.",
        variant: "destructive"
      });
    }
  };

  const contextValue: AppContextType = {
    isAuthenticated,
    authenticate,
    logout,
    selectedTab,
    setSelectedTab,
    isUploading,
    uploadProgress,
    uploadMedia,
    selectedMedia,
    toggleSelectMedia,
    clearSelectedMedia,
    downloadSelected,
    toggleFavorite,
    viewerOpen,
    setViewerOpen,
    currentViewMedia,
    setCurrentViewMedia
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
