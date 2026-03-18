import { useEffect, useState } from "react";
import { getGeneralBestSellers, getProductImage } from "../api/api"; // Added getProductImage
import { Product } from "../types";

function Skeleton() {
  return <>{[...Array(5)].map((_, i) => (
    <div key={i} className="list-row">
      <div className="skel" style={{ width: 40, height: 40, borderRadius: 8 }} />
      <div className="skel" style={{ flex: 1, height: 13 }} />
      <div className="skel" style={{ width: 70, height: 22, borderRadius: 100 }} />
    </div>
  ))}</>;
}

export default function GeneralBestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getGeneralBestSellers()
      .then(data => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;
  if (!products.length) return <p className="empty">No data available. Run ETL script.</p>;

  return (
    <div className="flex flex-col gap-2">
      {products.map((p, i) => (
        <div key={p.id} className="list-row items-center hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <span className="list-rank mr-2">{i + 1}</span>
          
          {/* Product Image Thumbnail */}
          <div className="w-12 h-12 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50 mr-3">
            <img 
              src={getProductImage(p.id)} 
              alt={p.id} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="flex flex-col flex-1">
            <span className="list-name font-semibold">{p.id}</span>
            <span className="text-xs text-gray-400 capitalize">{p.category}</span>
          </div>

          <span className="list-cat">{p.category}</span>
        </div>
      ))}
    </div>
  );
}