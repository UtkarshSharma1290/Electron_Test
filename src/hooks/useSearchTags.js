import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE } from "../constant/const";
import useDebounce from "./useDebounce";

const useSearchTags = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const searchTagsHandler = async ({
    onSuccessCallback,
    onErrorCallback,
    query,
    pageNumber = 1,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axiosInstance.get(`/sessions/search/tags`, {
        headers: {
          query,
          limit: 850,
          page: pageNumber,
        },
      });
      if (res?.status === 200) {
        onSuccessCallback?.(res?.data?.data);
        setData(res?.data?.data);
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

  const debouncedTagsSearchFunction = useDebounce(
    ({ onSuccessCallback, onErrorCallback, query }) =>
      searchTagsHandler({ onSuccessCallback, onErrorCallback, query })
  );

  return {
    searchTagsHandler: debouncedTagsSearchFunction,
    data,
    error,
    setData,
    isLoading,
  };
};

export default useSearchTags;
