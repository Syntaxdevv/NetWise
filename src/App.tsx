
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import owl from "./assets/Netwiseowl.gif";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && (
        <div className="loading-screen">
          <div className="loading-content">
            <img
              src={owl}
              alt="NETWISE Animated Owl"
              className="loading-owl"
            />

            <h1 className="loading-logo">
              NET<span>WISE</span>
            </h1>

            <p className="loading-subtitle">
              SMART NETWORK CALCULATOR
            </p>

            <div className="loading-progress">
              <div className="loading-progress-bar"></div>
            </div>

            <p className="loading-message">
              Please wait...
            </p>
          </div>
        </div>
      )}

      <div className={loading ? "app-hidden" : "app-visible"}>
        <Home />
      </div>
    </>
  );
}

export default App;
