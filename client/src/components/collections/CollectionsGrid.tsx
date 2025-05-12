import { useState } from 'react';
import { Grid, List, AlertCircle } from 'lucide-react';
import CollectionCard from './CollectionCard';
import { Collection } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface CollectionsGridProps {
  onCreateNew: () => void;
}

export default function CollectionsGrid({ onCreateNew }: CollectionsGridProps) {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  
  const { data: collections, isLoading, error } = useQuery({
    queryKey: ['/api/collections'],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading collections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <AlertCircle className="text-red-500 mb-2" size={32} />
        <p className="text-gray-700">Failed to load collections</p>
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
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl text-gray-800 font-bold">Our Collections</h2>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewType('grid')}
            className={`text-gray-500 hover:text-[hsl(var(--love-dark))] p-2 rounded-full transition duration-300 ${viewType === 'grid' ? 'text-[hsl(var(--love-dark))]' : ''}`}
            title="Grid View"
          >
            <Grid size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewType('list')}
            className={`text-gray-500 hover:text-[hsl(var(--love-dark))] p-2 rounded-full transition duration-300 ${viewType === 'list' ? 'text-[hsl(var(--love-dark))]' : ''}`}
            title="List View"
          >
            <List size={18} />
          </Button>
        </div>
      </div>
      
      <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        {collections && collections.length > 0 ? (
          collections.map((collection: Collection) => (
            <CollectionCard 
              key={collection.id} 
              collection={collection} 
              viewType={viewType}
            />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center py-10">
            No collections yet. Create your first collection to get started!
          </p>
        )}
        
        {/* Create New Collection Card */}
        <div 
          onClick={onCreateNew}
          className="photo-card bg-white rounded-lg shadow-md overflow-hidden border-2 border-dashed border-[hsl(var(--love-pink))] hover:border-[hsl(var(--love-red))] cursor-pointer transition duration-300 h-64"
        >
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="text-[hsl(var(--love-pink))] text-5xl mb-4">
              <Heart fill="currentColor" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2 text-[hsl(var(--love-dark))]">Create New Collection</h3>
            <p className="text-gray-500 text-sm font-body">Start a new journey of memories</p>
          </div>
        </div>
      </div>
    </section>
  );
}
