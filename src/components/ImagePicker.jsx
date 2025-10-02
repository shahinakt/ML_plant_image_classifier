import React, { useRef, useState } from "react";

export default function ImagePicker({ onImageSelected, isDarkMode }) {
  const fileInputRef = useRef();
  const cameraInputRef = useRef();
  const [preview, setPreview] = useState(null);
  const [cameraSupported, setCameraSupported] = useState(true);

  // Check camera support on component mount
  React.useEffect(() => {
    // Check if camera is supported
    const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    setCameraSupported(hasCamera);
  }, []);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Enhanced validation - more reasonable file size limits
    if (file.size < 1000) { // 1KB minimum (very small threshold)
      alert("Image too small. Please select a valid image file.");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB maximum
      alert("Image too large (maximum 10MB). Please compress or resize your image.");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file (JPG, PNG, WebP, etc.).");
      return;
    }
    
    setPreview(URL.createObjectURL(file));
    onImageSelected(file);
  }

  // Reset function to clear preview and go back
  function handleReset() {
    setPreview(null);
    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    // Call parent function to clear results
    onImageSelected(null);
  }

  // Enhanced camera button handler
  function handleCameraClick() {
    if (!cameraSupported) {
      alert("Camera not supported on this device. Please use 'Choose Photo' to select an image from your gallery.");
      return;
    }
    
    // Try to trigger camera input
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  }

  return (
    <div 
      className="rounded-lg shadow p-4 transition-colors"
      style={{
        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
      }}
    >
      <label 
        className="block text-sm mb-2"
        style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}
      >
        Upload or take a photo
      </label>
      
      {/* Tips for better results */}
      <div className="mb-3 p-2 rounded text-xs" 
           style={{ 
             backgroundColor: isDarkMode ? '#1f2937' : '#f8fafc',
             color: isDarkMode ? '#9ca3af' : '#64748b'
           }}>
        <strong>Tips for better results:</strong> Use clear, well-lit photos • Focus on leaves and distinctive features • Avoid blurry or dark images
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => fileInputRef.current.click()}
          className="px-4 py-2 rounded-md font-medium transition-all duration-300 border text-sm"
          style={{
            backgroundColor: isDarkMode ? 'transparent' : 'transparent',
            color: isDarkMode ? '#e5e7eb' : '#374151',
            borderColor: isDarkMode ? '#6b7280' : '#d1d5db',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.borderColor = isDarkMode ? '#9ca3af' : '#9ca3af';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.transform = 'translateY(0)';
            e.target.style.borderColor = isDarkMode ? '#6b7280' : '#d1d5db';
          }}
        >
          Choose Photo
        </button>
        
        <button
          onClick={handleCameraClick}
          className="px-4 py-2 rounded-md font-medium transition-all duration-300 border text-sm"
          style={{
            backgroundColor: isDarkMode ? 'transparent' : 'transparent',
            color: isDarkMode ? '#e5e7eb' : '#374151',
            borderColor: isDarkMode ? '#6b7280' : '#d1d5db',
            opacity: cameraSupported ? 1 : 0.6
          }}
          onMouseEnter={(e) => {
            if (cameraSupported) {
              e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.borderColor = isDarkMode ? '#9ca3af' : '#9ca3af';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.transform = 'translateY(0)';
            e.target.style.borderColor = isDarkMode ? '#6b7280' : '#d1d5db';
          }}
          title={cameraSupported ? "Take a photo with your camera" : "Camera not supported on this device"}
        >
          {cameraSupported ? 'Take Photo' : 'Camera N/A'}
        </button>
        
        {/* File input for choosing existing photos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        
        {/* Camera input for taking new photos - Enhanced for better compatibility */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
          style={{ display: 'none' }}
          multiple={false}
        />
        
        {preview && (
          <div className="flex items-center gap-2">
            <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded" />
            <button
              onClick={handleReset}
              className="px-3 py-1 rounded text-sm font-medium transition-all duration-300"
              style={{
                backgroundColor: isDarkMode ? '#dc2626' : '#ef4444',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isDarkMode ? '#b91c1c' : '#dc2626';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = isDarkMode ? '#dc2626' : '#ef4444';
                e.target.style.transform = 'translateY(0)';
              }}
              title="Remove image and start over"
            >
              ✕ Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
