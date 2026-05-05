import axios from "axios";

const API = "http://localhost:5000/api"; 

export const addAssignment = async (data) => {
  try {
    const res = await axios.post(`${API}/allocations`, data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "שגיאה כללית" };
  }
};
