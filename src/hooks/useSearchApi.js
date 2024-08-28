import { useState } from "react";
import { axiosInstance } from "../interceptors/axiosInterceptors";
import { COMMON_ERROR_MESSAGE, PAGINATION_LIMIT } from "../constant/const";

import useDebounce from "./useDebounce";

const useSearchApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const searchQueryHandler = async ({
    onSuccessCallback,
    onErrorCallback,
    query,
    pageNumber,
    isSearch = true,
  }) => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axiosInstance.get(`/sessions/filter`, {
        headers: {
          query,
          limit: PAGINATION_LIMIT,
          page: pageNumber || 1,
          type: isSearch ? "search" : "filter",
        },
      });
      if (res?.status === 200) {
        onSuccessCallback?.(res?.data);
        setData(res?.data);
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

  const debouncedSearchFunction = useDebounce(
    ({ onSuccessCallback, onErrorCallback, query, pageNumber, isSearch }) =>
      searchQueryHandler({
        onSuccessCallback,
        onErrorCallback,
        query,
        pageNumber,
        isSearch,
      })
  );

  return {
    searchQueryHandler: debouncedSearchFunction,
    data,
    error,
    setData,
    isLoading,
  };
};

export default useSearchApi;
