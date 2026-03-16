import axiosClient from "./axiosClient";

const conversationsApi = {
  startConversation: async (listingId, sellerId) => {
    const res = await axiosClient.post("/conversations/start", {
      listingId,
      sellerId,
    });
    return res.data;
  },

  getConversations: async () => {
    const res = await axiosClient.get("/conversations");
    return res.data;
  },

  getConversationById: async (conversationId) => {
    const res = await axiosClient.get(`/conversations/${conversationId}`);
    return res.data;
  },
};

export default conversationsApi;
