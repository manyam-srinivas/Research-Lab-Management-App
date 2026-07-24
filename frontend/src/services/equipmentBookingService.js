import axios from "axios";

const API = "http://127.0.0.1:5000/api/equipment-bookings";

export const getAllBookings = async (token) => {
  const response = await axios.get(`${API}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getMyBookings = async (token) => {
  const response = await axios.get(`${API}/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const createBooking = async (token, data) => {
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

export const updateBookingStatus = async (
  token,
  bookingId,
  status
) => {
  const response = await axios.put(
    `${API}/${bookingId}/status`,
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
  const response = await axios.delete(
    `${API}/${bookingId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};