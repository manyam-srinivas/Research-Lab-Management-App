import api from "./api";

const activityLogService = {
  // Get all activity logs
  getActivityLogs: async () => {
    const response = await api.get("/activity-logs/");
    return response.data;
  },

  // Get a single activity log
  getActivityLog: async (id) => {
    const response = await api.get(`/activity-logs/${id}`);
    return response.data;
  },

  // Create activity log
  createActivityLog: async (logData) => {
    const response = await api.post("/activity-logs/", logData);
    return response.data;
  },

  // Delete activity log
  deleteActivityLog: async (id) => {
    const response = await api.delete(`/activity-logs/${id}`);
    return response.data;
  },
};

export default activityLogService;