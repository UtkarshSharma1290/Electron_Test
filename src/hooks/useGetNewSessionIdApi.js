import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE } from "../constant/const";

const useGetNewSessionIdApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getNewSessionId = async ({ onSuccessCallback, onErrorCallback }) => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axiosInstance.get("/sessions/generate");
      if (res?.status === 200) {
        setData(res?.data?.session_id);
        onSuccessCallback?.(res?.data?.session_id);
        return;
      }
      const errorMessage = res?.response?.data?.details || COMMON_ERROR_MESSAGE;
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
    getNewSessionId,
    data,
    error,
    isLoading,
  };
};

export default useGetNewSessionIdApi;
