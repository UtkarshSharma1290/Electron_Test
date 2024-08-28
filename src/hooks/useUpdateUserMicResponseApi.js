import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE } from "../constant/const";

const useUpdateUserMicResponseApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const updateUserResponse = async ({
    userTranscript,
    sessionId,
    onSuccessCallback,
    onErrorCallback,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axiosInstance.put(`/chats/user/response/${sessionId}`, {
        user_response: userTranscript,
      });
      if (res?.status === 200) {
        setData(res?.data?.status);
        onSuccessCallback?.(res?.data?.status);
        return;
      }
      const errorMessage =
        res?.response?.data?.details ||
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

  return {
    updateUserResponse,
    data,
    error,
    isLoading,
  };
};

export default useUpdateUserMicResponseApi;
