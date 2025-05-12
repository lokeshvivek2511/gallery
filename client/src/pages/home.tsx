import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoveQuote from '@/components/LoveQuote';
import CollectionsGrid from '@/components/collections/CollectionsGrid';
import CreateCollectionModal from '@/components/collections/CreateCollectionModal';

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <Header onCreateCollection={() => setIsCreateModalOpen(true)} />
      <LoveQuote />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <CollectionsGrid onCreateNew={() => setIsCreateModalOpen(true)} />
      </main>
      
      <Footer />
      
      <CreateCollectionModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
