import React from 'react';

export default function HeroSection() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Mobile: min-height for mobile, Desktop: taller for full section */}
      <div className="relative w-full h-auto min-h-[400px] md:min-h-[600px] flex flex-col">
        {/* Background Image - Using img tag for better loading */}
        <img 
          src="/council-chamber.jpg"
          alt="Council Chamber"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Overlay Gradient - darker for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
        
        {/* Content Container - Positioned in top third */}
        <div className="relative z-10 w-full h-full flex flex-col pt-8 md:pt-16 px-4">
          {/* Text centered horizontally, positioned in top third */}
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-5xl font-bold text-white drop-shadow-xl mb-2 md:mb-4 leading-tight">
              THE COUNCIL IS ASSEMBLED.
            </h2>
            <p className="text-sm md:text-xl text-white/95 drop-shadow-lg leading-relaxed">
              Ask a question, review their debate, and let the Chairman synthesize the verdict.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
