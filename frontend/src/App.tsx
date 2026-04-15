import { useEffect } from "react";
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
    }
  };

  const handleLogout = () => {
    setActiveUserId(null);
    setUserIdInput("");
    setActiveView('home');
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-indigo-600 leading-tight">
            E-Commerce<br/>Recommendations
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveView('home')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'home' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveView('catalog')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'catalog' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Product Catalog
          </button>
          <button 
            onClick={() => setActiveView('general')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'general' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Global Best Sellers
          </button>
        </nav>

        {/* User Session Status */}
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
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        
        {/* VIEW: HOME / DASHBOARD */}
        {activeView === 'home' && (
          <div className="max-w-5xl mx-auto space-y-10">
            
            {/* Scenario 1: Not Logged In */}
            {!activeUserId ? (
              <>
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">Welcome!</h2>
                  <p className="text-gray-500 mb-8">Please enter a User ID to see your personalized dashboard.</p>
                  
                  <form onSubmit={handleSearch} className="flex justify-center max-w-md mx-auto">
                    <input
                      type="text"
                      value={userIdInput}
                      onChange={(e) => setUserIdInput(e.target.value)}
                      placeholder="e.g., user-101"
                      className="flex-1 border-2 border-gray-200 rounded-l-lg px-5 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button 
                      type="submit" 
                      className="bg-indigo-600 text-white px-8 py-3 rounded-r-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Search
                    </button>
                  </form>
                </div>

                <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-6 border-b pb-4 text-gray-800">Trending Globally Right Now</h3>
                  <GeneralBestSellers />
                </section>
              </>
            ) : (
              /* Scenario 2: Logged In */
              <>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-800">Welcome back, {activeUserId}!</h2>
                  <p className="text-gray-500 mt-2">Here is your customized shopping experience.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
                    <h3 className="text-xl font-bold mb-6 border-b pb-4 text-gray-800">Recommended for You</h3>
                    <div className="flex-1 overflow-y-auto pr-2">
                      <PersonalizedBestSellers />
                    </div>
                  </section>

                  <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
                    <h3 className="text-xl font-bold mb-6 border-b pb-4 text-gray-800">Your Browsing History</h3>
                    <div className="flex-1 overflow-y-auto pr-2">
                      <BrowsingHistory />
                    </div>
                  </section>
                </div>
              </>
            )}
          </div>
        )}

        {/* VIEW: CATALOG */}
        {activeView === 'catalog' && (
          <div className="max-w-6xl mx-auto">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-8 border-b pb-4 text-gray-800">Full Product Catalog</h2>
              <ProductCatalog />
            </section>
          </div>
        )}

        {/* VIEW: GLOBAL BEST SELLERS */}
        {activeView === 'general' && (
          <div className="max-w-4xl mx-auto">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
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