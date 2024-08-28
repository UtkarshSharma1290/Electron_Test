import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE } from "../constant/const";

const useUnShareSessionApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const unShareSession = async ({
    onSuccessCallback,
    onErrorCallback,
    sessionId,
    email,
  }) => {
    try {
      setIsLoading(true);
      const URL = `/chats/unshared/${sessionId}`;
      const res = await axiosInstance.delete(URL, {
        headers: {
          "shared-email": email,
        },
      });
      if (res?.status === 200) {
        const message = res?.data?.status || res?.data?.message;
        setData(message);
        onSuccessCallback?.(message);
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
    unShareSession,
    data,
    error,
    isLoading,
  };
};

export default useUnShareSessionApi;
