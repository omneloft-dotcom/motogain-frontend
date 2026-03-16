// src/api/conversationApi.js
import api from "./apiClient";

const conversationApi = {
  getMyConversations: async () => {
    const res = await api.get(`/conversations`);
    return res.data;
  },
};

export default conversationApi;
