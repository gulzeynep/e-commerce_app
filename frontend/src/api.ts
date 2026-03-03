// src/api.ts
import { ApiResponse } from "./types";

const API_BASE_URL = "http://127.0.0.1:8000";

export const fetchGeneralBestSellers = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/best-sellers/general`);
  if (!response.ok) throw new Error("Ağ hatası");
  return response.json();
};

export const fetchPersonalizedBestSellers = async (userId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/best-sellers/personalized/${userId}`);
  if (!response.ok) throw new Error("Ağ hatası");
  return response.json();
};

export const fetchBrowsingHistory = async (userId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/browsing-history/${userId}`);
  if (!response.ok) throw new Error("Ağ hatası");
  return response.json();
};