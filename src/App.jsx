import { useState, useEffect } from "react";
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
    const saved = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(saved);
    if (saved) {
      document.documentElement.classList.add('dark');
    }
    preloadModel();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  async function handleImage(file) {
    if (!file) {
      setError("");
      setResult(null);
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await predictImage(file, setProgressMessage);
      setResult(res);
    } catch (e) {
      setError(e.message || "Prediction failed. Try a different photo.");
    } finally {
      setLoading(false);
      setProgressMessage("");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="flex-1 flex flex-col items-center p-4">
        <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
        <main className="w-full max-w-xl mt-6">
          <ImagePicker onImageSelected={handleImage} />
          {loading && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {progressMessage || "Analyzing image..."}
              </div>
            </div>
          )}
          {error && <div className="mt-4 text-red-500 dark:text-red-400">{error}</div>}
          {result && <ResultCard result={result} />}
        </main>
      </div>
      <footer className="py-4 text-center border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © Built by{' '}
          <a 
            href="https://www.shahinasareen.tech" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Shahina Sareen
          </a>
        </p>
      </footer>
    </div>
  );
}
