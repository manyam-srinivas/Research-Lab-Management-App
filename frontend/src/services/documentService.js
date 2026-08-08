import api from "./api";

export const uploadDocument = async (token, formData) => {
  const response = await api.post(`/documents/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getProjectDocuments = async (token, projectId) => {
  const response = await api.get(`/documents/project/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const downloadDocument = async (token, documentId) => {
  const response = await api.get(
    `/documents/${documentId}/download`,
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
  const response = await api.delete(
    `/documents/${documentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
