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
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] selection:bg-black selection:text-white">
      <Header />

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-purple-100/40 to-blue-50/40 blur-[120px]" />
        <div className="absolute top-[10%] right-[0%] w-[50%] h-[50%] rounded-full bg-gradient-to-bl from-emerald-50/60 to-yellow-50/40 blur-[100px]" />
      </div>

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-6 pt-32 pb-12">
        
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100/80 border border-gray-200 mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium text-gray-600">Potenciado por Google Gemini</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6 leading-[1.1]">
            Encuentra tu próximo <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
              parque de calistenia
            </span>
          </h2>
          
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Explora los mejores spots para entrenar al aire libre en España. 
            Usa nuestra IA para localizar barras y equipamiento cerca de ti.
          </p>

          {/* Search Bar Component */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
            
            <div className="relative flex items-center bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-shadow duration-300 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              
              <div className="pl-4 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              
              <input
                type="text"
                className="flex-1 w-full px-4 py-3 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-base"
                placeholder="¿Dónde quieres entrenar? (ej: Madrid Río)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <div className="flex items-center gap-2 pr-2">
                <button
                  type="button"
                  onClick={handleLocationSearch}
                  className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                  title="Usar mi ubicación"
                >
                  <MapPin className="w-5 h-5" />
                </button>
                
                <button
                  type="submit"
                  disabled={status === AppStatus.LOADING}
                  className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-gray-200 active:scale-95"
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
             <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
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
      <footer className="border-t border-gray-200/60 mt-auto backdrop-blur-sm bg-white/40">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Calistenia Locator.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-black transition-colors">Privacidad</a>
            <a href="#" className="hover:text-black transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;