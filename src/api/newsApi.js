import axiosClient from "./axiosClient";

const newsApi = {
  // Public endpoints
  async getNews(params = {}) {
    const query = new URLSearchParams();
    if (params.tags) query.set("tags", params.tags);
    if (params.type) query.set("type", params.type);
    if (params.category) query.set("category", params.category);
    // Support source filtering (array of slugs)
    if (params.sources && Array.isArray(params.sources) && params.sources.length > 0) {
      query.set("source", params.sources.join(","));
    } else if (params.source) {
      query.set("source", params.source);
    }
    if (params.limit) query.set("limit", params.limit.toString());
    // Support favorite prioritization toggle
    if (params.prioritizeFavorites !== undefined) {
      query.set("prioritizeFavorites", params.prioritizeFavorites.toString());
    }
    const qs = query.toString();
    const { data } = await axiosClient.get(`/news${qs ? `?${qs}` : ""}`);
    return data;
  },

  async getSources() {
    const { data } = await axiosClient.get("/news/sources");
    return data;
  },

  async getCategories() {
    const { data } = await axiosClient.get("/news/categories");
    return data;
  },

  // User favorite sources
  async getFavoriteSources() {
    const { data } = await axiosClient.get("/auth/favorite-sources");
    return data;
  },

  async toggleFavoriteSource(sourceId) {
    const { data } = await axiosClient.post("/auth/favorite-sources", { sourceId });
    return data;
  },

  async removeFavoriteSource(sourceId) {
    const { data } = await axiosClient.delete(`/auth/favorite-sources/${sourceId}`);
    return data;
  },

  // Admin endpoints - News Sources
  async getAdminSources() {
    const { data } = await axiosClient.get("/admin/news-sources");
    return data;
  },

  async getAdminCategories() {
    const { data } = await axiosClient.get("/admin/news-sources/categories");
    return data;
  },

  async createSource(sourceData) {
    const { data } = await axiosClient.post("/admin/news-sources", sourceData);
    return data;
  },

  async updateSource(id, sourceData) {
    const { data } = await axiosClient.patch(`/admin/news-sources/${id}`, sourceData);
    return data;
  },

  async toggleSource(id) {
    const { data } = await axiosClient.patch(`/admin/news-sources/${id}/toggle`);
    return data;
  },

  async deleteSource(id, force = false) {
    const { data } = await axiosClient.delete(`/admin/news-sources/${id}${force ? "?force=true" : ""}`);
    return data;
  },

  // Admin endpoints - News Items
  async getAdminNews(params = {}) {
    const query = new URLSearchParams();
    if (params.type) query.set("type", params.type);
    if (params.status) query.set("status", params.status);
    const qs = query.toString();
    const { data } = await axiosClient.get(`/admin/news${qs ? `?${qs}` : ""}`);
    return data;
  },

  async createNews(newsData) {
    const { data } = await axiosClient.post("/admin/news", newsData);
    return data;
  },

  async updateNews(id, newsData) {
    const { data } = await axiosClient.patch(`/admin/news/${id}`, newsData);
    return data;
  },

  async deleteNews(id) {
    const { data } = await axiosClient.delete(`/admin/news/${id}`);
    return data;
  },
};

export default newsApi;



