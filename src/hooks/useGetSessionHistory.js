import { useState } from "react";

import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE, PAGINATION_LIMIT } from "../constant/const";

const useGetSessionHistory = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUserChatsHistory = async ({
    onSuccessCallback,
    onErrorCallback,
    pageNumber = 1,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const URL = `/sessions/`;
      const res = await axiosInstance.get(URL, {
        headers: {
          page: pageNumber,
          limit: PAGINATION_LIMIT,
        },
      });
      if (res?.status === 200) {
        let tempData = res?.data?.data;
        if (!Array.isArray(tempData)) {
          tempData = [];
        }
        setData(res?.data);
        onSuccessCallback?.(tempData);
        return;
      }
      onErrorCallback?.(COMMON_ERROR_MESSAGE);
      setError(COMMON_ERROR_MESSAGE);
    } catch (err) {
      onErrorCallback?.(err?.message);
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchUserChatsHistory,
    setData,
    data,
    error,
    isLoading,
  };
};

export default useGetSessionHistory;
