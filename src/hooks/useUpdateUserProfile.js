import { useState } from "react";
import { COMMON_ERROR_MESSAGE } from "../constant/const";

import { axiosInstance } from "../interceptors/axiosInterceptors";

const useUpdateUserProfile = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const updateUserProfile = async ({
    onSuccessCallback,
    onErrorCallback,
    userName,
  }) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post(`/profile/`, {
        name: userName,
      });
      if (res?.status === 200) {
        setData(res?.data);
        onSuccessCallback?.(res?.data?.message);
        return;
      }
      const errorMessage =
        res?.response?.data?.message ||
        res?.response?.data?.detail ||
        COMMON_ERROR_MESSAGE;
      onErrorCallback(errorMessage);
      setError(errorMessage);
    } catch (err) {
      onErrorCallback?.(err?.message);
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUserProfile,
    data,
    error,
    isLoading,
  };
};

export default useUpdateUserProfile;
