import Header from '@/components/Header';
import MediaGallery from '@/components/MediaGallery';
import MobileNavBar from '@/components/MobileNavBar';
import QuoteCard from '@/components/QuoteCard';

const Favorites = () => {
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-6 mb-16 md:mb-0">
        <QuoteCard />
        <MediaGallery 
          title="Favorite Memories" 
          endpoint="/api/media/favorites" 
        />
      </main>
      
      <MobileNavBar />
    </>
  );
};

export default Favorites;
