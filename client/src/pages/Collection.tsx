import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import MediaGallery from '@/components/MediaGallery';
import MobileNavBar from '@/components/MobileNavBar';
import { Skeleton } from '@/components/ui/skeleton';

const Collection = () => {
  const { id } = useParams();
  const collectionId = id ? parseInt(id) : null;
  
  const { data: collection, isLoading } = useQuery({
    queryKey: ['/api/collections', collectionId],
    enabled: !!collectionId,
  });

  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-6 mb-16 md:mb-0">
        {isLoading ? (
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        ) : (
          collection && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-dancing text-[#D14D72]">{collection.name}</h1>
                {collection.description && (
                  <p className="text-[#5A4B53] mt-2">{collection.description}</p>
                )}
              </div>
              
              <MediaGallery 
                title={`Memories in ${collection.name}`} 
                collectionId={collectionId || undefined} 
              />
            </>
          )
        )}
      </main>
      
      <MobileNavBar />
    </>
  );
};

export default Collection;
