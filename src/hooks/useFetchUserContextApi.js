import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";

const useFetchUserContextApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUserContext = async ({
    onSuccessCallback,
    onErrorCallback,
    sessionId,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const URL = `/contexts/`;
      const res = await axiosInstance.get(URL);
      if (res?.status === 200) {
        setData(res?.data?.data);
        onSuccessCallback?.(res?.data?.data);
        return;
      }
      const errorMessage = "Someting went wrong! while getting user context";
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
    fetchUserContext,
    data,
    error,
    isLoading,
  };
};

export default useFetchUserContextApi;
