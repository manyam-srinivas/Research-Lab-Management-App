import api from "./api";

export const getAllBookings = async (token) => {
  const response = await api.get("/equipment-bookings/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getMyBookings = async (token) => {
  const response = await api.get("/equipment-bookings/my", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const createBooking = async (token, data) => {
  const response = await api.post(
    "/equipment-bookings/",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const updateBookingStatus = async (
  token,
  bookingId,
  status
) => {
  const response = await api.put(
    `/equipment-bookings/${bookingId}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const deleteBooking = async (
  token,
  bookingId
) => {
  const response = await api.delete(
    `/equipment-bookings/${bookingId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
