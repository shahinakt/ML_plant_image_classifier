import DarkModeToggle from './DarkModeToggle';

export default function Header({ isDarkMode, onToggleDarkMode }) {
  return (
    <header className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-600 w-10 h-10 flex items-center justify-center text-white font-bold">🌿</div>
          <div>
            <h1 className="text-xl font-semibold">Plant ID</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Upload a photo — get common & scientific name</p>
          </div>
        </div>
        <DarkModeToggle isDark={isDarkMode} onToggle={onToggleDarkMode} />
      </div>
    </header>
  );
}
