import { useEffect, useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE } from "../constant/const";

const useFetchArchiveApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchArchivedChats = async ({ onSuccessCallback, onErrorCallback }) => {
    try {
      setIsLoading(true);
      setError("");
      const URL = `/archive/list`;
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

  useEffect(() => {
    fetchArchivedChats({});
  }, []);

  return {
    fetchArchivedChats,
    data,
    error,
    isLoading,
  };
};

export default useFetchArchiveApi;
