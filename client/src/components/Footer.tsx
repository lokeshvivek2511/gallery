import { Heart, Instagram, Mail } from 'lucide-react';
import { FaPinterest } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm font-body">
              &copy; {new Date().getFullYear()} Love Memories. All memories preserved with love.
            </p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-[hsl(var(--love-red))] transition duration-300">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-[hsl(var(--love-red))] transition duration-300">
              <FaPinterest size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-[hsl(var(--love-red))] transition duration-300">
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
