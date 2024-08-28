import { useState } from "react";

import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE } from "../constant/const";

const useFetchSharedEmailDetailsApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getSharedChatDetails = async ({
    onSuccessCallback,
    onErrorCallback,
    sessionId,
    sharedBy,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axiosInstance.get(`/chats/shared/${sessionId}`, {
        headers: {
          "shared-by": sharedBy,
        },
      });
      if (res?.status === 200) {
        setData(res?.data);
        onSuccessCallback?.(res?.data);
        return;
      }
      const errorMessage =
        res?.response?.data?.message ||
        res?.response?.data?.detail ||
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

  return {
    getSharedChatDetails,
    data,
    error,
    isLoading,
  };
};

export default useFetchSharedEmailDetailsApi;
