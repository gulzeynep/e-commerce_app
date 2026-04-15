import { useState, useEffect } from "react";
import { useStore } from '../store/useStore';
import { getPersonalizedBestSellers, getProductImage } from "../api/api";
import { Product } from "../types";

export default function PersonalizedBestSellers() {
  // Removed 'triggerRefresh' because it's not used in this component
  const { activeUserId, refreshTrigger } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      // TypeScript guard
      if (!activeUserId) return;
      
      setLoading(true);
      try {
        const data = await getPersonalizedBestSellers(activeUserId);
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error loading recommendations:", error);
      } finally {
        setLoaded(true);
        setLoading(false);
      }
    };

    load();
  }, [activeUserId, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="list-row flex items-center p-2 mb-2">
            <div className="skel" style={{ width: 48, height: 48, borderRadius: 8, marginRight: 16 }} />
            <div style={{ flex: 1, marginTop: 4 }}>
              <div className="skel" style={{ width: "60%", height: 13, marginBottom: 5 }} />
              <div className="skel" style={{ width: "30%", height: 11 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!loaded) return null;
  
  if (!products.length) {
    return <p className="empty text-gray-500">No specific recommendations yet. Try browsing more products!</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {products.map((p) => (
        <div key={p.id} className="list-row flex items-center p-2 hover:bg-orange-50/30 rounded-lg transition-colors">
          <div className="w-12 h-12 shrink-0 overflow-hidden rounded-md border border-orange-100 bg-gray-50 mr-4">
            <img 
              src={getProductImage(p.id)} 
              alt={p.id} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/48?text=Product";
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div className="list-name font-semibold text-gray-900">{p.id}</div>
            <div className="text-[11px] text-orange-600 font-medium uppercase tracking-wider mt-1">
              {p.category} Top Pick
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}