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



export const getNavProcessFunds = async () => {
  try {
    const res = await api.get("nav/nav-Process-funds");
    return res.data.funds || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
