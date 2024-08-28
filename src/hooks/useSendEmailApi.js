import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";

const useSendEmailApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const sendEmail = async ({ email, onSuccessCallback, onErrorCallback }) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post("/emailVerfication", {
        email,
      });
      if (res?.ok) {
        setData(res?.data);
        onSuccessCallback?.();
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
    sendEmail,
    data,
    error,
    isLoading,
  };
};

export default useSendEmailApi;
