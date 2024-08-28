import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";

const useMarkArchiveApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const markChatAsArchivedHandler = async ({
    onSuccessCallback,
    onErrorCallback,
    sessionId,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const URL = `/archive/chats/${sessionId}`;
      const res = await axiosInstance.put(URL);
      if (res?.status === 200) {
        setData(res?.data?.message);
        onSuccessCallback?.(res?.data?.message);
        return;
      }
    } catch (err) {
      onErrorCallback?.(err?.message);
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    markChatAsArchivedHandler,
    data,
    error,
    isLoading,
  };
};

export default useMarkArchiveApi;
