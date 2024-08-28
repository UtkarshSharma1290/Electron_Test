import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE } from "../constant/const";

const useFetchAllSharedToSessionsApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSessionSharedByTheUser = async ({
    onSuccessCallback,
    onErrorCallback,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const URL = `/chats/shared_by`;
      const res = await axiosInstance.get(URL);
      if (res?.status === 200) {
        setData(res?.data?.data);
        onSuccessCallback?.();
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

  return {
    fetchSessionSharedByTheUser,
    data,
    error,
    isLoading,
  };
};

export default useFetchAllSharedToSessionsApi;
