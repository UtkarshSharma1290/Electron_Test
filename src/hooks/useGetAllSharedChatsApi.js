import { useEffect, useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";

import { COMMON_ERROR_MESSAGE } from "../constant/const";
import { toast } from "react-toastify";

const useGetAllSharedChatsApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSharedSessionToTheUser = async ({ onSuccessCallback, onErrorCallback }) => {
    try {
      setIsLoading(true);
      setError("");
      const URL = `/chats/shared`;
      const res = await axiosInstance.get(URL);
      if (res?.status === 200) {
        setData(res?.data?.data);
        onSuccessCallback?.(res?.data?.data);
        return;
      }
      const errorMessage = res?.response?.data?.detail || COMMON_ERROR_MESSAGE;
      onErrorCallback?.(errorMessage);
      setError(errorMessage);
    } catch (err) {
      onErrorCallback?.(err?.message);
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedSessionToTheUser({
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
    });
  }, []);

  return {
fetchSharedSessionToTheUser,
    data,
    error,
    isLoading,
  };
};

export default useGetAllSharedChatsApi;
