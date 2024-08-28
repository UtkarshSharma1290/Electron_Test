import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";

const useUpdateSessionDetailsApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const updateSessionDetails = async ({
    onSuccessCallback,
    onErrorCallback,
    sessionId,
    name,
  }) => {
    try {
      setIsLoading(true);
      const URL = `/sessions/title/${sessionId}`;
      const res = await axiosInstance.put(URL, {
        title: name,
      });
      if (res?.status === 200) {
        setData(res?.data);
        onSuccessCallback?.(res?.data);
        return;
      }
      const errorMessage =
        res?.response?.data?.message ||
        res?.response?.data?.detail ||
        res?.message;
      onErrorCallback?.(errorMessage);
      setError(errorMessage);
    } catch (err) {
      onErrorCallback?.(err?.message);
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { updateSessionDetails, data, error, isLoading };
};

export default useUpdateSessionDetailsApi;
