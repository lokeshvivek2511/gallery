import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  onCreateCollection: () => void;
}

export default function Header({ onCreateCollection }: HeaderProps) {
  const { setAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-md px-6 py-4 sticky top-0 z-30">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <Link href="/">
            <a className="flex items-center">
              <Heart className="text-[hsl(var(--love-red))] mr-2" size={24} fill="currentColor" />
              <h1 className="font-display text-2xl font-bold text-[hsl(var(--love-dark))]">Love Memories</h1>
            </a>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={onCreateCollection}
            className="flex items-center bg-[hsl(var(--love-pink))] hover:bg-[hsl(var(--love-red))] text-[hsl(var(--love-dark))] hover:text-white py-2 px-4 rounded-full transition duration-300 font-body"
          >
            <Plus className="mr-2" size={16} /> New Collection
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1 text-gray-600 hover:text-[hsl(var(--love-dark))] transition duration-300">
                <span className="font-body">Our Story</span>
                <Avatar className="w-10 h-10 rounded-full border-2 border-[hsl(var(--love-pink))]">
                  <AvatarImage src="https://images.unsplash.com/photo-1522771930-78848d9293e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40" alt="User Profile" />
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="font-body cursor-pointer">Settings</DropdownMenuItem>
              <DropdownMenuItem className="font-body cursor-pointer">Help</DropdownMenuItem>
              <DropdownMenuItem 
                className="font-body cursor-pointer" 
                onClick={() => setAuthenticated(false)}
              >
                Lock App
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
