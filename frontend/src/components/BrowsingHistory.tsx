import { useState, forwardRef, useImperativeHandle } from "react";
import { getBrowsingHistory, deleteHistoryItem } from "../api/api";
import type { Product, PanelRef } from "../../types";

interface Props {
  userId: string;
  onLoad: (count: number) => void;
}

function Skeleton() {
  return <>{[...Array(5)].map((_, i) => (
    <div key={i} className="list-row">
      <div style={{ flex: 1 }}>
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
    if (!window.confirm(`Remove ${productId}?`)) return;
    await deleteHistoryItem(userId, productId);
    load();
  };

  if (loading) return <Skeleton />;
  if (!history.length) return <p className="empty">No history found.</p>;

  return <>{history.map(p => (
    <div key={p.id} className="list-row">
      <div style={{ flex: 1 }}>
        <div className="list-name">{p.id}</div>
        <div className="list-sub">{p.category}</div>
      </div>
      <button className="btn-del" onClick={() => handleDelete(p.id)}>Remove</button>
    </div>
  ))}</>;
});

export default BrowsingHistory;