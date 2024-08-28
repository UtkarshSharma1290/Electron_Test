import { useState } from "react";

import { axiosInstance } from "../interceptors/axiosInterceptors.js";
import { COMMON_ERROR_MESSAGE, USER_EMAIL } from "../constant/const.js";

const useUploadFileApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadFileHandler = async ({
    file = null,
    customInstruction = null,
    customAI = null,
    onSuccessCallback,
    onErrorCallback,
  }) => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem(USER_EMAIL);
      const res = await axiosInstance.post("/contexts/", {
        user_id: userId,
        resume_data: file,
        custom_instruction: customInstruction,
        custom_ai_response: customAI,
      });
      if (res?.status === 200) {
        setData(res?.data?.status);
        onSuccessCallback?.(res?.data?.status);
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

  return {
    uploadFileHandler,
    data,
    error,
    isLoading,
  };
};

export default useUploadFileApi;
