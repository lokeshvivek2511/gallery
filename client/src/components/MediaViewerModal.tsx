import { useRef, useEffect } from 'react';
import { X, Download, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../contexts/AppContext';
import { useQuery } from '@tanstack/react-query';
import { Media } from '@shared/schema';

const MediaViewerModal = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { 
    viewerOpen, 
    setViewerOpen, 
    currentViewMedia, 
    setCurrentViewMedia,
    toggleFavorite
  } = useApp();
  
  // Get all media to navigate between items
  const { data: allMedia } = useQuery<Media[]>({
    queryKey: ['/api/media'],
    enabled: viewerOpen,
  });
  
  useEffect(() => {
    // Auto-play videos when they're loaded in the viewer
    if (viewerOpen && currentViewMedia?.fileType === 'video' && videoRef.current) {
      videoRef.current.play().catch(e => console.error('Error playing video:', e));
    }
  }, [viewerOpen, currentViewMedia]);
  
  if (!viewerOpen || !currentViewMedia) return null;
  
  const navigateMedia = (direction: 'next' | 'prev') => {
    if (!allMedia || allMedia.length <= 1) return;
    
    const currentIndex = allMedia.findIndex(item => item.id === currentViewMedia.id);
    
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex === allMedia.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? allMedia.length - 1 : currentIndex - 1;
    }
    
    setCurrentViewMedia(allMedia[newIndex]);
  };
  
  const handleClose = () => {
    setViewerOpen(false);
    setTimeout(() => setCurrentViewMedia(null), 300);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };
  
  const formattedDate = currentViewMedia.createdAt 
    ? format(new Date(currentViewMedia.createdAt), 'MMMM d, yyyy')
    : '';
  
  return (
    <div className="fixed inset-0 z-50 bg-[#5A4B53] bg-opacity-90">
      <div className="absolute inset-0 flex flex-col">
        <div className="flex justify-between items-center p-4 text-white">
          <div>
            <h3 className="text-lg font-medium">{currentViewMedia.fileName}</h3>
            {currentViewMedia.collectionId && (
              <p className="text-sm opacity-80">
                {formattedDate}
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
              title={currentViewMedia.isFavorite ? "Remove from favorites" : "Add to favorites"}
              onClick={() => toggleFavorite(currentViewMedia.id)}
            >
              <Heart 
                className={`h-6 w-6 ${currentViewMedia.isFavorite ? 'fill-[#FF4D6D]' : ''}`} 
              />
            </button>
            <button 
              title="Close"
              onClick={handleClose}
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
              ref={videoRef}
              src={currentViewMedia.fileUrl}
              controls
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          )}
        </div>
        
        <div className="flex justify-between items-center p-4 text-white">
          <button
            onClick={() => navigateMedia('prev')}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          
          {currentViewMedia.note && (
            <p className="font-dancing text-xl">{currentViewMedia.note}</p>
          )}
          
          <button
            onClick={() => navigateMedia('next')}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaViewerModal;
