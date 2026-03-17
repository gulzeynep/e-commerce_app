import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductImage } from "../api/api";
import { Product } from "../types";

export default function CategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        // This hits the backend route where you implemented Redis caching
        const res = await fetch(`${import.meta.env.VITE_API_URL}/best-sellers/category/${categoryId}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to load category:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryData();
  }, [categoryId]);

  if (loading) return <div className="p-10 text-center">Loading {categoryId}...</div>;

  return (
    <div className="content">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/products" className="text-blue-600 hover:underline">← Back to All</Link>
        <h1 className="page-title capitalize">{categoryId}</h1>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(p => (
          <div key={p.id} className="card hover:shadow-sm transition-all">
            <img 
              src={getProductImage(p.id)} 
              alt={p.id} 
              className="w-full aspect-square object-cover rounded-md mb-3" 
            />
            <div className="font-semibold text-sm">{p.id}</div>
            <div className="list-cat-orange mt-2 text-[10px] inline-block">Trending</div>
          </div>
        ))}
      </div>
    </div>
  );
}