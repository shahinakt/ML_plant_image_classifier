import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as mobilenet from "@tensorflow-models/mobilenet";
import plants from "../data/plants.json";

let modelPromise = null;
let isBackendInitialized = false;

async function initializeTensorFlow() {
  if (isBackendInitialized) return;

  try {
    await tf.setBackend('webgl');
    await tf.ready();
  } catch {
    try {
      await tf.setBackend('cpu');
      await tf.ready();
    } catch {
      throw new Error('Could not initialize AI model. Please refresh the page and try again.');
    }
  }
  isBackendInitialized = true;
}

async function loadModel(onProgress = null) {
  if (!modelPromise) {
    await initializeTensorFlow();
    if (onProgress) onProgress('Loading AI model...');
    modelPromise = mobilenet.load({ 
      version: 1,
      alpha: 0.75
    });
  }
  return modelPromise;
}

function readFileAsImage(file, onProgress = null) {
  return new Promise((resolve, reject) => {
    if (file.size > 10 * 1024 * 1024) {
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
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

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

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedImg = new Image();
        optimizedImg.onload = () => resolve(optimizedImg);
        optimizedImg.onerror = () => reject(new Error("Failed to process image. Please try a different photo."));
        optimizedImg.src = canvas.toDataURL('image/jpeg', 0.92);
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

export async function preloadModel() {
  try {
    await loadModel();
  } catch {
    // Silent fail - allow user to try again when uploading
  }
}

export async function predictImage(file, onProgress = null) {
  try {
    if (onProgress) onProgress('Initializing AI model...');
    const model = await loadModel(onProgress);

    if (onProgress) onProgress('Preparing image...');
    const img = await readFileAsImage(file, onProgress);

    if (onProgress) onProgress('Analyzing plant features...');
    const predictions = await model.classify(img, 5);

    if (!predictions || predictions.length === 0) {
      throw new Error("Could not analyze this image. Please try a clearer photo with better lighting.");
    }

    const top = predictions[0];
    if (top.probability < 0.3) {
      throw new Error("Low confidence prediction. Please try a clearer photo with the plant filling more of the frame.");
    }

    const confidence = Number(top.probability.toFixed(3));

    if (onProgress) onProgress('Matching with plant database...');

    let matched = null;
    let bestMatch = null;
    let bestScore = 0;

    // Try direct matches first
    for (const prediction of predictions) {
      const predLabel = normalizeLabel(prediction.className);
      if (plants[predLabel]) {
        matched = plants[predLabel];
        break;
      }
    }

    // Fuzzy matching if no direct match
    if (!matched) {
      const plantKeywords = ['plant', 'leaf', 'flower', 'tree', 'herb', 'vegetable', 'fruit'];
      const nonPlantKeywords = ['pot', 'container', 'soil', 'vase', 'basket'];

      for (const prediction of predictions) {
        const predLabel = normalizeLabel(prediction.className);
        const words = predLabel.split(' ');

        if (nonPlantKeywords.some(keyword => predLabel.includes(keyword))) continue;

        const keys = Object.keys(plants);
        for (const k of keys) {
          const entry = plants[k];
          const searchText = `${entry.common_name} ${entry.scientific_name}`.toLowerCase();
          let score = 0;

          for (const word of words) {
            if (word.length > 2) {
              if (entry.common_name.toLowerCase().includes(word)) {
                score += word.length * prediction.probability * 3;
              } else if (searchText.includes(word)) {
                score += word.length * prediction.probability * 1.5;
              } else if (plantKeywords.some(kw => word.includes(kw))) {
                score += prediction.probability * 0.5;
              }
            }
          }

          if (score > bestScore && score > 0.8) {
            bestScore = score;
            bestMatch = entry;
          }
        }
      }

      if (bestMatch) matched = bestMatch;
    }

    return {
      predicted_label: top.className,
      confidence,
      plant: matched || {
        common_name: `Unidentified Plant (${top.className})`,
        scientific_name: "Classification uncertain",
        uses: `This image was classified as "${top.className}" but doesn't match our plant database. Try a clearer photo focusing only on the plant's leaves and distinctive features.`,
        caution: "⚠️ Cannot provide safety information for unidentified plants. Do not consume or use medicinally without proper identification.",
        short: "Plant identification uncertain - please try a different photo."
      }
    };
  } catch (error) {
    if (error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.message.includes('memory') || error.message.includes('GPU')) {
      throw new Error('Device memory issue. Please try with a smaller image or restart the app.');
    } else if (error.message.includes('model')) {
      throw new Error('AI model loading failed. Please refresh the page and try again.');
    }
    throw error;
  }
}
