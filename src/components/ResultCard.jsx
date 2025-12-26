export default function ResultCard({ result }) {
  const { predicted_label, confidence, plant } = result;

  const getImageSrc = (imagePath) => {
    if (!imagePath || !imagePath.startsWith('/assets/')) return null;
    const filename = imagePath.replace('/assets/', '');
    return new URL(`../assets/${filename}`, import.meta.url).href;
  };

  const imageSrc = getImageSrc(plant.image);

  return (
    <div className="mt-6 rounded-lg shadow p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="flex gap-4">
        {imageSrc && (
          <img 
            src={imageSrc} 
            alt={plant.common_name} 
            className="w-28 h-28 object-cover rounded"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{plant.common_name}</h2>
          <div className="text-sm italic text-gray-600 dark:text-gray-400">
            {plant.scientific_name}
          </div>
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {plant.short}
          </div>
          <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
            <strong>Uses:</strong> {plant.uses}
          </div>
          {plant.caution && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              <strong>Caution:</strong> {plant.caution}
            </div>
          )}
          <div className="mt-3 text-xs text-gray-600 dark:text-gray-500">
            Predicted: {predicted_label} ({Math.round(confidence * 100)}%)
          </div>
        </div>
      </div>
    </div>
  );
}
