import axios from "axios";
import { USER_EMAIL } from "../constant/const";

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  // baseURL: process.env.REACT_APP_LOCAL_DEV,
  // baseURL:"http://192.168.1.19:1066"
  // baseURL: "http://10.10.1.159:1066",
  // baseURL: "http://0.tcp.in.ngrok.io:11757",
});

axiosInstance.interceptors.request.use((request) => {
  const userId = localStorage?.getItem(USER_EMAIL);

  if (userId) {
    request.headers["user-id"] = userId;
  }
  request.headers["encrypted-message"] = process.env.REACT_APP_SECURITY_KEY;

  return request;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    return error;
  }
);
