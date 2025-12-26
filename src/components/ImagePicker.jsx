import { useRef, useState, useEffect } from "react";

export default function ImagePicker({ onImageSelected }) {
  const fileInputRef = useRef();
  const cameraInputRef = useRef();
  const [preview, setPreview] = useState(null);
  const [cameraSupported, setCameraSupported] = useState(true);

  useEffect(() => {
    setCameraSupported('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices);
  }, []);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size < 1000) {
      alert("Image too small. Please select a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image too large (maximum 10MB). Please compress or resize your image.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file (JPG, PNG, WebP, etc.).");
      return;
    }

    setPreview(URL.createObjectURL(file));
    onImageSelected(file);
  }

  function handleReset() {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    onImageSelected(null);
  }

  function handleCameraClick() {
    if (!cameraSupported) {
      alert("Camera not supported on this device. Please use 'Choose Photo' to select an image from your gallery.");
      return;
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  }

  return (
    <div className="rounded-lg shadow p-4 bg-white dark:bg-gray-800 transition-colors">
      <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
        Upload or take a photo
      </label>

      <div className="mb-3 p-2 rounded text-xs bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
        <strong>Tips for better results:</strong> Use clear, well-lit photos • Focus on leaves • Avoid blurry or dark images
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => fileInputRef.current.click()}
          className="px-4 py-2 rounded-md font-medium text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Choose Photo
        </button>

        <button
          onClick={handleCameraClick}
          className="px-4 py-2 rounded-md font-medium text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
          disabled={!cameraSupported}
          title={cameraSupported ? "Take a photo with your camera" : "Camera not supported on this device"}
        >
          {cameraSupported ? 'Take Photo' : 'Camera N/A'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />

        {preview && (
          <div className="flex items-center gap-2">
            <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded" />
            <button
              onClick={handleReset}
              className="px-3 py-1 rounded text-sm font-medium bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white transition"
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
