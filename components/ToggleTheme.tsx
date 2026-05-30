"use client";

import { useTheme } from "hooks/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

type ToggleThemeProps = {
  className?: string;
};

export default function ToggleTheme({ className }: ToggleThemeProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    /* Toggle theme di pojok kanan atas */
    <>
      <button
        onClick={toggleTheme}
        className={[
          "p-2 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition",
          className,
        ].join(" ")}
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>
    </>
  );
}
