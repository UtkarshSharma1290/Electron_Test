import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE } from "../constant/const";

const useDeleteAllSessionApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const deleteAllSessionAndChatHandler = async ({
    onSuccessCallback,
    onErrorCallback,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const URL = `/session`;
      const res = await axiosInstance.delete(URL);
      if (res?.status === 200) {
        setData(res?.data?.status);
        onSuccessCallback?.({ message: res?.data?.status });
        return;
      }
      const errorMessage =
        res?.response?.data?.message ||
        res?.response?.data?.detail ||
        COMMON_ERROR_MESSAGE;
      onErrorCallback?.(errorMessage);
      setError(errorMessage);
    } catch (err) {
      setError(err?.message);
      onErrorCallback?.(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteAllSessionAndChatHandler,
    data,
    error,
    isLoading,
  };
};

export default useDeleteAllSessionApi;
