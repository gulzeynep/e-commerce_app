import { useState, useRef } from "react";
import GeneralBestSellers from "./components/GeneralBestSellers";
import BrowsingHistory from "./components/BrowsingHistory";
import PersonalizedBestSellers from "./components/PersonalizedBestSellers";
import { PanelRef } from "./types";

export default function App() {
  const [userId, setUserId] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [historyCount, setHistoryCount] = useState<number>(0);
  
  const browsingRef = useRef<PanelRef>(null);
  const personalizedRef = useRef<PanelRef>(null);

  const handleLoad = () => {
    if (!inputValue.trim()) return;
    setUserId(inputValue.trim());
    setTimeout(() => {
      browsingRef.current?.load();
      personalizedRef.current?.load();
    }, 0);
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#1a56db"/>
            <path d="M5 16 Q10 6 15 13 Q19 19 23 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <circle cx="15" cy="13" r="1.5" fill="white"/>
          </svg>
          <span className="logo-text">Recommendation Engine</span>
        </div>
        <nav className="nav">
          <div className="nav-section">Overview</div>
          <a className="nav-item active" href="#">Best Sellers</a>
        </nav>
        <div className="sidebar-footer">&copy; by Zeynep</div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1 className="page-title">Recommendation Dashboard</h1>
            <p className="page-sub">Product insights & personalized recommendations</p>
          </div>
        </div>

        <div className="content">
          <div className="search-card">
            <label className="field-label">User ID</label>
            <div className="search-row">
              <input
                className="input"
                type="text"
                placeholder="e.g. user-101"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLoad()}
              />
              <button className="btn-primary" onClick={handleLoad}>Load Data</button>
            </div>
          </div>

          {!userId && (
              <div className="card">
                  <div className="card-head">
                  <h2 className="card-title">General Best Sellers</h2>
                  <span className="badge">Top 10</span>
                  </div>
                  <GeneralBestSellers />
              </div>
          )}

          {userId && (
            <div className="two-col">

              <div className="card">
                <div className="card-head">
                  <h2 className="card-title">Recommended For You</h2>
                </div>
                <PersonalizedBestSellers ref={personalizedRef} userId={userId} />
              </div>

              <div className="card">
                <div className="card-head">
                  <h2 className="card-title">Browsing History</h2>
                  <span className="badge">{historyCount} items</span>
                </div>
                <BrowsingHistory ref={browsingRef} userId={userId} onLoad={setHistoryCount} />
              </div>
              
            </div>
          )}
        </div>
      </main>
    </div>
  );
}