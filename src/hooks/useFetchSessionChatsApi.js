import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE } from "../constant/const";

const useFetchSessionChatsApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSessionChats = async ({
    onSuccessCallback,
    onErrorCallback,
    sessionId,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const URL = `/chats/sessions/${sessionId}`;
      const res = await axiosInstance.get(URL);
      if (res?.status === 200) {
        setData(res?.data);
        onSuccessCallback?.(res?.data);
        return;
      }
      const errorMessage =
        res?.response?.data?.message ||
        res?.response?.data?.detail ||
        COMMON_ERROR_MESSAGE;
      onErrorCallback?.(errorMessage);
      setError(errorMessage);
    } catch (err) {
      onErrorCallback?.(err?.message);
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchSessionChats,
    data,
    error,
    isLoading,
  };
};

export default useFetchSessionChatsApi;
