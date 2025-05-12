import { useQuery } from '@tanstack/react-query';
import { Heart, Download, CheckCircle, Play, X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Media } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface MediaGalleryProps {
  title?: string;
  endpoint?: string;
  collectionId?: number;
}

const MediaGallery = ({ title = "Our Memories", endpoint = "/api/media", collectionId }: MediaGalleryProps) => {
  // Local state variables instead of context
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentViewMedia, setCurrentViewMedia] = useState<Media | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<number[]>([]);
  
  // Simplified toggle functions
  const toggleFavorite = async (id: number) => {
    console.log('Toggle favorite temporarily disabled during development');
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
  
  const queryKey = collectionId 
    ? ['/api/collections', collectionId] 
    : [endpoint];
    
  const { data, isLoading } = useQuery<any>({
    queryKey,
  });
  
  const mediaItems: Media[] = collectionId 
    ? (data?.media || []) 
    : (data || []);
    
  const handleMediaClick = (media: Media) => {
    setCurrentViewMedia(media);
    setViewerOpen(true);
  };

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-dancing text-[#D14D72] mb-4">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="relative rounded-xl overflow-hidden">
              <Skeleton className="w-full h-60" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-dancing text-[#D14D72] mb-4">{title}</h2>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-[#5A4B53] mb-2">No memories found.</p>
          <p className="text-sm text-gray-500">Upload some photos or videos to create beautiful memories together.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mb-8">
        <h2 className="text-2xl font-dancing text-[#D14D72] mb-4">{title}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <div key={item.id} className="masonry-item relative group">
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex space-x-1">
                  <button 
                    className="bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 rounded-full text-[#5A4B53] hover:text-[#E36588] transition" 
                    title="Download"
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = document.createElement('a');
                      link.href = item.fileUrl;
                      link.download = item.fileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button 
                    className="bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 rounded-full text-[#5A4B53] hover:text-[#E36588] transition" 
                    title={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                  >
                    <Heart 
                      className={`h-4 w-4 ${item.isFavorite ? 'fill-[#FF4D6D] text-[#FF4D6D]' : ''}`} 
                    />
                  </button>
                  <button 
                    className="bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 rounded-full text-[#5A4B53] hover:text-[#E36588] transition" 
                    title={selectedMedia.includes(item.id) ? "Deselect" : "Select"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectMedia(item.id);
                    }}
                  >
                    <CheckCircle 
                      className={`h-4 w-4 ${selectedMedia.includes(item.id) ? 'fill-[#E36588] text-white' : ''}`} 
                    />
                  </button>
                </div>
              </div>
              
              {item.fileType === 'image' ? (
                <img 
                  src={item.fileUrl} 
                  alt={item.fileName}
                  className="w-full rounded-xl shadow-md hover:shadow-lg transition cursor-pointer object-cover"
                  onClick={() => handleMediaClick(item)}
                />
              ) : (
                <div 
                  className="relative cursor-pointer"
                  onClick={() => handleMediaClick(item)}
                >
                  <video 
                    src={item.fileUrl} 
                    className="w-full rounded-xl shadow-md hover:shadow-lg transition"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-[#E36588] ml-1" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      
      {viewerOpen && currentViewMedia && (
        <div className="fixed inset-0 z-50 bg-[#5A4B53] bg-opacity-90">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex justify-between items-center p-4 text-white">
              <div>
                <h3 className="text-lg font-medium">{currentViewMedia.fileName}</h3>
                {currentViewMedia.createdAt && (
                  <p className="text-sm opacity-80">
                    {new Date(currentViewMedia.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex space-x-4">
                <button 
                  title="Download"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = currentViewMedia.fileUrl;
                    link.download = currentViewMedia.fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="h-6 w-6" />
                </button>
                <button 
                  title="Close"
                  onClick={() => setViewerOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-4">
              {currentViewMedia.fileType === 'image' ? (
                <img 
                  src={currentViewMedia.fileUrl} 
                  alt={currentViewMedia.fileName} 
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              ) : (
                <video 
                  src={currentViewMedia.fileUrl}
                  controls
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaGallery;
