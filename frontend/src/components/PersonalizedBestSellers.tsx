import { useState, forwardRef, useImperativeHandle } from "react";
import { getPersonalizedBestSellers, getProductImage } from "../api/api";
import { Product, PanelRef } from "../types";

interface Props {
  userId: string;
  onLoad?: (count: number) => void; // Made optional with '?' to prevent strict errors
}

const PersonalizedBestSellers = forwardRef<PanelRef, Props>(({ userId, onLoad }, ref) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getPersonalizedBestSellers(userId);
      const items = data.products || [];
      setProducts(items);
      
      // Call onLoad if it was provided in App.tsx
      if (onLoad) {
        onLoad(items.length);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoaded(true);
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ load }));

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="list-row">
            <div className="skel" style={{ width: 48, height: 48, borderRadius: 8 }} />
            <div style={{ flex: 1, marginLeft: 12 }}>
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
    return <p className="empty">No specific recommendations yet. Try browsing more products!</p>;
  }

  return (
    <div className="flex flex-col">
      {products.map((p) => (
        <div key={p.id} className="list-row items-center p-2 hover:bg-orange-50/30 rounded-lg transition-colors">
          {/* Product Thumbnail */}
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
            <div className="text-[11px] text-orange-600 font-medium uppercase tracking-wider">
              Matches your interest in {p.category}
            </div>
          </div>

          <span className="list-cat-orange whitespace-nowrap">{p.category}</span>
        </div>
      ))}
    </div>
  );
});

export default PersonalizedBestSellers;