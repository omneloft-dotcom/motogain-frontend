import axiosClient from "./axiosClient";

export const getBrands = async () => {
  const { data } = await axiosClient.get("/brands");
  return data;
};

export default { getBrands };




