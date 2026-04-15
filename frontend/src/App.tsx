import { useEffect, useState } from "react";
import { useStore } from './store/useStore';
import { getCatalog } from './api/api';

import GeneralBestSellers from "./components/GeneralBestSellers";
import BrowsingHistory from "./components/BrowsingHistory";
import PersonalizedBestSellers from "./components/PersonalizedBestSellers";
import ProductCatalog from "./components/ProductCatalog";

function App() {
  const { 
    userIdInput, setUserIdInput,
    activeUserId, setActiveUserId,
    activeView, setActiveView,
    setCatalog 
  } = useStore();

  // State for mobile hamburger menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const data = await getCatalog();
        setCatalog(data.data || {}); 
      } catch (error) {
        console.error("Error loading catalog:", error);
      }
    };
    fetchCatalogData();
  }, [setCatalog]); 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (userIdInput.trim()) {
      setActiveUserId(userIdInput.trim());
      setActiveView('home');
      setIsMobileMenuOpen(false); // Close mobile menu on search
    }
  };

  const handleLogout = () => {
    setActiveUserId(null);
    setUserIdInput("");
    setActiveView('home');
    setIsMobileMenuOpen(false);
  };

  const navigateTo = (view: 'home' | 'catalog' | 'general') => {
    setActiveView(view);
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      
      {/* --- MOBILE TOP HEADER --- */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b shadow-sm flex justify-between items-center px-4 z-40">
        <h1 className="text-lg font-bold text-indigo-600">E-Commerce Recs</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-indigo-600 focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* --- MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b hidden lg:block">
          <h1 className="text-xl font-bold text-indigo-600 leading-tight">
            E-Commerce<br/>Recommendations
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-16 lg:mt-0">
          <button 
            onClick={() => navigateTo('home')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'home' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigateTo('catalog')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'catalog' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Product Catalog
          </button>
          <button 
            onClick={() => navigateTo('general')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'general' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Global Best Sellers
          </button>
        </nav>

        {/* User Session Status in Sidebar */}
        {activeUserId && (
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-500 mb-3">
              Logged in as:<br/>
              <span className="font-bold text-gray-800">{activeUserId}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="w-full py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md font-medium transition-colors border border-red-100"
            >
              Clear Session
            </button>
          </div>
        )}
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto p-4 pt-24 lg:p-12 lg:pt-12 bg-gray-50">
        
        {/* VIEW: HOME / DASHBOARD */}
        {activeView === 'home' && (
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Always Visible Search/Switch Bar */}
            <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                {activeUserId ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-800">Welcome back, {activeUserId}!</h2>
                    <p className="text-gray-500 mt-1">Here is your customized shopping experience.</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-800">Welcome!</h2>
                    <p className="text-gray-500 mt-1">Enter a User ID to see your personalized dashboard.</p>
                  </>
                )}
              </div>

              <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                <input
                  type="text"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  placeholder={activeUserId ? "Switch User ID..." : "e.g., user-1"}
                  className="flex-1 md:w-48 border-2 border-gray-200 rounded-l-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button 
                  type="submit" 
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-r-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  {activeUserId ? 'Switch' : 'Search'}
                </button>
              </form>
            </div>

            {/* Scenario 1: Not Logged In */}
            {!activeUserId ? (
              <section className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-6 border-b pb-4 text-gray-800">Trending Globally Right Now</h3>
                <GeneralBestSellers />
              </section>
            ) : (
              /* Scenario 2: Logged In */
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <section className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[500px] lg:h-[600px]">
                  <h3 className="text-xl font-bold mb-6 border-b pb-4 text-gray-800">Recommended for You</h3>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <PersonalizedBestSellers />
                  </div>
                </section>

                <section className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[500px] lg:h-[600px]">
                  <h3 className="text-xl font-bold mb-6 border-b pb-4 text-gray-800">Your Browsing History</h3>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <BrowsingHistory />
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* VIEW: CATALOG */}
        {activeView === 'catalog' && (
          <div className="max-w-6xl mx-auto">
            <section className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-8 border-b pb-4 text-gray-800">Full Product Catalog</h2>
              <ProductCatalog />
            </section>
          </div>
        )}

        {/* VIEW: GLOBAL BEST SELLERS */}
        {activeView === 'general' && (
          <div className="max-w-4xl mx-auto">
            <section className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-8 border-b pb-4 text-gray-800">Global Best Sellers</h2>
              <GeneralBestSellers />
            </section>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;