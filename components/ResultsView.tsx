import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MapPin, ExternalLink, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { SearchResult, GroundingChunk } from '../types';
import { generateParkImage } from '../services/geminiService';

interface ResultsViewProps {
  data: SearchResult;
}

// Sub-component for individual park cards to handle their own image state
const ParkCard: React.FC<{ chunk: GroundingChunk }> = ({ chunk }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

  const title = chunk.maps?.title || "Ubicación sin nombre";
  const mapUrl = chunk.maps?.uri;
  const snippets = chunk.maps?.placeAnswerSources?.reviewSnippets || [];

  useEffect(() => {
    let isMounted = true;
    
    const fetchImage = async () => {
      // In a real production app with Google Places API, we would check for a photo reference here.
      // Since Grounding API doesn't return the photo URL directly, we default to the AI generation 
      // as requested for the "Super Hyper Realistic" fallback.
      
      try {
        const generatedUrl = await generateParkImage(title);
        if (isMounted) {
          setImageUrl(generatedUrl);
        }
      } catch (error) {
        console.error("Failed to load image", error);
      } finally {
        if (isMounted) {
          setLoadingImage(false);
        }
      }
    };

    fetchImage();

    return () => { isMounted = false; };
  }, [title]);

  if (!chunk.maps) return null;

  return (
    <a 
      href={mapUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group relative flex flex-col bg-[#18181b] rounded-2xl border border-white/5 shadow-lg shadow-black/20 hover:border-orange-500/30 transition-all duration-500 overflow-hidden h-full transform hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-[#202024]">
        {loadingImage ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#202024]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
              <span className="text-xs text-zinc-500 font-medium tracking-wide">GENERANDO VISTA IA...</span>
            </div>
          </div>
        ) : imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent opacity-90" />
            
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
              <span className="text-[10px] text-white/90 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-orange-400" />
                AI Preview
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#202024] text-zinc-600">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5 flex-1 flex flex-col relative">
        {/* Floating Icon overlaps image slightly */}
        <div className="absolute -top-6 left-5">
            <div className="p-2.5 bg-[#27272a] rounded-xl text-orange-500 border border-white/5 shadow-xl">
              <MapPin className="w-5 h-5" />
            </div>
        </div>

        <div className="mt-4 mb-3">
          <h4 className="font-bold text-white text-lg leading-snug group-hover:text-orange-400 transition-colors line-clamp-2">
            {title}
          </h4>
        </div>

        {snippets.length > 0 ? (
           <p className="text-sm text-zinc-400 line-clamp-3 italic mb-5 leading-relaxed">
            "{snippets[0].content}"
          </p>
        ) : (
          <p className="text-sm text-zinc-600 italic mb-5">Sin reseñas disponibles</p>
        )}

        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-sm">
          <span className="font-medium text-white group-hover:text-orange-400 transition-colors flex items-center">
            Abrir en Google Maps
            <ExternalLink className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </span>
        </div>
      </div>
    </a>
  );
};

export const ResultsView: React.FC<ResultsViewProps> = ({ data }) => {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* AI Insight Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#18181b] rounded-3xl p-8 md:p-10 border border-white/5 relative overflow-hidden">
          {/* Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="p-3 bg-[#27272a] rounded-2xl border border-white/5 text-orange-500 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Análisis de la zona</h3>
              <div className="prose prose-invert prose-sm md:prose-base max-w-none text-zinc-300 leading-relaxed">
                <ReactMarkdown 
                  components={{
                    p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                    strong: ({node, ...props}) => <span className="font-bold text-white" {...props} />,
                    ul: ({node, ...props}) => <ul className="space-y-2 my-4" {...props} />,
                    li: ({node, ...props}) => (
                      <li className="flex items-start gap-2.5" {...props}>
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                        <span>{props.children}</span>
                      </li>
                    ),
                  }}
                >
                  {data.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      {data.locations.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8 px-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Parques encontrados
            </h3>
            <span className="flex items-center justify-center min-w-[1.75rem] h-7 text-xs font-bold text-black bg-white rounded-full px-2">
              {data.locations.length}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.locations.map((chunk, index) => (
              <ParkCard key={index} chunk={chunk} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};