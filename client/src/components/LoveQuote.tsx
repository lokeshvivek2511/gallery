import { useState, useEffect } from 'react';
import { quotes } from '@/assets/quotes';

export default function LoveQuote() {
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % quotes.length;
        setCurrentQuote(quotes[newIndex]);
        return newIndex;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[hsl(var(--love-pink))] bg-opacity-30 py-4">
      <div className="container mx-auto px-6">
        <blockquote className="italic text-center text-gray-700 font-body quote-text">
          <span>{currentQuote}</span>
        </blockquote>
      </div>
    </div>
  );
}
