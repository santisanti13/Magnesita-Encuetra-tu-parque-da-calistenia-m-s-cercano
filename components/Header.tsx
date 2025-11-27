import React from 'react';
import { Dumbbell } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="bg-white text-black p-1.5 rounded-lg group-hover:scale-105 transition-transform duration-300">
            <Dumbbell className="w-5 h-5" strokeWidth={3} />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            Calistenia<span className="text-zinc-500 font-medium">Locator</span>
          </h1>
        </div>
        
        <nav className="hidden sm:flex gap-6 text-sm font-medium text-zinc-400">
          <span className="hover:text-white transition-colors cursor-pointer">Explorar</span>
          <span className="hover:text-white transition-colors cursor-pointer">Sobre nosotros</span>
        </nav>
      </div>
    </header>
  );
};