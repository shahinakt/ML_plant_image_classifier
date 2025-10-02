import React from "react";

export default function ResultCard({ result, isDarkMode }) {
  const { predicted_label, confidence, plant } = result;
  
  // Function to get the correct image path for Vite
  const getImageSrc = (imagePath) => {
    if (!imagePath) return null;
    // Convert /assets/filename.jpg to the correct import path
    if (imagePath.startsWith('/assets/')) {
      const filename = imagePath.replace('/assets/', '');
      return new URL(`../assets/${filename}`, import.meta.url).href;
    }
    return imagePath;
  };
  
  const imageSrc = getImageSrc(plant.image);
  
  return (
    <div 
      className="mt-6 rounded-lg shadow p-4 transition-colors"
      style={{
        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
      }}
    >
      <div className="flex gap-4">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={plant.common_name} 
            className="w-28 h-28 object-cover rounded"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-28 h-28 rounded flex items-center justify-center text-xs" 
          style={{
            display: imageSrc ? 'none' : 'flex',
            backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb',
            color: isDarkMode ? '#9ca3af' : '#6b7280'
          }}
        >
          No Image
        </div>
        <div className="flex-1">
          <h2 
            className="text-lg font-semibold"
            style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
          >
            {plant.common_name}
          </h2>
          <div 
            className="text-sm italic"
            style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
          >
            {plant.scientific_name}
          </div>
          <div 
            className="mt-2 text-sm"
            style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}
          >
            {plant.short}
          </div>
          <div 
            className="mt-3 text-sm"
            style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}
          >
            <strong>Uses:</strong> {plant.uses}
          </div>
          {plant.caution && (
            <div 
              className="mt-2 text-sm"
              style={{ color: isDarkMode ? '#fca5a5' : '#dc2626' }}
            >
              <strong>Caution:</strong> {plant.caution}
            </div>
          )}
          <div 
            className="mt-3 text-xs"
            style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }}
          >
            Predicted: {predicted_label} ({Math.round(confidence * 100)}%)
          </div>
        </div>
      </div>
    </div>
  );
}
