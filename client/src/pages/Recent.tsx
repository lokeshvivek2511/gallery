import Header from '@/components/Header';
import MediaGallery from '@/components/MediaGallery';
import MobileNavBar from '@/components/MobileNavBar';
import QuoteCard from '@/components/QuoteCard';

const Recent = () => {
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-6 mb-16 md:mb-0">
        <QuoteCard />
        <MediaGallery 
          title="Recent Memories" 
          endpoint="/api/media/recent" 
        />
      </main>
      
      <MobileNavBar />
    </>
  );
};

export default Recent;
