import { useEffect, useState } from "react";
import { getProductImage } from "../api/api";

export default function ProductCatalog() {
  const [catalog, setCatalog] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/products/catalog`)
    .then(res => res.json())
    .then(data => {
      console.log("Catalog Data:", data); 
      setCatalog(data.catalog || {});
    })
    .finally(() => setLoading(false));
}, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (Object.keys(catalog).length === 0) {
    return <div className="p-10 text-center text-gray-500">No data available.</div>;
  }

  return (
    <div className="space-y-8">
      {Object.entries(catalog).map(([category, products]) => (
        <div key={category} className="card">
          <div className="card-head border-b pb-2 mb-4">
            <h3 className="card-title capitalize text-lg font-bold">{category}</h3>
            <span className="badge">{products.length} Product</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {products.map(pid => (
              <div key={pid} className="group border rounded-md p-3 hover:border-blue-300 transition-all bg-white shadow-sm">
                <img 
                  src={getProductImage(pid)} 
                  alt={pid} 
                  className="w-full aspect-square object-cover rounded mb-2 group-hover:scale-105 transition-transform" 
                />
                <div className="text-xs font-semibold truncate text-center text-gray-700">{pid}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}