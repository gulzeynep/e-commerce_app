import { useEffect, useState } from "react";
import { getGeneralBestSellers, getProductImage } from "../api/api";
import { Product } from "../types";

function Skeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="list-row flex items-center">
          {/* Rank Number Skeleton */}
          <div className="skel" style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 8 }} />
          {/* Image Thumbnail Skeleton */}
          <div className="skel" style={{ width: 48, height: 48, borderRadius: 8, marginRight: 16 }} />
          <div style={{ flex: 1, marginTop: 4 }}>
            <div className="skel" style={{ width: "50%", height: 13, marginBottom: 5 }} />
            <div className="skel" style={{ width: "30%", height: 11 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GeneralBestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGeneralData = async () => {
      try {
        const data = await getGeneralBestSellers();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error loading general best sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneralData();
  }, []); // Empty dependency array means it only runs once when the component mounts

  if (loading) return <Skeleton />;
  if (!products.length) return <p className="empty text-gray-500">No data available. ETL script is preparing the top sellers.</p>;

  return (
    <div className="flex flex-col gap-2">
      {products.map((p, i) => (
        <div key={p.id} className="list-row flex items-center p-2 hover:bg-blue-50/30 rounded-lg transition-colors">
          
          {/* Rank Number */}
          <div className="w-6 text-center font-bold text-gray-400 mr-2 text-sm">
            #{i + 1}
          </div>
          
          {/* Product Image Thumbnail */}
          <div className="w-12 h-12 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50 mr-4">
            <img 
              src={getProductImage(p.id)} 
              alt={p.id} 
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback image if the generated image fails to load
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/48?text=Top";
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div className="list-name font-semibold text-gray-900">{p.id}</div>
            <div className="text-[11px] text-blue-600 font-medium uppercase tracking-wider mt-1">
              {p.category} Global Hit
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}