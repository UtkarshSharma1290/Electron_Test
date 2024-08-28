import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE } from "../constant/const";

const useShareChatApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const shareChatHandler = async ({
    onSuccessCallback,
    onErrorCallback,
    sessionId,
    emailToShare,
  }) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post(
        `/chats/shared/${sessionId}/${emailToShare}`
      );
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
    shareChatHandler,
    data,
    error,
    isLoading,
  };
};

export default useShareChatApi;
