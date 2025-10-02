# ML Plant Image Classifier

A machine learning-powered web application that identifies plants from uploaded images using TensorFlow.js and MobileNet.

## Features

- **AI-Powered Recognition** - Utilizes TensorFlow.js with MobileNet for accurate plant identification
- **Real-time Analysis** - Instant plant classification with confidence scores
- **Dark Mode Support** - Toggle between light and dark themes with persistent preferences
- **Responsive Design** - Optimized for desktop and mobile devices
- **Progressive Loading** - Model preloading for faster subsequent predictions
- **Offline Capable** - Works without internet after initial model download

## Tech Stack

- **Frontend**: React 19.1.1, Vite 7.1.7
- **ML/AI**: TensorFlow.js 4.22.0, MobileNet 2.1.1
- **Styling**: Tailwind CSS 4.1.14
- **Build Tool**: Vite with ESLint 9.36.0
- **Language**: JavaScript (ES6+)

## Browser Compatibility

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

**Note**: WebGL support is required for optimal performance.

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher recommended)
- npm (v8+) or yarn (v1.22+)
- Modern web browser with WebGL support
- Minimum 2GB RAM for model loading

### Installation

```bash
# Clone the repository
git clone https://github.com/shahinakt/ML_plant_image_classifier.git

# Navigate to project directory
cd ML_plant_image_classifier

# Install dependencies
npm install

# Start development server
npm run dev
```

**Note**: The first run may take longer as TensorFlow.js models are downloaded and cached.

### Build for Production

```bash
npm run build
npm run preview
```

## Usage

1. Upload an image of a plant using the image picker
2. Wait for the AI model to analyze the image
3. View the identification results with confidence scores
4. Toggle dark mode for preferred viewing experience

## Scripts

- `npm run dev` - Start development server (usually runs on http://localhost:5173)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint code analysis
- `npm run preview` - Preview production build locally

## Project Structure

```
src/
├── components/          # React components
│   ├── DarkModeToggle.jsx
│   ├── Header.jsx
│   ├── ImagePicker.jsx
│   └── ResultCard.jsx
├── data/               # Plant classification data
├── utils/              # Utility functions and ML model
└── assets/             # Plant images and static assets
```

## Model Information

- **Base Model**: MobileNet (pre-trained on ImageNet)
- **Classification**: Custom plant species identification
- **Input Size**: 224x224 pixels
- **Model Size**: ~16MB (downloads on first use)
- **Accuracy**: Varies by plant type and image quality

## Known Limitations

- Requires good lighting and clear plant images for best results
- Performance depends on device capabilities and internet speed
- Model accuracy may vary for rare or uncommon plant species
- Large model size may cause slow initial loading on slower connections

## Performance Tips

- Use high-quality, well-lit images
- Ensure the plant is the main subject in the image
- Avoid blurry or heavily shadowed photos
- Close the app completely to free up memory when not in use

## Contributing

This is a private project. For questions or suggestions, please contact the developer.

## License

This project is private and not licensed for public use.

---

Built by [Shahina Sareen](https://www.shahinasareen.tech)
