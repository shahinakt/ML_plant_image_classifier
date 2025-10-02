import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import ImagePicker from "./components/ImagePicker";
import ResultCard from "./components/ResultCard";
import { predictImage, preloadModel } from "./utils/model";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");

  
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const darkMode = saved === 'true';
    setIsDarkMode(darkMode);
    
   
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Preload the AI model for faster predictions
    preloadModel();
  }, []);

  
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    
    
    const htmlElement = document.documentElement;
    
    
    htmlElement.classList.remove('dark', 'light');
    
    if (isDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      
      htmlElement.classList.remove('dark');
      requestAnimationFrame(() => {
        htmlElement.classList.remove('dark');
      });
    }
    
    
    htmlElement.style.visibility = 'hidden';
    htmlElement.offsetHeight; 
    htmlElement.style.visibility = 'visible';
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  async function handleImage(file) {
    setError("");
    setResult(null);
    setProgressMessage("");
    
    // If file is null, it means reset was clicked
    if (!file) {
      return;
    }
    
    setLoading(true);
    try {
      // Enhanced prediction with progress tracking
      const res = await predictImage(file, (message) => {
        setProgressMessage(message);
      });
      setResult(res);
      setProgressMessage("");
    } catch (e) {
      console.error(e);
      // Use the enhanced error message from the model
      setError(e.message || "Prediction failed. Try a different photo.");
      setProgressMessage("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors" 
         style={{ 
           backgroundColor: isDarkMode ? '#111827' : '#ffffff',
           color: isDarkMode ? '#f9fafb' : '#111827'
         }}>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center p-4">
        <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
        <main className="w-full max-w-xl mt-6">
          <ImagePicker onImageSelected={handleImage} isDarkMode={isDarkMode} />
          {loading && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm" 
                   style={{ 
                     backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                     color: isDarkMode ? '#e5e7eb' : '#4b5563'
                   }}>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {progressMessage || "Analyzing image..."}
              </div>
            </div>
          )}
          {error && <div className="mt-4 text-red-500 dark:text-red-400">{error}</div>}
          {result && <ResultCard result={result} isDarkMode={isDarkMode} />}
        </main>
      </div>
      
      {/* Footer - Sticky to bottom */}
      <footer className="py-4 text-center border-t border-gray-200 dark:border-gray-700 mt-auto">
        <p className="text-sm" 
           style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
          © Built by{' '}
          <a 
            href="https://www.shahinasareen.tech" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium transition-colors duration-200"
            style={{ 
              color: isDarkMode ? '#60a5fa' : '#3b82f6',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.textDecoration = 'underline';
              e.target.style.color = isDarkMode ? '#93c5fd' : '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.target.style.textDecoration = 'none';
              e.target.style.color = isDarkMode ? '#60a5fa' : '#3b82f6';
            }}
          >
            Shahina Sareen
          </a>
        </p>
      </footer>
    </div>
  );
}
