import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";

const useAddAuthenticateUserApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const addAuthenticateUserToDb = async ({
    onSuccessCallback,
    onErrorCallback,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const URL = `/profile/authenticate`;
      const res = await axiosInstance.post(URL);
      if (res?.status === 200) {
        setData(res?.data);
        onSuccessCallback?.(res?.data);
        return;
      }
      const errorMessage =
        res?.response?.data?.message ||
        res?.response?.data?.detail ||
        res?.message;
      onErrorCallback?.(errorMessage);
      setError(errorMessage);
    } catch (err) {
      onErrorCallback?.(err?.message);
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { addAuthenticateUserToDb, data, error, isLoading };
};

export default useAddAuthenticateUserApi;
