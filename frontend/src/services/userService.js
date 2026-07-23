import axios from "axios";

const API = "http://127.0.0.1:5000/api/users";

export const getUsers = async (token) => {
  const response = await axios.get(`${API}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};