import React from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Loader2, Share2 } from 'lucide-react';
import { AppStatus, WorkoutPlan } from '../types';

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: AppStatus;
  workout: WorkoutPlan | null;
}

export const WorkoutModal: React.FC<WorkoutModalProps> = ({ isOpen, onClose, status, workout }) => {
  if (!isOpen) return null;

  const isLoading = status === AppStatus.GENERATING_WORKOUT;

  const handleShare = () => {
    if (workout && navigator.share) {
      navigator.share({
        title: `Rutina para ${workout.parkName}`,
        text: workout.routine,
      }).catch(console.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {isLoading ? 'Diseñando entrenamiento...' : `Rutina: ${workout?.parkName}`}
          </h3>
          {!isLoading && (
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
              <p className="text-gray-500 text-sm">Analizando equipamiento y generando ejercicios...</p>
            </div>
          ) : (
            workout && (
              <div className="prose prose-sm prose-emerald max-w-none text-gray-700">
                <ReactMarkdown>{workout.routine}</ReactMarkdown>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        {!isLoading && workout && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-2">
             <button
               onClick={onClose}
               className="px-4 py-2 text-gray-600 font-medium hover:text-gray-800"
             >
               Cerrar
             </button>
             <button
               onClick={handleShare}
               className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"
             >
               <Share2 className="w-4 h-4" />
               Compartir
             </button>
          </div>
        )}
      </div>
    </div>
  );
};