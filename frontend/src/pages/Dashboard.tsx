import { useState, useRef } from "react";
import BrowsingHistory from "../components/BrowsingHistory";
import PersonalizedBestSellers from "../components/PersonalizedBestSellers";
import GeneralBestSellers from "../components/GeneralBestSellers";
import { PanelRef } from "../types";
import { clearHistory } from "../api/api"; 

export default function Dashboard() {
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

  const handleClearAll = async () => {
    if (!userId) return;
    if (!window.confirm("Are you sure you want to clear your entire browsing history? This will reset your recommendations.")) return;
    
    try {
      await clearHistory(userId);
      // Refresh panels to show empty history and fallback recommendations
      browsingRef.current?.load();
      personalizedRef.current?.load();
    } catch (error) {
      console.error("Failed to clear history:", error);
      alert("Error clearing history.");
    }
  };

  return (
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

      {!userId ? (
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">General Best Sellers</h2>
            <span className="badge">Top 10</span>
          </div>
          <GeneralBestSellers />
        </div>
      ) : (
        <div className="two-col">
          {/* Personalized Panel */}
          <div className="card">
            <div className="card-head">
              <h2 className="card-title">Recommended For You</h2>
            </div>
            <PersonalizedBestSellers ref={personalizedRef} userId={userId} />
          </div>

          {/* History Panel */}
          <div className="card">
            <div className="card-head">
              <h2 className="card-title">Browsing History</h2>
              <div className="flex gap-3 items-center">
                <span className="badge">{historyCount} items</span>
                <button 
                  onClick={handleClearAll}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
            <BrowsingHistory ref={browsingRef} userId={userId} onLoad={setHistoryCount} />
          </div>
        </div>
      )}
    </div>
  );
}