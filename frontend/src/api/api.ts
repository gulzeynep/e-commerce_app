import { ApiResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const getGeneralBestSellers = async (): Promise<ApiResponse> => {
    const res = await fetch(`${API_URL}/best-sellers/general`);
    return res.json();
};

export const getBrowsingHistory = async (userId: string): Promise<ApiResponse> => {
    const res = await fetch(`${API_URL}/browsing-history/${userId}`);
    return res.json();
};

export const deleteHistoryItem = async (userId: string, productId: string): Promise<void> => {
    await fetch(`${API_URL}/browsing-history/${userId}/${productId}`, { method: "DELETE" });
};

export const getPersonalizedBestSellers = async (userId: string): Promise<ApiResponse> => {
    const res = await fetch(`${API_URL}/best-sellers/personalized/${userId}`);
    return res.json();
};