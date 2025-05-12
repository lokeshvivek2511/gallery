import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { Heart, GalleryThumbnails, Upload, Download, FolderPlus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import UploadModal from './UploadModal';
import CreateCollectionModal from './CreateCollectionModal';

const Header = () => {
  const [location] = useLocation();
  const { selectedMedia, downloadSelected, selectedTab, setSelectedTab } = useApp();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createCollectionModalOpen, setCreateCollectionModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <GalleryThumbnails className="h-6 w-6 text-[#E36588] mr-2" />
              <h1 className="text-2xl md:text-3xl font-dancing text-[#E36588]">Love Gallery</h1>
            </div>
          </Link>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              className="hidden md:flex items-center space-x-1 bg-[#E36588] text-white px-3 py-2 rounded-lg hover:bg-[#D14D72] transition duration-300"
              onClick={() => setCreateCollectionModalOpen(true)}
            >
              <FolderPlus className="h-4 w-4 mr-1" />
              <span>Create Collection</span>
            </Button>
            
            <Button
              variant="ghost"
              className="flex items-center space-x-1 bg-[#E36588] text-white px-3 py-2 rounded-lg hover:bg-[#D14D72] transition duration-300"
              onClick={() => setUploadModalOpen(true)}
            >
              <Upload className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Upload</span>
            </Button>
            
            {selectedMedia.length > 0 && (
              <Button
                variant="ghost"
                className="hidden md:flex items-center space-x-1 bg-[#5A4B53] text-white px-3 py-2 rounded-lg hover:opacity-90 transition duration-300"
                onClick={downloadSelected}
              >
                <Download className="h-4 w-4 mr-1" />
                <span>Download ({selectedMedia.length})</span>
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 px-4 mb-0 overflow-x-auto pb-2 scrollbar-hide border-b">
          <button
            className={`px-4 py-2 ${selectedTab === 'all' ? 'text-[#E36588] border-b-2 border-[#E36588]' : 'text-[#5A4B53] hover:text-[#E36588] border-b-2 border-transparent hover:border-[#F8C8DC]'} font-medium transition-colors`}
            onClick={() => setSelectedTab('all')}
          >
            All Memories
          </button>
          <button
            className={`px-4 py-2 ${selectedTab === 'collections' ? 'text-[#E36588] border-b-2 border-[#E36588]' : 'text-[#5A4B53] hover:text-[#E36588] border-b-2 border-transparent hover:border-[#F8C8DC]'} font-medium transition-colors`}
            onClick={() => setSelectedTab('collections')}
          >
            Collections
          </button>
          <Link href="/recent">
            <button
              className={`px-4 py-2 ${location === '/recent' ? 'text-[#E36588] border-b-2 border-[#E36588]' : 'text-[#5A4B53] hover:text-[#E36588] border-b-2 border-transparent hover:border-[#F8C8DC]'} font-medium transition-colors`}
              onClick={() => setSelectedTab('recent')}
            >
              Recent
            </button>
          </Link>
          <Link href="/favorites">
            <button
              className={`px-4 py-2 ${location === '/favorites' ? 'text-[#E36588] border-b-2 border-[#E36588]' : 'text-[#5A4B53] hover:text-[#E36588] border-b-2 border-transparent hover:border-[#F8C8DC]'} font-medium transition-colors`}
              onClick={() => setSelectedTab('favorites')}
            >
              Favorites
            </button>
          </Link>
        </div>
      </header>
      
      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
      <CreateCollectionModal open={createCollectionModalOpen} onOpenChange={setCreateCollectionModalOpen} />
    </>
  );
};

export default Header;
