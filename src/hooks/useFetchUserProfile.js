import { useEffect, useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE, RESTRICTION_TIME } from "../constant/const";

const useFetchUserProfile = ({ isCallApiOnLoad = false }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUserProfile = async ({ onSuccessCallback, onErrorCallback }) => {
    try {
      setIsLoading(true);
      setError("");
      const URL = `/profile/`;
      const res = await axiosInstance.get(URL);
      if (res?.status === 200) {
        setData(res?.data?.data?.[0]);
        onSuccessCallback?.(res?.data?.data?.[0]);
        return;
      }
      const errorMessage = res?.response?.data?.detail || COMMON_ERROR_MESSAGE;
      onErrorCallback?.(errorMessage);
      setError(errorMessage);
    } catch (err) {
      onErrorCallback?.(err?.message);
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isCallApiOnLoad) {
      fetchUserProfile({
        onSuccessCallback: (data) => {
          const isRestricted = data?.restrict;
          localStorage?.setItem(RESTRICTION_TIME, isRestricted);
        },
      });
    }
  }, []);

  return {
    fetchUserProfile,
    data,
    error,
    isLoading,
  };
};

export default useFetchUserProfile;
