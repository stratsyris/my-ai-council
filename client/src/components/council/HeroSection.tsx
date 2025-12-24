import React from 'react';

export default function HeroSection() {
  return (
    <div className="relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
      {/* Mobile: min-height for mobile, Desktop: taller for full section */}
      <div className="relative w-full min-h-[280px] md:min-h-[600px]">
        {/* Background Image - Cover entire section */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/council-chamber.jpg)',
            backgroundPosition: 'center top',
          }}
        />
        
        {/* Overlay Gradient - darker for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
        
        {/* Content Container */}
        <div className="relative z-10 w-full h-full flex flex-col">
          {/* Mobile: Text at TOP with minimal styling */}
          <div className="md:hidden pt-6 px-4 flex-shrink-0">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-2 leading-tight">
              THE COUNCIL IS ASSEMBLED.
            </h2>
            <p className="text-sm text-white/95 drop-shadow-md leading-relaxed">
              Ask a question, review their debate, and let the Chairman synthesize the verdict.
            </p>
          </div>
          
          {/* Desktop: Text-only overlay centered, positioned higher */}
          <div className="hidden md:flex items-center justify-center h-full">
            <div className="text-center px-8 max-w-4xl">
              <h2 className="text-5xl font-bold text-white drop-shadow-xl mb-4">
                THE COUNCIL IS ASSEMBLED.
              </h2>
              <p className="text-xl text-white/95 drop-shadow-lg leading-relaxed">
                Ask a question, review their debate, and let the Chairman synthesize the verdict.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
