export default function DarkModeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg transition-colors"
      style={{
        backgroundColor: isDark ? '#374151' : '#e5e7eb',
        color: isDark ? '#f9fafb' : '#111827'
      }}
      aria-label="Toggle dark mode"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}