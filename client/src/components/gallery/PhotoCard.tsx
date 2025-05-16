import { useState } from 'react';
import { MediaItem } from '@shared/schema';
import { Heart, Download, Play } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';

interface PhotoCardProps {
  item: MediaItem;
  onClick: () => void;
  onSelect: () => void;
  isSelected: boolean;
  viewType: 'grid' | 'list';
}

export default function PhotoCard({ item, onClick, onSelect, isSelected, viewType }: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PATCH', `/api/media/${item.id}/favorite`, {
        isFavorite: !item.isFavorite
      });
      return response;
    },
    onMutate: async () => {
      // Optimistic update
      const queryKey = [`/api/collections/${item.collectionId}/media`];
      await queryClient.cancelQueries({ queryKey });

      const previousMedia = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: MediaItem[] | undefined) => {
        if (!old) return [];
        return old.map(media => 
          media.id === item.id 
            ? { ...media, isFavorite: !media.isFavorite }
            : media
        );
      });

      return { previousMedia };
    },
    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousMedia) {
        queryClient.setQueryData(
          [`/api/collections/${item.collectionId}/media`],
          context.previousMedia
        );
      }
      console.error('Error toggling favorite:', err);
    },
    onSettled: () => {
      // Always refetch to ensure sync with server
      queryClient.invalidateQueries({ 
        queryKey: [`/api/collections/${item.collectionId}/media`] 
      });
    }
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavoriteMutation.mutate();
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.filename || `download-${item.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  if (viewType === 'list') {
    return (
      <div 
        className="photo-card relative bg-white rounded-lg overflow-hidden shadow-sm flex items-center p-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-16 w-16 mr-4 flex-shrink-0">
          <div className="absolute inset-0 flex items-center justify-center">
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-md">
                <Play fill="white" className="text-white" size={24} />
              </div>
            )}
            <img 
              src={item.thumbnail || item.url} 
              alt={item.filename} 
              className="w-full h-full object-cover rounded-md"
              onClick={onClick}
            />
          </div>
        </div>
        
        <div className="flex-grow" onClick={onClick}>
          <h3 className="font-medium truncate">{item.filename}</h3>
          <p className="text-gray-500 text-sm">
            {format(new Date(item.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            className={`p-1 rounded-full ${item.isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            onClick={handleToggleFavorite}
          >
            <Heart size={16} fill={item.isFavorite ? "currentColor" : "none"} />
          </button>
          <button 
            className="p-1 text-gray-400 hover:text-blue-500"
            onClick={handleDownload}
          >
            <Download size={16} />
          </button>
          <div onClick={handleCheckboxClick}>
            <Checkbox checked={isSelected} className="h-5 w-5 accent-[hsl(var(--love-red))] rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="photo-card relative group rounded-lg overflow-hidden shadow-sm cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={item.thumbnail || item.url} 
          alt={item.filename} 
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <Play fill="white" className="text-white h-16 w-16" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition duration-300"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition duration-300">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold truncate">{item.description || item.filename}</span>
            <div className="flex space-x-2">
              <button 
                className={`hover:text-[hsl(var(--love-pink))] transition duration-300 ${item.isFavorite ? 'text-red-500' : ''}`}
                onClick={handleToggleFavorite}
              >
                <Heart size={16} fill={item.isFavorite ? "currentColor" : "none"} />
              </button>
              <button 
                className="hover:text-[hsl(var(--love-pink))] transition duration-300"
                onClick={handleDownload}
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div 
        className={`absolute top-2 right-2 ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'} transition duration-300`}
        onClick={handleCheckboxClick}
      >
        <Checkbox checked={isSelected} className="h-5 w-5 accent-[hsl(var(--love-red))] rounded-md" />
      </div>
    </div>
  );
}
