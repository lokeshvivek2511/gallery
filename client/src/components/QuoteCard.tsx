import { useEffect, useState } from 'react';
import { loveQuotes } from '../lib/quotes';

const QuoteCard = () => {
  const [quote, setQuote] = useState({ text: '', author: '' });
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * loveQuotes.length);
    setQuote(loveQuotes[randomIndex]);
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#E36588] to-[#FF4D6D] text-white p-6 rounded-xl shadow-md mb-8">
      <div className="flex items-start">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 opacity-80 mr-3 mt-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 10.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2m8-2c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2m-8 6c-1.1 0-3-.3-3-2v-1m12 3c-1.1 0-3-.3-3-2v-1m-9-5l3-3m12 0l-3-3" 
          />
        </svg>
        <div>
          <p className="font-dancing text-xl md:text-2xl">{quote.text}</p>
          {quote.author && (
            <p className="mt-2 text-sm opacity-80 text-right">— {quote.author}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;
