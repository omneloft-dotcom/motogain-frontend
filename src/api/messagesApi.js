import axiosClient from "./axiosClient";

const messagesApi = {
  /**
   * Send offer
   * POST /api/messages/offer
   */
  sendOffer: async (conversationId, offerAmount) => {
    const res = await axiosClient.post("/messages/offer", {
      conversationId,
      offerAmount,
    });
    return res.data;
  },

  /**
   * Send message
   * POST /api/messages/send
   */
  sendMessage: async (listingId, recipientId, content) => {
    const res = await axiosClient.post("/messages/send", {
      listingId,
      recipientId,
      content,
    });
    return res.data;
  },

  /**
   * Reply to conversation
   * POST /api/messages/reply
   */
  replyMessage: async (conversationId, content) => {
    const res = await axiosClient.post("/messages/reply", {
      conversationId,
      content,
    });
    return res.data;
  },

  /**
   * Get messages for conversation
   * GET /api/messages/:conversationId
   */
  getMessages: async (conversationId) => {
    const res = await axiosClient.get(`/messages/${conversationId}`);
    return res.data;
  },

  /**
   * Mark messages as read
   * POST /api/messages/mark-read/:conversationId
   */
  markAsRead: async (conversationId) => {
    const res = await axiosClient.post(`/messages/mark-read/${conversationId}`);
    return res.data;
  },

  /**
   * Accept or reject offer
   * POST /api/messages/offer/:messageId/respond
   */
  respondToOffer: async (messageId, action) => {
    const res = await axiosClient.post(`/messages/offer/${messageId}/respond`, {
      action, // "accept" or "reject"
    });
    return res.data;
  },

  /**
   * Counter offer
   * POST /api/messages/offer/:messageId/counter
   */
  counterOffer: async (messageId, offerAmount) => {
    const res = await axiosClient.post(`/messages/offer/${messageId}/counter`, {
      offerAmount,
    });
    return res.data;
  },
};

export default messagesApi;
