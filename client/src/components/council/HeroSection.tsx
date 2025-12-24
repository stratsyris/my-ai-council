import React from 'react';

export default function HeroSection() {
  return (
    <div className="relative w-full h-full min-h-[300px] md:min-h-[500px] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
      {/* Background Image - Full Coverage */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{
          backgroundImage: 'url(/council-chamber.jpg)',
        }}
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-4">
        {/* Mobile: Text-only overlay (minimal) */}
        <div className="md:hidden text-center">
          <h2 className="text-xl font-bold text-white drop-shadow-lg mb-2">
            THE COUNCIL IS ASSEMBLED.
          </h2>
          <p className="text-sm text-white/90 drop-shadow-md leading-relaxed max-w-xs">
            Ask a question, review their debate, and let the Chairman synthesize the verdict.
          </p>
        </div>
        
        {/* Desktop: Centered card with more space */}
        <div className="hidden md:block text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 md:p-10 max-w-3xl">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              THE COUNCIL IS ASSEMBLED.
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Ask a question, review their debate, and let the Chairman synthesize the verdict.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
