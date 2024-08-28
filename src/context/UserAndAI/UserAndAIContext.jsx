import React, { createContext, useEffect, useMemo, useState } from "react";
import useFetchUserContextApi from "../../hooks/useFetchUserContextApi";
import { toast } from "react-toastify";

export const UserAndAIContext = createContext();

const initialState = {
  userInstructions: "",
  aiContext: "",
  resume: "",
};

const UserAndAIContextProvider = ({ children }) => {
  //states
  const [userAndAi, setUserAndAi] = useState(initialState);

  //custom-hooks
  const { fetchUserContext } = useFetchUserContextApi();

  //functions
  const fetchUserAndAiContextData = () => {
    fetchUserContext({
      onSuccessCallback: (response) => {
        setUserAndAi({
          userInstructions: response?.custom_instruction,
          aiContext: response?.custom_ai_response,
          resume: response?.resume_data,
        });
      },
      onErrorCallback: () => {
        toast?.error("Unable to fetch user and ai context!");
      },
    });
  };

  useEffect(() => {
    fetchUserAndAiContextData();
  }, []);

  const value = useMemo(
    () => ({ userAndAi, setUserAndAi, fetchUserAndAiContextData }),
    [userAndAi, setUserAndAi]
  );

  return (
    <UserAndAIContext.Provider value={value}>
      {children}
    </UserAndAIContext.Provider>
  );
};

export default UserAndAIContextProvider;
