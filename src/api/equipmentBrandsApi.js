import axiosClient from "./axiosClient";

export const getEquipmentBrands = async (category = "") => {
  const res = await axiosClient.get("/equipment-brands", {
    params: category ? { category } : {},
  });
  return res.data;
};

export default {
  getEquipmentBrands,
};




