"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  className = "" 
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-purple-500 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

// Exemple d'utilisation dans une page de chargement complète
export const FullPageLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chargement en cours</h2>
        <p className="text-gray-600">Veuillez patienter...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;