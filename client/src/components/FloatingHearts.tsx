import { Heart } from 'lucide-react';

export default function FloatingHearts() {
  // Create an array of hearts with different positions and animations
  const hearts = [
    { left: '5%', delay: '0s', size: 'text-2xl', color: 'text-pink-300' },
    { left: '15%', delay: '2s', size: 'text-xl', color: 'text-pink-400' },
    { left: '25%', delay: '5s', size: 'text-3xl', color: 'text-red-300' },
    { left: '40%', delay: '0s', size: 'text-xl', color: 'text-pink-300' },
    { left: '60%', delay: '7s', size: 'text-2xl', color: 'text-red-400' },
    { left: '75%', delay: '3s', size: 'text-xl', color: 'text-pink-400' },
    { left: '85%', delay: '6s', size: 'text-2xl', color: 'text-red-300' },
    { left: '95%', delay: '1s', size: 'text-xl', color: 'text-pink-300' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {hearts.map((heart, index) => {
        const duration = 15 + Math.random() * 10;
        
        return (
          <div 
            key={index}
            className={`floating-heart ${heart.color} ${heart.size}`}
            style={{
              left: heart.left,
              animation: `float-up ${duration}s linear infinite ${heart.delay}`,
            }}
          >
            <Heart fill="currentColor" />
          </div>
        );
      })}
    </div>
  );
}
