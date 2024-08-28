import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";

const useGetArchivedChatApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getArchivedChat = async ({
    onSuccessCallback,
    onErrorCallback,
    sessionId,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const URL = `/archive/chats/${sessionId}`;
      const res = await axiosInstance.get(URL);
      if (res?.status === 200) {
        setData(res?.data?.data);
        onSuccessCallback?.(res?.data?.data);
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
    getArchivedChat,
    data,
    error,
    isLoading,
  };
};

export default useGetArchivedChatApi;
