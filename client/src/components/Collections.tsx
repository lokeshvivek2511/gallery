import { useQuery } from '@tanstack/react-query';
import { FolderPlus, Folder } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';
import CreateCollectionModal from './CreateCollectionModal';
import { Skeleton } from '@/components/ui/skeleton';

interface CollectionWithCount extends Collection {
  mediaCount: number;
}

interface Collection {
  id: number;
  name: string;
  description?: string;
  coverImageUrl?: string;
  createdAt: string;
}

const Collections = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  const { data: collections, isLoading } = useQuery<CollectionWithCount[]>({
    queryKey: ['/api/collections'],
  });

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-dancing text-[#D14D72] mb-4">Our Collections</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
              <Skeleton className="h-32 w-full" />
              <div className="p-3">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mb-8">
        <h2 className="text-2xl font-dancing text-[#D14D72] mb-4">Our Collections</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {collections && collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.id}`}>
              <div className="collection-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 cursor-pointer">
                {collection.coverImageUrl ? (
                  <div 
                    className="h-32 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${collection.coverImageUrl})` }}
                  ></div>
                ) : (
                  <div className="h-32 bg-[#F8C8DC] flex items-center justify-center">
                    <Folder className="h-12 w-12 text-[#E36588]" />
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-medium text-[#5A4B53] truncate">{collection.name}</h3>
                  <p className="text-xs text-gray-500">{collection.mediaCount} items</p>
                </div>
              </div>
            </Link>
          ))}
          
          <div 
            className="collection-card bg-[#F8C8DC] bg-opacity-30 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 border-2 border-dashed border-[#E36588] cursor-pointer flex flex-col items-center justify-center h-full min-h-[128px]"
            onClick={() => setCreateModalOpen(true)}
          >
            <FolderPlus className="h-8 w-8 text-[#E36588] mb-2" />
            <p className="text-sm text-[#E36588] font-medium">Create New</p>
          </div>
        </div>
      </section>
      
      <CreateCollectionModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </>
  );
};

export default Collections;
