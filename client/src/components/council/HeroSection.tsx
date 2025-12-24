import React from 'react';

export default function HeroSection() {
  return (
    <div className="relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{
          backgroundImage: 'url(/council-chamber.jpg)',
        }}
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-12 md:py-16 px-4">
        {/* Text Card */}
        <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center">
            THE COUNCIL IS ASSEMBLED.
          </h2>
          <p className="text-base md:text-lg text-gray-700 text-center leading-relaxed">
            Ask a question, review their debate, and let the Chairman synthesize the verdict.
          </p>
        </div>
      </div>
    </div>
  );
}
