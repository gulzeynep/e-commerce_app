export interface Product {
  id: string;
  category: string;
}

export interface ApiResponse {
  type?: string;
  products?: Product[];
  "user-id"?: string;
}

export interface PanelRef {
  load: () => Promise<void>;
}