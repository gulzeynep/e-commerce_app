import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductImage } from "../api/api";
import { Product } from "../types";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<"name-asc" | "name-desc" | "cat-asc">("name-asc");

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/products/all`),
          fetch(`${import.meta.env.VITE_API_URL}/products/categories`)
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        
        setProducts(prodData.products || []);
        setCategories(catData.categories || []);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // 1. Filter, then 2. Sort
  const processedProducts = products
    .filter(p => 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortType === "name-asc") return a.id.localeCompare(b.id);
      if (sortType === "name-desc") return b.id.localeCompare(a.id);
      if (sortType === "cat-asc") return a.category.localeCompare(b.category);
      return 0;
    });

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Catalog...</div>;

  return (
    <div className="content">
      <div className="mb-8">
        <h1 className="page-title mb-4">Shop All Products</h1>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search Bar */}
          <div className="flex-1 w-full">
            <label className="field-label">Search</label>
            <input 
              type="text" 
              className="input w-full" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-48">
            <label className="field-label">Sort By</label>
            <select 
              className="input w-full cursor-pointer" 
              value={sortType}
              onChange={(e) => setSortType(e.target.value as any)}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="cat-asc">Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories (only show when not searching) */}
      {!searchQuery && (
        <section className="mb-10">
          <h2 className="card-title mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <Link key={cat} to={`/category/${cat}`} className="list-cat px-4 py-2 hover:bg-blue-600 hover:text-white transition-colors">
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Results Grid */}
      <section>
        <h2 className="card-title mb-6">
          {searchQuery ? "Search Results" : "All Items"} ({processedProducts.length})
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {processedProducts.map(p => (
            <div key={p.id} className="card group hover:border-blue-500 transition-all">
              <div className="overflow-hidden rounded-md mb-3">
                <img 
                  src={getProductImage(p.id)} 
                  alt={p.id} 
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform" 
                />
              </div>
              <div className="font-semibold text-sm truncate">{p.id}</div>
              <Link to={`/category/${p.category}`} className="text-[10px] text-gray-400 hover:text-blue-500 capitalize">
                {p.category}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}