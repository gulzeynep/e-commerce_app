import { useState, forwardRef, useImperativeHandle } from "react";
import { getBrowsingHistory, deleteHistoryItem, getProductImage } from "../api/api";
import { Product, PanelRef } from "../types";

interface Props {
  userId: string;
  onLoad: (count: number) => void;
}

function Skeleton() {
  return <>{[...Array(5)].map((_, i) => (
    <div key={i} className="list-row">
      <div className="skel" style={{ width: 48, height: 48, borderRadius: 8 }} />
      <div style={{ flex: 1, marginLeft: 12 }}>
        <div className="skel" style={{ width: "55%", height: 13, marginBottom: 5 }} />
        <div className="skel" style={{ width: "35%", height: 11 }} />
      </div>
      <div className="skel" style={{ width: 55, height: 26, borderRadius: 6 }} />
    </div>
  ))}</>;
}

const BrowsingHistory = forwardRef<PanelRef, Props>(({ userId, onLoad }, ref) => {
  const [history, setHistory] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const data = await getBrowsingHistory(userId);
    setHistory(data.products || []);
    onLoad(data.products?.length || 0);
    setLoading(false);
  };

  useImperativeHandle(ref, () => ({ load }));

  const handleDelete = async (productId: string) => {
    if (!window.confirm(`Remove ${productId} from your history?`)) return;
    await deleteHistoryItem(userId, productId);
    load(); // Refresh the list after deletion
  };

  if (loading) return <Skeleton />;
  if (!history.length) return <p className="empty">No history found for this user.</p>;

  return (
    <div className="flex flex-col">
      {history.map(p => (
        <div key={p.id} className="list-row items-center hover:bg-gray-50 p-2 rounded-lg transition-colors group">
          {/* Product Thumbnail */}
          <div className="w-12 h-12 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50 mr-4">
            <img 
              src={getProductImage(p.id)} 
              alt={p.id} 
              className="w-full h-full object-cover"
            />
          </div>

          <div style={{ flex: 1 }}>
            <div className="list-name font-semibold text-gray-900">{p.id}</div>
            <div className="list-sub text-xs text-gray-400 capitalize">
              {p.category} • Viewed recently
            </div>
          </div>

          <button 
            className="btn-del opacity-0 group-hover:opacity-100 transition-opacity" 
            onClick={() => handleDelete(p.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
});

export default BrowsingHistory;