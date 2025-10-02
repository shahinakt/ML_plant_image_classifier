
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as mobilenet from "@tensorflow-models/mobilenet";
import plants from "../data/plants.json";

let modelPromise = null;
let isBackendInitialized = false;

// Initialize TensorFlow.js backends
async function initializeTensorFlow() {
  if (isBackendInitialized) return;
  
  try {
    // Try to use WebGL backend first (faster)
    await tf.setBackend('webgl');
    await tf.ready();
    console.log('TensorFlow.js initialized with WebGL backend');
  } catch (webglError) {
    console.warn('WebGL backend failed, falling back to CPU:', webglError);
    try {
      // Fallback to CPU backend
      await tf.setBackend('cpu');
      await tf.ready();
      console.log('TensorFlow.js initialized with CPU backend');
    } catch (cpuError) {
      console.error('Failed to initialize any TensorFlow.js backend:', cpuError);
      throw new Error('Could not initialize AI model. Please refresh the page and try again.');
    }
  }
  
  isBackendInitialized = true;
}

// Optimized model loading with progress tracking
async function loadModel(onProgress = null) {
  if (!modelPromise) {
    // Initialize TensorFlow.js first
    await initializeTensorFlow();
    
    if (onProgress) {
      onProgress('Loading AI model...');
    }
    
    modelPromise = mobilenet.load({ 
      version: 1, // Use version 1 for faster loading
      alpha: 0.75 // Better balance of speed vs accuracy
    });
  }
  return modelPromise;
}

// Optimized image processing with resizing and compression
function readFileAsImage(file, onProgress = null) {
  return new Promise((resolve, reject) => {
    // File size validation
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      reject(new Error("Image too large. Please use an image smaller than 10MB."));
      return;
    }

    if (onProgress) onProgress('Reading image...');
    
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image file. Please try a different image."));
    reader.onload = () => {
      if (onProgress) onProgress('Processing image...');
      
      const img = new Image();
      img.onload = () => {
        // Resize image for faster processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate optimal size (max 640px for better detail preservation)
        const maxSize = 640;
        let { width, height } = img;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw with better quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Create optimized image with higher quality for plant details
        const optimizedImg = new Image();
        optimizedImg.onload = () => resolve(optimizedImg);
        optimizedImg.onerror = () => reject(new Error("Failed to process image. Please try a different photo."));
        optimizedImg.src = canvas.toDataURL('image/jpeg', 0.92); // Higher quality for plant details
      };
      img.onerror = () => reject(new Error("Invalid image format. Please use JPG, PNG, or WebP images."));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function normalizeLabel(label) {
  return label.toLowerCase().replace(/[^a-z0-9 ]/g, "");
}

// Preload model function for better performance
export async function preloadModel() {
  try {
    console.log('Starting AI model preload...');
    await loadModel();
    console.log('Plant identification model preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload model:', error);
    // Don't throw error here, let the user try again when they upload an image
  }
}

export async function predictImage(file, onProgress = null) {
  try {
    // Step 1: Load model with progress
    if (onProgress) onProgress('Initializing AI model...');
    const model = await loadModel(onProgress);
    
    // Step 2: Process image
    if (onProgress) onProgress('Preparing image...');
    const img = await readFileAsImage(file, onProgress);
    
    // Step 3: Run prediction
    if (onProgress) onProgress('Analyzing plant features...');
    
    // Get more predictions for better matching
    const predictions = await model.classify(img, 5);
    
    if (!predictions || predictions.length === 0) {
      throw new Error("Could not analyze this image. Please try a clearer photo with better lighting.");
    }

    // Check if confidence is too low - raised threshold for better accuracy
    const top = predictions[0];
    if (top.probability < 0.3) {
      throw new Error("Low confidence prediction. Please try a clearer photo with the plant filling more of the frame.");
    }

    // Log all predictions for debugging
    console.log('All predictions:', predictions.map(p => `${p.className} (${(p.probability * 100).toFixed(1)}%)`));

    const confidence = Number(top.probability.toFixed(3));

    if (onProgress) onProgress('Matching with plant database...');

    // Enhanced matching algorithm - try multiple predictions with better scoring
    let matched = null;
    let bestMatch = null;
    let bestScore = 0;
    
    // First, try to find direct matches in our plant database
    for (const prediction of predictions) {
      const predLabel = normalizeLabel(prediction.className);
      
      // Direct key match with higher weight
      if (plants[predLabel]) {
        matched = plants[predLabel];
        console.log('Direct match found:', predLabel);
        break;
      }
    }
    
    // If no direct match, try fuzzy matching with plant-specific keywords
    if (!matched) {
      const plantKeywords = ['plant', 'leaf', 'flower', 'tree', 'herb', 'vegetable', 'fruit'];
      
      for (const prediction of predictions) {
        const predLabel = normalizeLabel(prediction.className);
        const words = predLabel.split(' ');
        
        // Skip predictions that are clearly not plants
        const nonPlantKeywords = ['pot', 'container', 'soil', 'vase', 'basket'];
        if (nonPlantKeywords.some(keyword => predLabel.includes(keyword))) {
          console.log('Skipping non-plant prediction:', predLabel);
          continue;
        }
        
        // Search in plant data with improved scoring
        const keys = Object.keys(plants);
        for (const k of keys) {
          const entry = plants[k];
          const searchText = `${entry.common_name} ${entry.scientific_name}`.toLowerCase();
          
          // Calculate match score with better algorithm
          let score = 0;
          
          for (const word of words) {
            if (word.length > 2) { // Skip very short words
              // Exact word match in common name (highest score)
              if (entry.common_name.toLowerCase().includes(word)) {
                score += word.length * prediction.probability * 3;
              }
              // Partial match in search text
              else if (searchText.includes(word)) {
                score += word.length * prediction.probability * 1.5;
              }
              // Check if it's a plant-related term
              else if (plantKeywords.some(kw => word.includes(kw))) {
                score += prediction.probability * 0.5;
              }
            }
          }
          
          if (score > bestScore && score > 0.8) { // Higher threshold for matching
            bestScore = score;
            bestMatch = entry;
          }
        }
      }
      
      if (bestMatch) {
        matched = bestMatch;
        console.log('Fuzzy match found with score:', bestScore);
      }
    }

    // Final result with better fallback message
    return {
      predicted_label: top.className,
      confidence,
      plant: matched || {
        common_name: `Unidentified Plant (${top.className})`,
        scientific_name: "Classification uncertain",
        uses: `This image was classified as "${top.className}" but doesn't match our plant database. This might be because: 1) The image shows a plant not in our database, 2) The image quality needs improvement, or 3) Multiple objects are visible. Try taking a clearer photo focusing only on the plant's leaves and distinctive features.`,
        caution: "⚠️ Cannot provide safety information for unidentified plants. Do not consume or use medicinally without proper identification by a qualified botanist.",
        short: "Plant identification uncertain - please try a different photo."
      }
    };
    
  } catch (error) {
    // Enhanced error handling
    console.error('Prediction error:', error);
    
    if (error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.message.includes('memory') || error.message.includes('GPU')) {
      throw new Error('Device memory issue. Please try with a smaller image or restart the app.');
    } else if (error.message.includes('model')) {
      throw new Error('AI model loading failed. Please refresh the page and try again.');
    }
    
    // Re-throw with original message if it's already user-friendly
    throw error;
  }
}
