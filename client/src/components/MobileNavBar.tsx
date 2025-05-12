import { Home, FolderOpen, Upload, Download } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import UploadModal from './UploadModal';

const MobileNavBar = () => {
  const [location] = useLocation();
  const { setSelectedTab } = useApp();
  const [selectedMedia, setSelectedMedia] = useState<number[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  
  const downloadSelected = () => {
    // Simplified download function
    alert('Download functionality temporarily disabled during development');
  };

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40 px-4 py-3 flex justify-around">
        <Link href="/">
          <button 
            className={`flex flex-col items-center ${location === '/' ? 'text-[#E36588]' : 'text-[#5A4B53]'}`}
            onClick={() => setSelectedTab('all')}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
        </Link>
        
        <Link href="/">
          <button 
            className={`flex flex-col items-center ${location.includes('/collections') ? 'text-[#E36588]' : 'text-[#5A4B53]'}`}
            onClick={() => setSelectedTab('collections')}
          >
            <FolderOpen className="h-5 w-5" />
            <span className="text-xs mt-1">Collections</span>
          </button>
        </Link>
        
        <button 
          className="flex flex-col items-center text-[#5A4B53]"
          onClick={() => setUploadModalOpen(true)}
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs mt-1">Upload</span>
        </button>
        
        <button 
          className={`flex flex-col items-center ${selectedMedia.length > 0 ? 'text-[#E36588]' : 'text-[#5A4B53]'}`}
          onClick={downloadSelected}
        >
          <Download className="h-5 w-5" />
          <span className="text-xs mt-1">
            {selectedMedia.length > 0 ? `Download (${selectedMedia.length})` : 'Download'}
          </span>
        </button>
      </div>
      
      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </>
  );
};

export default MobileNavBar;
