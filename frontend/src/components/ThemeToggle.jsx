import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ wide = false }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  if (wide) {
    return (
      <button className="theme-toggle theme-toggle-wide" onClick={toggle} aria-label="Toggle theme">
        <span>{isDark ? '☀️' : '🌙'}</span>
        <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
      </button>
    );
  }

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
