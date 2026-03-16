import axiosClient from "../../api/axiosClient";

export async function submitCampaignLead(payload) {
  const { data } = await axiosClient.post("/campaign-leads", payload);
  return data;
}
