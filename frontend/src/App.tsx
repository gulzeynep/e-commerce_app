import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard"; // Import the new file
import GeneralBestSellers from "./components/GeneralBestSellers";
import CategoryDetail from "./components/CategoryDetail";

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <aside className="sidebar">
          <div className="logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#1a56db"/>
              <path d="M5 16 Q10 6 15 13 Q19 19 23 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            </svg>
            <span className="logo-text">RecEngine</span>
          </div>
          <nav className="nav">
            <div className="nav-section">Explore</div>
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              All Products
            </NavLink>
          </nav>
          <div className="sidebar-footer">&copy; by Zeynep</div>
        </aside>

        <main className="main">
          <div className="topbar">
            <h1 className="page-title">Recommendation Dashboard</h1>
            <p className="page-sub">Product insights & personalized recommendations</p>
          </div>

          <Routes>
            <Route path="/" element={<Dashboard />} /> 
            <Route path="/products" element={<div className="content"><GeneralBestSellers /></div>} />
            <Route path="/category/:categoryId" element={<CategoryDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}