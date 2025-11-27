import React, { useState } from 'react';
import { Header } from './components/Header';
import { ResultsView } from './components/ResultsView';
import { searchParks } from './services/geminiService';
import { AppStatus, SearchResult, Location } from './types';
import { Search, MapPin, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [searchData, setSearchData] = useState<SearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setStatus(AppStatus.LOADING);
    setErrorMsg(null);
    setSearchData(null);

    try {
      const result = await searchParks(query);
      setSearchData(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err) {
      setErrorMsg("Ocurrió un error al buscar parques. Por favor intenta de nuevo.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleLocationSearch = () => {
    if (!navigator.geolocation) {
      setErrorMsg("La geolocalización no es soportada por tu navegador.");
      return;
    }

    setStatus(AppStatus.LOADING);
    setErrorMsg(null);
    setSearchData(null);
    setQuery("Ubicación actual");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLoc: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        try {
          const result = await searchParks("cerca de mí", userLoc);
          setSearchData(result);
          setStatus(AppStatus.SUCCESS);
        } catch (err) {
           setErrorMsg("Error al buscar cerca de tu ubicación.");
           setStatus(AppStatus.ERROR);
        }
      },
      (err) => {
        console.error(err);
        setErrorMsg("No se pudo obtener tu ubicación. Revisa los permisos.");
        setStatus(AppStatus.IDLE);
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] selection:bg-orange-500 selection:text-white">
      <Header />

      {/* Decorative Background Elements - Dark Mode */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle orange glow top left */}
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 blur-[120px]" />
        {/* Subtle blue glow bottom right */}
        <div className="absolute top-[20%] right-[0%] w-[40%] h-[60%] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-6 pt-32 pb-12">
        
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-xs font-medium text-zinc-400">Potenciado por Google Gemini</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 leading-[1.1]">
            Encuentra tu próximo <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              Street Workout
            </span>
          </h2>
          
          <p className="text-lg text-zinc-400 mb-12 max-w-xl mx-auto leading-relaxed">
            Explora los mejores spots para entrenar al aire libre. 
            IA avanzada para localizar barras y equipamiento cerca de ti.
          </p>

          {/* Search Bar Component - Dark Style */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
            {/* Glow effect behind search */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex items-center bg-[#18181b] p-2 rounded-2xl border border-white/10 transition-all duration-300 focus-within:border-white/20 focus-within:bg-[#202024]">
              
              <div className="pl-4 text-zinc-500">
                <Search className="w-5 h-5" />
              </div>
              
              <input
                type="text"
                className="flex-1 w-full px-4 py-3 bg-transparent border-none outline-none text-white placeholder-zinc-500 text-base"
                placeholder="¿Dónde quieres entrenar? (ej: Valencia)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <div className="flex items-center gap-2 pr-2">
                <button
                  type="button"
                  onClick={handleLocationSearch}
                  className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  title="Usar mi ubicación"
                >
                  <MapPin className="w-5 h-5" />
                </button>
                
                <button
                  type="submit"
                  disabled={status === AppStatus.LOADING}
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-white/5 active:scale-95"
                >
                  {status === AppStatus.LOADING ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Buscar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error State */}
        {status === AppStatus.ERROR && errorMsg && (
          <div className="max-w-md mx-auto mb-12 animate-in fade-in zoom-in-95 duration-300">
             <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
               <AlertCircle className="w-5 h-5 shrink-0" />
               {errorMsg}
             </div>
          </div>
        )}

        {/* Results Area */}
        <div className="transition-all duration-500 ease-out">
          {searchData && status !== AppStatus.LOADING && (
            <ResultsView data={searchData} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-auto bg-[#09090b]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} Calistenia Locator.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;