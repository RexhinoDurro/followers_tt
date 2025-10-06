import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface Image {
  id: string;
  image_url: string;
  caption?: string;
  order: number;
}

interface ImageGalleryProps {
  images: Image[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  isOpen, 
  onClose, 
  initialIndex = 0 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  // Prevent body scroll when gallery is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  };

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-white text-sm font-medium bg-black bg-opacity-50 px-4 py-2 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              title={isZoomed ? "Zoom Out" : "Zoom In"}
            >
              {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
            </button>
            
            <button
              onClick={onClose}
              className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
        <div 
          className={`relative transition-all duration-300 ${
            isZoomed ? 'max-w-full max-h-full' : 'max-w-4xl max-h-[70vh]'
          }`}
        >
          <img
            src={currentImage.image_url}
            alt={currentImage.caption || `Image ${currentIndex + 1}`}
            className={`w-full h-full object-contain transition-transform duration-300 ${
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
            style={{
              maxHeight: isZoomed ? '90vh' : '70vh',
            }}
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 group"
              aria-label="Previous image"
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                <ChevronLeft className="w-8 h-8" />
              </div>
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 group"
              aria-label="Next image"
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                <ChevronRight className="w-8 h-8" />
              </div>
            </button>
          </>
        )}
      </div>

      {/* Caption */}
      {currentImage.caption && (
        <div className="absolute bottom-20 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-white text-center text-lg">{currentImage.caption}</p>
          </div>
        </div>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="max-w-4xl mx-auto overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 justify-center pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    idx === currentIndex
                      ? 'border-purple-500 ring-4 ring-purple-400/50 scale-110'
                      : 'border-white/30 hover:border-white/60 hover:scale-105'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Swipe Indicators for Mobile */}
      {images.length > 1 && (
        <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-2 md:hidden">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-8 bg-purple-500'
                  : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};