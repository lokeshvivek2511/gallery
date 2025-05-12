import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoveQuote from '@/components/LoveQuote';
import CollectionDetail from '@/components/gallery/CollectionDetail';
import CreateCollectionModal from '@/components/collections/CreateCollectionModal';

interface CollectionPageProps {
  params: {
    id: string;
  };
}

export default function Collection({ params }: CollectionPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { id } = params;

  return (
    <>
      <Header onCreateCollection={() => setIsCreateModalOpen(true)} />
      <LoveQuote />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <CollectionDetail id={id} />
      </main>
      
      <Footer />
      
      <CreateCollectionModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
