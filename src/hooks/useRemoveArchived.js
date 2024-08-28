import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE } from "../constant/const";

const useRemoveArchiveApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const removeChatFromArchivedHandler = async ({
    onSuccessCallback,
    onErrorCallback,
    sessionId,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axiosInstance.put(`/archive/unarchive/${sessionId}`);
      if (res?.status === 200) {
        setData(res?.data?.message);
        onSuccessCallback?.(res?.data?.message);
        return;
      }
      const errorMessage = res?.response?.data?.message || COMMON_ERROR_MESSAGE;
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
    removeChatFromArchivedHandler,
    data,
    error,
    isLoading,
  };
};

export default useRemoveArchiveApi;
