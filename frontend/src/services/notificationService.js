import axios from "axios";

const API = "http://127.0.0.1:5000/api/notifications";

export const getNotifications = async (token) => {
  const response = await axios.get(`${API}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const createNotification = async (token, data) => {
  const response = await axios.post(
    `${API}/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const markAsRead = async (
  token,
  notificationId
) => {
  const response = await axios.put(
    `${API}/${notificationId}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const deleteNotification = async (
  token,
  notificationId
) => {
  const response = await axios.delete(
    `${API}/${notificationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};