import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getProductImage } from "../api/api";

export default function ProductCatalog() {
  const catalog = useStore((state) => state.catalog);
  
  // States for filtering and pagination/view
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Memoized processing: Filter Categories -> Natural Sort Categories -> Natural Sort Products
  const processedCatalog = useMemo(() => {
    const filtered: Record<string, string[]> = {};
    const term = searchTerm.toLowerCase().trim();

    // 1. Get all category names and sort them NATURALLY (1, 2, 11, 20...)
    const sortedCategoryNames = Object.keys(catalog).sort((a, b) => 
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );

    // 2. Filter by category name and sort their products NATURALLY
    sortedCategoryNames.forEach(category => {
      if (category.toLowerCase().includes(term)) {
        // Sort products using natural numeric sorting
        const sortedProducts = [...catalog[category]].sort((a, b) => 
          a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
        );
        filtered[category] = sortedProducts;
      }
    });

    return filtered;
  }, [catalog, searchTerm]);

  if (Object.keys(catalog).length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 font-medium">
        Loading product catalog...
      </div>
    );
  }

  // --- RENDER: SINGLE CATEGORY EXPANDED VIEW ---
  if (expandedCategory && processedCatalog[expandedCategory]) {
    const products = processedCatalog[expandedCategory];
    
    return (
      <div className="space-y-6 animate-fade-in">
        <button 
          onClick={() => setExpandedCategory(null)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors mb-4"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all categories
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
            <h3 className="capitalize text-2xl font-bold text-gray-800">{expandedCategory}</h3>
            <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">
              {products.length} PRODUCTS
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map(pid => (
              <div key={pid} className="group border border-gray-100 rounded-xl p-3 hover:border-indigo-300 hover:shadow-md transition-all bg-white cursor-pointer">
                <div className="aspect-square w-full overflow-hidden rounded-lg mb-3 bg-gray-50">
                  <img src={getProductImage(pid)} alt={pid} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image"; }} />
                </div>
                <div className="text-sm font-semibold text-gray-800 text-center truncate px-1" title={pid}>{pid}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: MAIN CATALOG VIEW ---
  return (
    <div className="space-y-6">
      {/* Controls: Search Bar Only */}
      <div className="relative max-w-xl mb-8">
        <input
          type="text"
          placeholder="Search categories (e.g., Category-10)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-gray-700"
        />
        <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Results */}
      {Object.keys(processedCatalog).length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg">No categories found matching "<span className="font-semibold text-gray-800">{searchTerm}</span>".</p>
          <button onClick={() => setSearchTerm("")} className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
            Clear Search
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(processedCatalog).map(([category, products]) => {
            const displayProducts = products.slice(0, 5);
            const hasMore = products.length > 5;

            return (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
                  <h3 className="capitalize text-xl font-bold text-gray-800">{category}</h3>
                  <div className="text-sm font-medium text-gray-500">
                    Showing {displayProducts.length} of {products.length}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {displayProducts.map(pid => (
                    <div key={pid} className="group border border-gray-100 rounded-xl p-3 hover:border-indigo-300 hover:shadow-md transition-all bg-white cursor-pointer">
                      <div className="aspect-square w-full overflow-hidden rounded-lg mb-3 bg-gray-50">
                        <img src={getProductImage(pid)} alt={pid} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image"; }} />
                      </div>
                      <div className="text-sm font-semibold text-gray-800 text-center truncate px-1" title={pid}>{pid}</div>
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => setExpandedCategory(category)}
                      className="inline-flex items-center justify-center px-6 py-2.5 border border-indigo-200 text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                      View All {products.length} Products in {category}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}