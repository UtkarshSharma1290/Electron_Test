import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE } from "../constant/const";

const useGetSearchedSessionDetailsApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getSearchedSessionDetails = async ({
    onSuccessCallback,
    onErrorCallback,
    sessionId,
    query,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axiosInstance.get(
        `/chats/sessions/highlight/${sessionId}`,
        {
          headers: {
            query,
          },
        }
      );
      if (res?.status === 200) {
        setData(res?.data);
        onSuccessCallback?.(res?.data);
        return;
      }
      const errorMessage = res?.response?.data?.details || COMMON_ERROR_MESSAGE;
      onErrorCallback?.(errorMessage);
      setError(errorMessage);
    } catch (err) {
      onErrorCallback?.(err?.message);
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { getSearchedSessionDetails, data, error, isLoading };
};

export default useGetSearchedSessionDetailsApi;
