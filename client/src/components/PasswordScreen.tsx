import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HeartIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useApp } from '../contexts/AppContext';

const PasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setIsAuthenticated } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // The default password is "lokiroja"
      if (password === 'lokiroja') {
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
      } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
        toast({
          title: "Authentication failed",
          description: "Incorrect password. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8C8DC] p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <div className="flex justify-center mb-6">
          <HeartIcon className="h-16 w-16 text-[#FF4D6D] animate-heartbeat" />
        </div>
        
        <h1 className="text-4xl font-dancing text-center text-[#E36588] mb-6">Our Love Gallery</h1>
        <p className="text-center text-[#5A4B53] mb-8 font-poppins">Enter our secret password to unlock our memories</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border-2 ${error ? 'border-[#FF4D6D]' : 'border-[#F8C8DC]'} rounded-lg focus:outline-none focus:border-[#E36588]`}
              placeholder="Password"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-[#FF4D6D]">Incorrect password. Try again!</p>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#E36588] hover:bg-[#D14D72] text-white font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            {isSubmitting ? 'Unlocking...' : 'Unlock Our Memories'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xl text-[#5A4B53] italic font-dancing">"Every moment with you is a treasure worth keeping"</p>
        </div>
      </div>
    </div>
  );
};

export default PasswordScreen;
