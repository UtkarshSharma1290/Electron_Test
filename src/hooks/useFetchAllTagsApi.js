import { useEffect, useState } from "react";

import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE } from "../constant/const";
import { toast } from "react-toastify";

const useFetchAllTagsApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAllTags = async ({ onSuccessCallback, onErrorCallback }) => {
    try {
      setIsLoading(true);
      setError("");
      const URL = `/sessions/tags`;
      const res = await axiosInstance.get(URL);
      if (res?.status === 200) {
        setData(res?.data?.data);
        onSuccessCallback?.();
        return;
      }
      const errorMessage =
        res?.response?.data?.detail ||
        res?.response?.data?.message ||
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

  useEffect(() => {
    fetchAllTags({
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
    });
  }, []);

  return {
    fetchAllTags,
    data,
    error,
    isLoading,
  };
};

export default useFetchAllTagsApi;
