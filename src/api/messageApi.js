import axiosClient from "./axiosClient";

const messageApi = {
  getMessages: (conversationId) =>
    axiosClient.get(`/messages/${conversationId}`).then((res) => res.data),

  sendMessage: (data) =>
    axiosClient.post("/messages/send", data).then((res) => res.data),

  sendReply: (data) =>
    axiosClient.post("/messages/reply", data).then((res) => res.data),

  markAsRead: (conversationId) =>
    axiosClient.post(`/messages/mark-read/${conversationId}`).then((res) => res.data),

  sendOffer: (data) =>
    axiosClient.post("/messages/offer", data).then((res) => res.data),

  counterOffer: (messageId, offerAmount) =>
    axiosClient.post(`/messages/offer/${messageId}/counter`, { offerAmount }).then((res) => res.data),

  respondToOffer: (messageId, action) =>
    axiosClient.post(`/messages/offer/${messageId}/respond`, { action }).then((res) => res.data),
};

export default messageApi;
