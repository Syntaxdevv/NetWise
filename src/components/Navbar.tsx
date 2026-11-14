import { useState } from "react";
import { Sun, Moon, Network } from "lucide-react";
import "../css/Navbar.css";

function Navbar() {
  const [darkMode, setDarkMode] = useState(false);

  function toggleTheme() {
    const newTheme = !darkMode;

    setDarkMode(newTheme);
    document.documentElement.setAttribute(
      "data-theme",
      newTheme ? "dark" : "light",
    );
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        <a href="#" className="navbar-logo">
          <span className="navbar-logo-icon">
            <Network size={23} strokeWidth={2} />
          </span>
          <span>
            NET<span className="navbar-logo-highlight">WISE</span>
          </span>
        </a>

        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={darkMode ? "Light Mode" : "Dark Mode"}
        >
          {darkMode ? (
            <Sun size={20} strokeWidth={2} />
          ) : (
            <Moon size={20} strokeWidth={2} />
          )}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
