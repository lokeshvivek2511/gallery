import { useEffect, useRef } from 'react';

interface HeartProps {
  left: string;
  delay: number;
  duration: number;
  size: number;
}

const HeartAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heartsRef = useRef<HeartProps[]>([]);
  
  useEffect(() => {
    // Generate random hearts periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && containerRef.current) {
        createHeart();
      }
    }, 500);
    
    // Initial hearts
    createHeart();
    createHeart();
    
    return () => clearInterval(interval);
  }, []);
  
  const createHeart = () => {
    if (!containerRef.current) return;
    
    const size = Math.floor(Math.random() * 20) + 10;
    const left = `${Math.random() * 100}%`;
    const delay = Math.random() * 2;
    const duration = Math.random() * 5 + 5;
    
    const heart = document.createElement('div');
    heart.classList.add('floating-heart');
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.left = left;
    heart.style.animationDelay = `${delay}s`;
    heart.style.animationDuration = `${duration}s`;
    
    containerRef.current.appendChild(heart);
    
    // Remove heart after animation completes
    setTimeout(() => {
      if (containerRef.current && containerRef.current.contains(heart)) {
        containerRef.current.removeChild(heart);
      }
    }, (delay + duration) * 1000);
  };

  return (
    <div 
      ref={containerRef} 
      className="heart-overlay"
      aria-hidden="true"
    ></div>
  );
};

export default HeartAnimation;
