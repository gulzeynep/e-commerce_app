import React, { useState, useRef } from "react";
import GeneralBestSellers from "./components/GeneralBestSellers";
import BrowsingHistory from "./components/BrowsingHistory";
import PersonalizedBestSellers from "./components/PersonalizedBestSellers";
import { PanelRef } from "./types";

export default function App() {
  const [userId, setUserId] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [historyCount, setHistoryCount] = useState<number>(0);
  
  // Ref'lerin tiplerini tanımlıyoruz
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLoad();
  };

  return (
    <>
      <style>{css}</style>
      <div className="layout">
        <aside className="sidebar">
          {/* ... Sidebar kodların aynı ... */}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
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
                    <h2 className="card-title">Browsing History</h2>
                    <span className="badge">{historyCount} items</span>
                  </div>
                  <BrowsingHistory ref={browsingRef} userId={userId} onLoad={setHistoryCount} />
                </div>

                <div className="card">
                  <div className="card-head">
                    <h2 className="card-title">Recommended For You</h2>
                  </div>
                  <PersonalizedBestSellers ref={personalizedRef} userId={userId} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

// ... senin yazdığın "const css = `...`" bloğu buraya gelecek (değiştirmedim) ...
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  /* Tüm CSS kodların burada duruyor */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f8f9fb; color: #111827; font-size: 14px; }
  .layout { display: flex; min-height: 100vh; }
  .sidebar { width: 220px; flex-shrink: 0; background: #fff; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; padding: 24px 0; }
  .logo { display: flex; align-items: center; gap: 10px; padding: 0 20px 24px; border-bottom: 1px solid #e5e7eb; }
  .logo-text { font-weight: 700; font-size: 16px; color: #111827; }
  .nav { padding: 20px 12px; flex: 1; }
  .nav-section { font-size: 11px; font-weight: 600; color: #9ca3af; letter-spacing: 0.8px; text-transform: uppercase; padding: 0 8px; margin-bottom: 6px; }
  .nav-item { display: block; padding: 8px 10px; border-radius: 6px; color: #6b7280; text-decoration: none; font-weight: 500; margin-bottom: 2px; }
  .nav-item:hover { background: #f3f4f6; color: #111827; }
  .nav-item.active { background: #eff6ff; color: #1a56db; }
  .sidebar-footer { padding: 16px 20px 0; font-size: 12px; color: #d1d5db; border-top: 1px solid #e5e7eb; }
  .main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .topbar { padding: 24px 32px; background: #fff; border-bottom: 1px solid #e5e7eb; }
  .page-title { font-size: 20px; font-weight: 700; color: #111827; }
  .page-sub { font-size: 13px; color: #6b7280; margin-top: 2px; }
  .content { padding: 28px 32px; max-width: 1100px; }
  .search-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px 24px; margin-bottom: 20px; }
  .field-label { font-size: 13px; font-weight: 500; color: #374151; display: block; margin-bottom: 8px; }
  .search-row { display: flex; gap: 10px; }
  .input { flex: 1; max-width: 360px; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 7px; font-size: 14px; font-family: inherit; color: #111827; outline: none; background: #fff; }
  .input:focus { border-color: #1a56db; box-shadow: 0 0 0 3px rgba(26,86,219,0.08); }
  .btn-primary { padding: 8px 18px; background: #1a56db; color: #fff; border: none; border-radius: 7px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .btn-primary:hover { background: #1648c0; }
  .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px 24px; margin-bottom: 20px; }
  .card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .card-title { font-size: 15px; font-weight: 600; color: #111827; }
  .badge { font-size: 12px; font-weight: 500; background: #f3f4f6; color: #6b7280; padding: 3px 10px; border-radius: 100px; border: 1px solid #e5e7eb; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } .sidebar { display: none; } .content { padding: 20px; } }
  .list-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
  .list-row:last-child { border-bottom: none; }
  .list-rank { font-size: 12px; font-weight: 600; color: #d1d5db; width: 18px; text-align: right; }
  .list-name { font-size: 13px; color: #111827; flex: 1; }
  .list-sub { font-size: 12px; color: #9ca3af; margin-top: 1px; }
  .list-cat { font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 100px; background: #eff6ff; color: #1a56db; }
  .list-cat-orange { font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 100px; background: #fff7ed; color: #ea580c; }
  .btn-del { background: #fff; color: #6b7280; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 10px; font-size: 12px; cursor: pointer; font-family: inherit; }
  .btn-del:hover { border-color: #ef4444; color: #ef4444; background: #fff5f5; }
  .skel { background: linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 5px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .empty { color: #9ca3af; font-size: 13px; text-align: center; padding: 20px 0; }
`;