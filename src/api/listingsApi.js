// src/api/listingsApi.js
import axiosClient from "./axiosClient";

// --------------------------------------
// TÜM İLANLAR (Filtre destekli) - FAZ 15
// GET /api/listings
// --------------------------------------
export const getListings = async (filters = {}) => {
  const params = {};

  // City filter (single) - explicit check for non-empty string
  if (filters.city !== undefined && filters.city !== "") {
    params.city = filters.city;
  }

  // Category filter (single) - explicit check for non-empty string
  if (filters.category !== undefined && filters.category !== "") {
    params.category = filters.category;
  }
  if (filters.parentCategory !== undefined && filters.parentCategory !== "") {
    params.parentCategory = filters.parentCategory;
  }
  if (filters.brand !== undefined && filters.brand !== "") {
    params.brand = filters.brand;
  }
  if (filters.model && filters.model.trim() !== "") {
    params.model = filters.model.trim();
  }

  // Year range - convert string to Number, validate before sending
  if (filters.yearMin !== "" && filters.yearMin !== undefined) {
    const n = Number(filters.yearMin);
    if (Number.isFinite(n) && n >= 1900) {
      params.yearMin = n;
    }
  }
  if (filters.yearMax !== "" && filters.yearMax !== undefined) {
    const n = Number(filters.yearMax);
    if (Number.isFinite(n) && n >= 1900) {
      params.yearMax = n;
    }
  }

  if (filters.condition !== undefined && filters.condition !== "") {
    params.condition = filters.condition;
  }

  // Text search - explicit check for non-empty string
  if (filters.q !== undefined && filters.q !== "") {
    params.q = filters.q;
  }

  // Price range - only include if valid finite number
  if (filters.priceMin !== "" && filters.priceMin !== undefined) {
    const n = typeof filters.priceMin === "number" ? filters.priceMin : Number(filters.priceMin);
    if (Number.isFinite(n) && n >= 0) {
      params.priceMin = n;
    }
  }
  if (filters.priceMax !== "" && filters.priceMax !== undefined) {
    const n = typeof filters.priceMax === "number" ? filters.priceMax : Number(filters.priceMax);
    if (Number.isFinite(n) && n >= 0) {
      params.priceMax = n;
    }
  }

  // DEBUG: verify API params
  console.log("[listingsApi] API params->", params);

  // Sorting - always include if present
  if (filters.sort !== undefined && filters.sort !== "") {
    params.sort = filters.sort;
  }

  // Only active
  if (filters.onlyActive) {
    params.onlyActive = "true";
  }

  const res = await axiosClient.get("/listings", { params });
  return res.data;
};

// --------------------------------------
// KULLANICININ KENDİ İLANLARI (LEGACY)
// GET /api/listings/mine
// --------------------------------------
export const getMyListings = async () => {
  const res = await axiosClient.get("/listings/mine");
  return res.data;
};

// --------------------------------------
// KULLANICININ KENDİ İLANLARI + STATUS FİLTRE (FAZ 15)
// GET /api/listings/my
// --------------------------------------
export const getUserListings = async (status = null) => {
  const params = {};
  if (status) {
    params.status = status;
  }
  const res = await axiosClient.get("/listings/my", { params });
  return res.data;
};

// --------------------------------------
// TEK İLAN DETAY
// GET /api/listings/:id
// --------------------------------------
export const getListingById = async (id) => {
  const res = await axiosClient.get(`/listings/${id}`);
  return res.data;
};

// --------------------------------------
// İLAN OLUŞTUR
// POST /api/listings
// --------------------------------------
export const createListing = async (payload) => {
  const res = await axiosClient.post("/listings", payload);
  return res.data;
};

// --------------------------------------
// İLAN GÜNCELLE
// PUT /api/listings/:id
// --------------------------------------
export const updateListing = async (id, payload) => {
  const res = await axiosClient.put(`/listings/${id}`, payload);
  return res.data;
};

// --------------------------------------
// İLAN KAPAT (FAZ 18: Sade kapatma nedeni ile)
// POST /api/listings/:id/close
// --------------------------------------
export const closeListing = async (id, closeReason) => {
  const res = await axiosClient.post(`/listings/${id}/close`, { closeReason });
  return res.data;
};

// --------------------------------------
// Default export – eski kodlarla uyum
// --------------------------------------
const listingsApi = {
  getListings,
  getMyListings,
  getUserListings, // FAZ 15
  getListingById,
  getById: getListingById,
  createListing,
  updateListing,
  closeListing, // FAZ 18
};

export default listingsApi;
