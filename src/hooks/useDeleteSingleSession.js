import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE } from "../constant/const";

const useDeleteSingleSession = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const deleteSingleSessionHandler = async ({
    onSuccessCallback,
    onErrorCallback,
    sessionId,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const URL = `/sessions/${sessionId}`;
      const res = await axiosInstance.delete(URL);
      if (res?.status === 200) {
        const message = res?.data?.status || res?.data?.message;
        setData(message);
        onSuccessCallback?.(message);
        return;
      }
      const errorMessage = res?.response?.data?.message || COMMON_ERROR_MESSAGE;
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
    deleteSingleSessionHandler,
    data,
    error,
    isLoading,
  };
};

export default useDeleteSingleSession;
