
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-pink-500"></div>
      <p className="text-gray-500 text-lg">Generating ideas for you...</p>
    </div>
  );
};

export default LoadingSpinner;