import axiosClient from "./axiosClient";

export const getMyFavorites = async () => {
  const res = await axiosClient.get("/favorites");
  return res.data;
};

export const toggleFavorite = async (listingId) => {
  const res = await axiosClient.post(`/favorites/toggle/${listingId}`);
  return res.data;
};

export default {
  getMyFavorites,
  toggleFavorite,
};
