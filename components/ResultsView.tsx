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
      className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 overflow-hidden h-full transform hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {loadingImage ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              <span className="text-xs text-gray-400 font-medium">Generando vista IA...</span>
            </div>
          </div>
        ) : imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
              <span className="text-[10px] text-white font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                AI Preview
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
              {title}
            </h4>
          </div>
        </div>

        {snippets.length > 0 ? (
           <p className="text-sm text-gray-500 line-clamp-3 italic mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            "{snippets[0].content}"
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic mb-4">Sin reseñas disponibles</p>
        )}

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors flex items-center">
            Ver mapa
            <ExternalLink className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </span>
          {chunk.maps.placeId && (
             <span className="text-xs text-gray-300 font-mono">ID: {chunk.maps.placeId.slice(-4)}</span>
          )}
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
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_2px_40px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
          {/* Decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-100 text-emerald-600 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Análisis de la zona</h3>
              <div className="prose prose-gray prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed">
                <ReactMarkdown 
                  components={{
                    p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                    strong: ({node, ...props}) => <span className="font-bold text-gray-900" {...props} />,
                    ul: ({node, ...props}) => <ul className="space-y-2 my-4" {...props} />,
                    li: ({node, ...props}) => (
                      <li className="flex items-start gap-2.5" {...props}>
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
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
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              Parques destacados
            </h3>
            <span className="flex items-center justify-center min-w-[1.75rem] h-7 text-sm font-bold text-white bg-black rounded-full px-2">
              {data.locations.length}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.locations.map((chunk, index) => (
              <ParkCard key={index} chunk={chunk} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};