import { useState, useEffect } from "react";
import { useStore } from '../store/useStore';
import { getBrowsingHistory, deleteHistoryItem, getProductImage } from "../api/api";
import { Product } from "../types";

function Skeleton() {
  return <>{[...Array(5)].map((_, i) => (
    <div key={i} className="list-row flex items-center p-2 mb-2">
      <div className="skel" style={{ width: 48, height: 48, borderRadius: 8 }} />
      <div style={{ flex: 1, marginLeft: 12 }}>
        <div className="skel" style={{ width: "55%", height: 13, marginBottom: 5 }} />
        <div className="skel" style={{ width: "35%", height: 11 }} />
      </div>
      <div className="skel" style={{ width: 55, height: 26, borderRadius: 6 }} />
    </div>
  ))}</>;
}

export default function BrowsingHistory() {
  const { activeUserId, refreshTrigger, triggerRefresh } = useStore();
  const [history, setHistory] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      // TypeScript is happy: if it's null, we stop here.
      if (!activeUserId) return; 
      
      setLoading(true);
      try {
        // activeUserId is guaranteed to be a string here
        const data = await getBrowsingHistory(activeUserId);
        setHistory(data.products || []);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [activeUserId, refreshTrigger]);

  const handleDelete = async (productId: string) => {
    // TypeScript guard: ensure activeUserId is a string before passing to API
    if (!activeUserId) return;
    
    if (!window.confirm(`Remove ${productId} from your history?`)) return;
    
    await deleteHistoryItem(activeUserId, productId);
    triggerRefresh(); 
  };

  if (loading) return <Skeleton />;
  if (!history.length) return <p className="empty text-gray-500">No history found for this user.</p>;

  return (
    <div className="flex flex-col gap-2">
      {history.map(p => (
        <div key={p.id} className="list-row flex items-center hover:bg-gray-50 p-2 rounded-lg transition-colors group">
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
            onClick={() => handleDelete(p.id)}
            className="btn-del opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 font-medium text-sm px-3 py-1 bg-red-50 rounded"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}