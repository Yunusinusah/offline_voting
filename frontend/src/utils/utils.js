import api from "./api";
import { toast } from "react-toastify";

export const fetchElections = async () => {
  try {
    const response = await api.get("/admin/elections");
    if (response.status === 200) {
      return response.data || [];
    }
    return [];
  } catch (error) {
    toast.error("Error fetching elections",error);
    return [];
  }
};