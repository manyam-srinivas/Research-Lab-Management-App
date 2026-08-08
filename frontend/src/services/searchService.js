import api from "./api";

export const searchAll = async (token, query) => {
  const response = await api.get(
    `/search/?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
