import { useState, forwardRef, useImperativeHandle } from "react";
import { getPersonalizedBestSellers } from "../api/api";
import { Product, PanelRef } from "../types";

interface Props {
  userId: string;
}

function Skeleton() {
  return <>{[...Array(5)].map((_, i) => (
    <div key={i} className="list-row">
      <div className="skel" style={{ flex: 1, height: 13 }} />
      <div className="skel" style={{ width: 70, height: 22, borderRadius: 100 }} />
    </div>
  ))}</>;
}

const PersonalizedBestSellers = forwardRef<PanelRef, Props>(({ userId }, ref) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const data = await getPersonalizedBestSellers(userId);
    setProducts(data.products || []);
    setLoaded(true);
    setLoading(false);
  };

  useImperativeHandle(ref, () => ({ load }));

  if (loading) return <Skeleton />;
  if (!loaded) return null;
  if (!products.length) return <p className="empty">No recommendations available.</p>;

  return <>{products.map(p => (
    <div key={p.id} className="list-row">
      <span className="list-name">{p.id}</span>
      <span className="list-cat-orange">{p.category}</span>
    </div>
  ))}</>;
});

export default PersonalizedBestSellers;