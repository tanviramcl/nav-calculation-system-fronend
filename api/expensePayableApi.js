import api from "./api"; // your axios instance
import { toast } from "react-toastify";
import CONFIG from "../config";
/**
 * Login API
 * @param {string} userID 
 * @param {string} password 
 * @returns {Promise<{ token: string, userId: string }>}
 */

const projectId = CONFIG.PROJECT_ID;



export const getExpenseTypeList = async () => {
  try {
    const res = await api.get("payable/expenseTypeList");

  console.log("Expense Type List API Response:", res.data);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch expense types", error);
    throw error;
  }
};


export const getmanagementFeeList = async (
  expenseTypeId,
  navDate,
  days
) => {
  try {
    const res = await api.get("payable/managmentFeeList", {
      params: {
        expenseTypeId,
        navDate,
        days,
      },
    });

    console.log("ManagmentFeeList API Response:", res.data);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch management fees", error);
    toast.error("Failed to fetch management fees");
    throw error;
  }
};

export const loginUser = async (userID, password) => {
  try {
    const response = await api.post("auth/login", {
      userId: userID,       // note: must match the backend DTO property names
      password: password,
      projectId: projectId  // include projectId
    });

    

    return response.data; // { token, userId, passwordUpToDate }
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.error || "Login failed");
    throw error; // so the calling page can handle it if needed
  }
};

export const updatePassword = async ({ userId, oldPassword, newPassword }) => {
  try {
    const response = await api.post("users/update-password", {
      userId,
      oldPassword,
      newPassword,
      projectId,
    });

    toast.success("Password updated successfully.");
    return response.data;
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.error || "Password update failed");
    throw error;
  }
};

export const getUserMenus = async (userId, projectId) => {
  try {
    const res = await api.get(`users/menus?userId=${userId}&projectId=${projectId}`);
    return res.data;
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.error || "Failed to load menu");
    throw err;
  }
};

export const getProjectDetails = async (projectId) => {
  try {
    const res = await api.get(`users/project?projectId=${projectId}`);
    return res.data; // { id, name, url, valid, ... }
  } catch (error) {
    console.error(error);
    toast.error("Failed to load project info");
    throw error;
  }
};

export const getUserImage = async (userId) => {
  try {
    const response = await api.get(`/users/image/${userId}.jpg`, {
      responseType: "blob", // important: get image as blob
    });
    return response.data; // Blob
  } catch (error) {
    console.error("Error fetching user image:", error);
    throw error;
  }
}

export const getLoginHistory = async (userId, projectId) => {
  try {
    const res = await api.get(
      `users/login-history?userId=${userId}&projectId=${projectId}`
    );
    return res.data; // array of login records
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch login history");
    throw error;
  }
};

export const getUserGridAPI = async ({ serachUserId = "", phoneNumber = "" } = {}) => {
  try {
    const res = await api.get("users/user-grid", {
      params: {
        userId: serachUserId,
        phoneNumber,
        projectId,
      },
    });

    return res.data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch user grid");
    throw error;
  }

};


export const getActiveEmployees = async () => {
  try {
    const res = await api.get("users/employees/active");
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch active employees", error);
    toast.error("Failed to fetch active employees");
    throw error;
  }

};


export const checkUserIdExists = async (userId) => {
  try {
    const res = await api.get(`users/user-exists/${userId}`);
    return res.data.exists;
  } catch (error) {
    console.error("Failed to check user ID existence", error);
    toast.error("Failed to check user ID existence");
    throw error;
  }
};

export const saveUserAPI = async (formData) => {
  try {
    const res = await api.post("users/user-save", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to save user", error);
    toast.error(
      error.response?.data?.error || "Failed to create user due to server error"
    );
    throw error;
  }
};

export const updateUserAPI = async (formData) => {
  try {
    const res = await api.put("users/user-update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to update user", error);
    toast.error(
      error.response?.data?.error || "Failed to update user due to server error"
    );
    throw error;
  }
};

export const toggleUserStatusAPI = async (userId) => {
  try {
    const res = await api.delete(`users/user-toggle/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to toggle user status", error);
    toast.error("Failed to toggle user status");
    throw error;
  }
};

export const resetUserPasswordAPI = async (userId) => {
  try {


    const res = await api.post(`users/reset-password`, { userId });
    
    return res.data;
  } catch (error) {
    console.error("Failed to reset user password", error);
    toast.error("Failed to reset user password");
    throw error;
  }
};


export const userDropdownAPI = async () => {
  try {

    const res = await api.get("users/active-user-ids");
    console.log("User Dropdown API Response:", res.data);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch user dropdown", error);
    toast.error("Failed to fetch user dropdown");
    throw error;
  }
};

export const fundsDropdownAPI = async () => {
  try {

    const res = await api.get("users/funds");
    console.log("User funds API Response:", res.data);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch userfunds funds", error);
    toast.error("Failed to fetch userfunds");
    throw error;
  }
};


export const baranchDropdownAPI = async () => {
  try {

    const res = await api.get("users/branchList");
    console.log("User branch API Response:", res.data);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch userBranchList", error);
    toast.error("Failed to fetch userBranchList");
    throw error;
  }
};



export const assignUserFundAPI = async (payload) => {
  try {
    const res = await api.post("users/user-fund-add", payload);
    return res.data;
  } catch (error) {
    console.error("Failed to assign fund", error);
    throw error;
  }
};

export const assignUserBranchAPI = async (payload) => {
  try {
    const res = await api.post("users/user-branch-add", payload);
    return res.data;
  } catch (error) {
    console.error("Failed to assign branch", error);
    throw error;
  }
};


export const getUserFundsAPI = async (userId) => {
  const res = await api.get(`/users/userFundList/${userId}`);
  return res.data;
};

export const getUserBranchesAPI = async (userId) => {
  const res = await api.get(`/users/userBranchList/${userId}`);
  return res.data;
};

export const getUserDetailsAPI = async (userId) => {
  try {
    const res = await api.get(`users/user-details/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch user details", error);
    toast.error("Failed to fetch user details");
    throw error;
  }
};

export const getAllProjectsAPI = async () => {
  try {
    const res = await api.get("users/valid-projects");
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch all projects", error);
    toast.error("Failed to fetch all projects");
    throw error;
  }
};

export const userBasisProjectsAPI = async (userId) => {
  try {
    const res = await api.get(`users/user-projects/${userId}`);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch user basis projects", error);
    toast.error("Failed to fetch user basis projects");
    throw error;
  }
};

export const checkUserProjectValidAPI = async (userId, projectId) => {
  try {
    const res = await api.get(`users/user-project-valid/${userId}/${projectId}`);

    return res.data;
  } catch (error) {
    console.error("Failed to check user project validity", error);
    toast.error("Failed to check user project validity");
    throw error;
  }

  };

export const assignUserToProjectAPI = async (userId, projectId, assignedBy) => {
  try {

    const remarks = `Assigned to project ${projectId} by ${assignedBy}`;
    const res = await api.post(`users/user-project-add`, {
      userId,
      projectId,
      remarks,
    });
    return res.data;
  } catch (error) {
    console.error("Failed to assign user to project", error);
    toast.error("Failed to assign user to project");
    throw error;
  }
};

export const revokeUserFromProjectAPI = async (userId, projectId) => {
  try {
    const res = await api.post(`users/user-project-revoke`, {
      userId,
      projectId,
    });
    return res.data;
  } catch (error) {
    console.error("Failed to revoke user from project", error);
    toast.error("Failed to revoke user from project");
    throw error;
  }
};

export const getUserMenusAPI = async (userId, projectId) => {
  try {
    const res = await api.get(`users/user-menu/${userId}/${projectId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch user menus", error);
    toast.error("Failed to fetch user menus");
    throw error;
  }
};


export const updateUserMenusAPI = async (userId, projectId, menuIds) => {
  try {
    const res = await api.post("users/user-menu-update", {
      userId,
      projectId,
      menuIds,

    });
    return res;
  } catch (error) {
    console.error("Failed to update user menus", error);
    toast.error("Failed to update user menus");
    throw error;
  }
};

export const getDashboardStatsAPI = async () => {
  try {
    const res = await api.get("users/user-dashboard-stats");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch dashboard stats", error);
    toast.error("Failed to fetch dashboard stats");
    throw error;
  }
};

export const getProjectWiseUserCountAPI = async () => {
  try {
    const res = await api.get("users/project-wise-user-count");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch project wise user count", error);
    toast.error("Failed to fetch project wise user count");
    throw error;
  }
};