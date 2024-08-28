import React, { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

import CustomLoader from "../components/molecules/customLoader";
import IconWithText from "../components/includes/IconWithText";

import useFetchSharedEmailDetailsApi from "../hooks/useFetchSharedEmailDetailsApi";
import MicIcon from "../assets/svg/mic-green.svg";
import RobotIcon from "../assets/svg/robot-screen.svg";
import GreyRobotIcon from "../assets/svg/grey-robot.svg";
import SidebarIcon from "../assets/svg/sidebar-icon.svg";
import SidebarBlackIcon from "../assets/svg/sidebar-black-icon.svg";
import GreyMicIcon from "../assets/svg/grey-mic.svg";
import { ThemeContext } from "../context/Theme/ThemeContext";
import { LIGHT } from "../constant/const";
import PersonIcon from "../assets/svg/Grey-Person.svg";
import Person from "../assets/svg/person-grey.svg";
import useFetchSessionChatsApi from "../hooks/useFetchSessionChatsApi";
import { removeCollins } from "../utils/utils";

const SharedSessionsView = ({
  sessionId,
  sharedBy,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  //custom-hooks
  const {
    getSharedChatDetails,
    data,
    isLoading: isGettingSharedByChatDetails,
    error: errorFetchingSharedByChats,
  } = useFetchSharedEmailDetailsApi();
  const {
    fetchSessionChats,
    data: sharedToChatData,
    isLoading: isGettingSharedToChatDetails,
    error: errorFetchingSharedToChats,
  } = useFetchSessionChatsApi();
  const chatsQuestionAndAnswersArray = sharedBy
    ? data?.data
    : sharedToChatData?.data;

  //contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  //useEffects
  useEffect(() => {
    if (!sessionId) {
      return;
    }
    if (sharedBy) {
      getSharedChatDetails({
        sessionId,
        sharedBy,
        onErrorCallback: (errorMessage) => {
          toast?.error(errorMessage);
        },
      });
      return;
    }
    fetchSessionChats({
      sessionId,
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
    });
  }, []);

  const isLoading =
    isGettingSharedByChatDetails || isGettingSharedToChatDetails;
  const error = errorFetchingSharedByChats || errorFetchingSharedToChats;

  return (
    <div className="rounded-[12px] w-full bg-[#FFFFFF] dark:bg-black h-full overflow-hidden">
      <div className="bg-[#D0D5DD] relative dark:bg-[#414141] px-[8px] py-[12px] w-full flex justify-center items-center min-h-[40px] max-h-[40px]">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center justify-start flex-1"
          >
            <img
              src={isWhite ? SidebarBlackIcon : SidebarIcon}
              alt="sidebar"
              className="w-[24px] h-[24px] opacity-70"
            />
          </button>
        )}
        <p className="absolute text-[14px] font-normal text-black dark:text-[#FFFFFF]">
          View Only
        </p>
      </div>
      {!isLoading && !error && (
        <div className="py-[40px] h-full max-w-[80%] m-auto overflow-y-auto max-h-[85vh]">
          {!!sessionId &&
            chatsQuestionAndAnswersArray?.map((item, index) => {
              return (
                <div
                  className="flex flex-col gap-2 w-full"
                  key={`${item?.question}+${index}`}
                >
                  <IconWithText
                    icon={isWhite ? GreyMicIcon : MicIcon}
                    text={removeCollins(item?.question)}
                    IconContainerClassName={isWhite ? `bg-GrayText` : ""}
                  />
                  <IconWithText
                    icon={isWhite ? GreyRobotIcon : RobotIcon}
                    text={item?.answer}
                    IconContainerClassName={isWhite ? `bg-GrayText` : ""}
                  />
                  {!!removeCollins(item?.userAudioTranscription) && (
                    <IconWithText
                      isReverse
                      isDownIcon
                      icon={isWhite ? PersonIcon : Person}
                      className={
                        !isWhite
                          ? "dark:bg-GreyBackground rounded-lg p-[16px]"
                          : ""
                      }
                      classNameIcon={isWhite ? "min-w-[20px]" : ""}
                      IconContainerClassName={`${
                        isWhite ? `p-0 px-0 rounded-none` : "bg-Neon"
                      } min-w-fit`}
                      text={removeCollins(item?.userAudioTranscription)}
                    />
                  )}
                </div>
              );
            })}
          {!chatsQuestionAndAnswersArray?.length && (
            <div className="dark:text-white h-full flex justify-center items-center">
              <p className="text-black dark:text-white">No Chats to Show!</p>
            </div>
          )}
        </div>
      )}
      {isLoading && (
        <div className="min-h-[80vh] flex justify-center items-center">
          <CustomLoader />
        </div>
      )}
      {!!error && !!sessionId && (
        <div className="h-full flex justify-center items-center">
          <p className="text-black dark:text-white">{error}</p>
        </div>
      )}
      {!!error && !sessionId && (
        <div className="h-full flex justify-center items-center">
          <p className="text-black dark:text-white">
            No session is selected to view!
          </p>
        </div>
      )}
    </div>
  );
};

SharedSessionsView.propTypes = {
  sessionId: PropTypes.string,
  sharedBy: PropTypes.string,
};

export default SharedSessionsView;
