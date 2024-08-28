import { useState } from "react";
import { COMMON_ERROR_MESSAGE } from "../constant/const";

import { axiosInstance } from "../interceptors/axiosInterceptors";

const useUpdateTagsApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const updateSessionTags = async ({
    onSuccessCallback,
    onErrorCallback,
    sessionId,
    tags,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axiosInstance.put(`/sessions/v2/${sessionId}`, {
        tag: tags,
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
      onErrorCallback({
        isChatDuplication: res?.response?.data?.tag_exists,
        error: errorMessage,
      });
      setError(errorMessage);
    } catch (err) {
      onErrorCallback?.({ isChatDuplication: false, error: err?.message });
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateSessionTags,
    data,
    error,
    isLoading,
  };
};

export default useUpdateTagsApi;
