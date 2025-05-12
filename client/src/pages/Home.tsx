import Header from '@/components/Header';
import Collections from '@/components/Collections';
import QuoteCard from '@/components/QuoteCard';
import MediaGallery from '@/components/MediaGallery';
import MobileNavBar from '@/components/MobileNavBar';
import { useApp } from '../contexts/AppContext';

const Home = () => {
  const { selectedTab } = useApp();

  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-6 mb-16 md:mb-0">
        {/* Always show Collections for browsing categories */}
        <Collections />
        
        {/* Show the rest of the content only when not in collections tab */}
        {selectedTab !== 'collections' && (
          <>
            <QuoteCard />
            <MediaGallery />
          </>
        )}
      </main>
      
      <MobileNavBar />
    </>
  );
};

export default Home;
