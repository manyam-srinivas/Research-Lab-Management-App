import api from "./api";

export const getNotifications = async (token) => {
  const response = await api.get("/notifications/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const createNotification = async (token, data) => {
  const response = await api.post(
    "/notifications/",
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
  const response = await api.put(
    `/notifications/${notificationId}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getUnreadCount = async (token) => {
  const response = await api.get("/notifications/unread-count", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const markAllRead = async (token) => {
  const response = await api.put(
    "/notifications/read-all",
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
  const response = await api.delete(
    `/notifications/${notificationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
