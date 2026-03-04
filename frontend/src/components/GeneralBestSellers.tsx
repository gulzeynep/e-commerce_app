import { useEffect, useState } from "react";
import { getGeneralBestSellers } from "../api/api";
import { Product } from "../types";

function Skeleton() {
  return <>{[...Array(5)].map((_, i) => (
    <div key={i} className="list-row">
      <div className="skel" style={{ width: 18, height: 13 }} />
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

  return <>{products.map((p, i) => (
    <div key={p.id} className="list-row">
      <span className="list-rank">{i + 1}</span>
      <span className="list-name">{p.id}</span>
      <span className="list-cat">{p.category}</span>
    </div>
  ))}</>;
}