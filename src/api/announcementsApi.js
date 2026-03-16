import axiosClient from "./axiosClient";

const announcementsApi = {
  list: async () => {
    const res = await axiosClient.get("/announcements");
    return res.data;
  },
};

export default announcementsApi;




