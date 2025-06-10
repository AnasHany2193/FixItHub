import axiosClient from "./client";

// [GET] /admin/users?role=worker
export const getUsersByRole = async (role) => {
  try {
    const { data } = await axiosClient.get(`/admin/users`, {
      params: { role },
    });
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

// [GET] /admin/users/:id
export const getUserDetails = async (userId) => {
  try {
    const { data } = await axiosClient.get(`/admin/users/${userId}`);
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch user");
  }
};

// [PATCH] /admin/users/:id/status
export const updateUserStatus = async ({ userId, status }) => {
  try {
    const { data } = await axiosClient.patch(`/admin/users/${userId}/status`, {
      status,
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update status");
  }
};

// [PATCH] /admin/users/:id/worker-approval
export const updateWorkerApproval = async ({ userId, status }) => {
  try {
    const { data } = await axiosClient.patch(
      `/admin/users/${userId}/worker-approval`,
      { status }
    );
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Worker approval failed");
  }
};

// [GET] /admin/logs
export const getAdminLogs = async () => {
  try {
    const { data } = await axiosClient.get("/admin/logs");
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch logs");
  }
};
