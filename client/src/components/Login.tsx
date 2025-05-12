import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Heart } from 'lucide-react';
import { checkPassword } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import FloatingHearts from './FloatingHearts';

interface LoginProps {
  onAuthenticated: () => void;
}

export default function Login({ onAuthenticated }: LoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (checkPassword(password)) {
      onAuthenticated();
    } else {
      toast({
        title: "Invalid password",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[hsl(var(--love-light))]">
      <FloatingHearts />
      <Card className="w-full max-w-md mx-4 relative overflow-hidden bg-white p-8 shadow-xl">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[hsl(var(--love-pink))] rounded-full opacity-50"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[hsl(var(--love-pink))] rounded-full opacity-50"></div>
        
        <CardContent className="p-0 relative z-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[hsl(var(--love-dark))] mb-2 text-center">Love Memories</h1>
          <p className="text-gray-600 mb-6 italic quote-text font-body text-center">Where cherished moments live forever</p>
          
          <div className="mb-6 w-48 h-48 mx-auto relative">
            <img 
              src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
              alt="Couple embracing" 
              className="w-full h-full object-cover rounded-full border-4 border-[hsl(var(--love-pink))] shadow-lg animate-float"
            />
            <div className="absolute -bottom-2 -right-2 text-[hsl(var(--love-red))] text-2xl animate-float-delay">
              <Heart fill="currentColor" />
            </div>
            <div className="absolute -top-2 -left-2 text-[hsl(var(--love-red))] text-2xl animate-float-delay-2">
              <Heart fill="currentColor" />
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="relative mb-6">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[hsl(var(--love-red))] font-body"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[hsl(var(--love-red))] hover:bg-[hsl(var(--love-dark))] text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg font-body"
            >
              Unlock Memories <Heart className="ml-2" size={16} />
            </Button>
          </form>
          
          <p className="text-sm text-gray-500 mt-4 font-body text-center">Default password: "lokiroja"</p>
        </CardContent>
      </Card>
    </div>
  );
}
