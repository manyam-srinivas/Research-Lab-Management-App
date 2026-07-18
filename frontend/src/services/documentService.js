import axios from "axios";

const API = "http://127.0.0.1:5000/api/documents";

export const uploadDocument = async (token, formData) => {
  const response = await axios.post(`${API}/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getProjectDocuments = async (token, projectId) => {
  const response = await axios.get(`${API}/project/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const downloadDocument = async (token, documentId) => {
  const response = await axios.get(
    `${API}/${documentId}/download`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    }
  );

  return response.data;
};

export const deleteDocument = async (token, documentId) => {
  const response = await axios.delete(
    `${API}/${documentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};