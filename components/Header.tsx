import React from 'react';
import { Dumbbell } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="bg-black text-white p-1.5 rounded-lg group-hover:scale-105 transition-transform duration-300">
            <Dumbbell className="w-5 h-5" strokeWidth={3} />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900">
            Calistenia<span className="text-gray-400 font-medium">Locator</span>
          </h1>
        </div>
        
        <nav className="hidden sm:flex gap-6 text-sm font-medium text-gray-500">
          <span className="hover:text-black transition-colors cursor-pointer">Explorar</span>
          <span className="hover:text-black transition-colors cursor-pointer">Sobre nosotros</span>
        </nav>
      </div>
    </header>
  );
};