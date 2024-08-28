import React, { useContext, useEffect, useState } from "react";
import TextareaAutoSize from "react-textarea-autosize";
import MarkdownPreview from "@uiw/react-markdown-preview";
import PropTypes from "prop-types";

import ArrowsBar from "../components/molecules/ArrowsBar";
import AutoMaticMicrophoneButton from "../components/molecules/AutoMaticMicrophoneButton";
import ManualMicrophoneButton from "../components/molecules/ManualMIcrophoneButton";
import ChatHeader from "../components/includes/ChatHeader";
import ChatPromptAndResponse from "../components/includes/ChatPromptAndResponse";
import DashIntroSection from "../components/includes/dashIntroSection";
import SmallBodyText from "../components/molecules/SmallBodyText";
import BodyTextTitle from "../components/molecules/BodyTextTitle";
import CustomLoader from "../components/molecules/customLoader";
import IconWithText from "../components/includes/IconWithText";

import { ThemeContext } from "../context/Theme/ThemeContext";
import BackgroundImg from "../assets/img/3d-render-imge.png";
import sendIcons from "../assets/img/sendIcons.png";
import WhiteSendIcon from "../assets/svg/white-send-icon.svg";
import SidebarIcon from "../assets/svg/sidebar-icon.svg";
import SidebarBlackIcon from "../assets/svg/sidebar-black-icon.svg";
import RightIcons from "../assets/img/animationRight.gif";
import GreyRobotIcon from "../assets/svg/grey-robot.svg";
import PersonIcon from "../assets/svg/person-grey.svg";
import Person from "../assets/svg/Grey-Person.svg";
import RetryIcon from "../assets/svg/Retry-icon.svg";
import { UserChatRobotIcons } from "../assets/svgIcon";
import { markDownTextEdit } from "../utils/utils";
import {
  AI_INTERVIEW_DISCLAIMER,
  LIGHT,
  MOBILE_WIDTH,
} from "../constant/const";
import useDimension from "../hooks/useDimensions";

const ChatSection = ({
  isSidebarVisible,
  setIsSidebarVisible,
  selectedSearchKeys,
  chatLog,
  isLoading,
  currentSelectedThread,
  allEmailsAndTagsOfCurrentSessionSharedWith,
  isShowMyResponses,
  setIsShowMyResponses,
  bottomRef,
  textAreaInputRef,
  isApiResponseLoading,
  handleGenerateResponse,
  handleRecording,
  inputText,
  isUserOptForAutomatedProcess,
  setInputText,
  handleSubmit,
  isShowChatInput,
  minutes,
  seconds,
  openMic,
  setSessionData,
  toast,
  microphoneTranscription,
  isPause,
  onTogglePauseRecording,
  isShowWordSearchArrows,
}) => {
  //states
  const [currentSelectedKeyIndex, setCurrentSelectedKeyIndex] = useState(0);

  //custom-hooks
  const { width } = useDimension();
  const isMobile = width <= MOBILE_WIDTH;

  //contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  //functions
  const getUserAudioText = (userAudioText) => {
    if (openMic || userAudioText) {
      let textToShow = userAudioText;
      return {
        isShow: true,
        text: textToShow || microphoneTranscription || "...",
      };
    }
    return { isShow: false };
  };

  const moveFocusOnText = (isUP) => {
    const keysArray = selectedSearchKeys;
    if (isUP) {
      const prevKey =
        currentSelectedKeyIndex - 1 >= 0
          ? currentSelectedKeyIndex - 1
          : currentSelectedKeyIndex;
      setCurrentSelectedKeyIndex(prevKey);
      const spanElement = document?.getElementsByClassName(
        keysArray[prevKey]?.key
      )?.[0];
      spanElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const nextKey =
      currentSelectedKeyIndex + 1 < keysArray?.length
        ? currentSelectedKeyIndex + 1
        : currentSelectedKeyIndex;
    setCurrentSelectedKeyIndex(nextKey);
    const spanElement = document?.getElementsByClassName(
      keysArray[nextKey]?.key
    )?.[0];
    spanElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    setCurrentSelectedKeyIndex(0);
  }, [selectedSearchKeys]);

  return (
    <div
      className={`${
        isSidebarVisible ? "w-[80%]" : "ml-5 w-[98%]"
      } relative py-4 pr-4`}
    >
      <div
        className={`
          relative 
          bg-white 
          dark:bg-blackBG 
          flex 
          justify-between 
          items-center 
          w-[100%]
          h-full 
          rounded-xl 
          flex-col 
          overflow-auto
        `}
      >
        <div className="w-full h-[10%]">
          {!isWhite && (
            <img
              src={BackgroundImg}
              alt="BackgroundImg"
              className={`
              absolute 
              bottom-0 
              mix-blend-[luminosity] 
              h-full 
              w-full 
              object-cover 
            ${
              chatLog?.length === 0 || isLoading
                ? "bg-custom-gradient block"
                : "hidden"
            }`}
            />
          )}
          {!openMic ? (
            !isSidebarVisible &&
            !chatLog?.length && (
              <button
                onClick={() => setIsSidebarVisible(true)}
                className="flex justify-start pt-5 pl-2 w-full min-w-[30px]"
              >
                <img
                  src={isWhite ? SidebarBlackIcon : SidebarIcon}
                  alt="sidebar"
                  className="w-[24px] h-[24px] opacity-70"
                />
              </button>
            )
          ) : (
            <div
              className={`
              top-0 
              w-full 
              h-10 
              rounded-t-xl 
              bg-LightGrey 
              dark:bg-[#414141] 
              flex 
              items-center 
              px-4
          `}
            >
              <SmallBodyText
                text={AI_INTERVIEW_DISCLAIMER}
                textColor="text-black dark:text-white"
              />
            </div>
          )}
          {((!isLoading && !!chatLog?.length) || openMic) &&
            isShowChatInput && (
              <ChatHeader
                sessionId={currentSelectedThread}
                {...{
                  isSidebarVisible,
                  setIsSidebarVisible,
                  toast,
                  setSessionData,
                  allEmailsAndTagsOfCurrentSessionSharedWith,
                  isShowMyResponses,
                  setIsShowMyResponses,
                  currentSelectedThread,
                }}
              />
            )}
        </div>
        <div
          className={`
          relative
          max-w-[758px] 
          w-full 
          h-[88%]
          flex 
          flex-col 
          ${openMic ? "max-h-[calc(100%-100px)]" : ""}
          items-center 
          pb-6 
          ${chatLog?.length === 0 ? "justify-end" : "gap-4 justify-between"}`}
        >
          {isLoading ? (
            <div className="h-full flex items-center ">
              <CustomLoader />
            </div>
          ) : (
            <>
              {chatLog?.length === 0 ? (
                <DashIntroSection />
              ) : (
                <div
                  className={`${
                    openMic ? "" : "max-h-[70vh] h-lg:max-h-[75vh]"
                  } 
                  w-full 
                  overflow-x-hidden 
                  overflow-y-auto 
                  dark:text-white 
                  mt-10 
                  flex 
                  flex-col
                  p-2 
                  gap-4`}
                  ref={bottomRef}
                >
                  {chatLog?.map((chat, index) => (
                    <div
                      className="w-full flex flex-col gap-4 pr-4"
                      key={index}
                    >
                      <ChatPromptAndResponse {...{ chat }} />
                      {chat.botResponse !== "" ? (
                        <div>
                          <div className="w-full flex justify-start items-start gap-3">
                            <div className="dark:w-10 dark:h-10 rounded-full p-2 bg-GrayText dark:bg-primaryBG">
                              {isWhite ? (
                                <img
                                  src={GreyRobotIcon}
                                  alt="robot-icon"
                                  className="min-w-[16px] min-h-[16px] max-w-[16px] max-h-[16px]"
                                />
                              ) : (
                                <UserChatRobotIcons />
                              )}
                            </div>
                            <div className="flex flex-col gap-2 overflow-x-auto">
                              <MarkdownPreview
                                className="no-select !text-black dark:!text-white bg-transparent p-4 text-[14px] md:text-[16px]"
                                style={{
                                  background: isWhite ? "transparent" : "black",
                                }}
                                source={chat.botResponse}
                                rehypeRewrite={markDownTextEdit}
                                wrapperElement={{
                                  "data-color-mode": theme?.theme,
                                }}
                              />
                              {isShowChatInput && (
                                <button
                                  className={`
                                  p-[4px] 
                                  rounded 
                                  bg-GreyThemeBG 
                                  dark:bg-white 
                                  disabled:opacity-70 
                                  disabled:cursor-not-allowed 
                                  max-w-fit
                                `}
                                  onClick={() => {
                                    handleGenerateResponse(chat?.chatId);
                                  }}
                                  disabled={isApiResponseLoading}
                                >
                                  <img
                                    src={RetryIcon}
                                    alt="Retry-icon"
                                    className="max-w-[14px] max-h-[14px]"
                                  />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full flex justify-start items-start gap-3">
                          <div className="dark:w-10 dark:h-10 rounded-full p-2 bg-GrayText dark:bg-primaryBG">
                            {isWhite ? (
                              <img
                                src={GreyRobotIcon}
                                alt="robot-icon"
                                className="min-w-[16px] max-w-[16px] max-h-[18px] min-h-[16px]"
                              />
                            ) : (
                              <UserChatRobotIcons />
                            )}
                          </div>
                          <CustomLoader />
                        </div>
                      )}
                      <div />
                      {isShowMyResponses &&
                        getUserAudioText(chat?.userAudioTranscription)
                          ?.isShow && (
                          <IconWithText
                            isReverse
                            isLightGreyBg
                            icon={isWhite ? Person : PersonIcon}
                            className={
                              !isWhite
                                ? "dark:bg-GreyBackground rounded-lg rounded-br-none p-[16px]"
                                : ""
                            }
                            classNameIcon={isWhite ? "min-w-[20px]" : ""}
                            IconContainerClassName={`${
                              isWhite ? `p-0 px-0 rounded-none` : "bg-Neon"
                            } min-w-fit`}
                            text={
                              getUserAudioText(chat?.userAudioTranscription)
                                ?.text
                            }
                          />
                        )}
                    </div>
                  ))}
                  <div ref={bottomRef}></div>
                </div>
              )}
            </>
          )}
          <div className="flex flex-col gap-4">
            {!openMic ? (
              ""
            ) : (
              <>
                {!isMobile && (
                  <div
                    className={`
                  max-w-[758px] 
                  w-full 
                  flex 
                  items-center 
                  justify-between 
                  bg-[#363636] 
                  py-1 
                  px-4 
                  rounded-lg
                  `}
                  >
                    <BodyTextTitle
                      text="Please wait while I am listening to the question."
                      textColor="text-white"
                      additionalClass="font-medium"
                    />
                    <img
                      src={RightIcons}
                      alt="RightIcons"
                      className="h-[55px] w-[55px]"
                    />
                  </div>
                )}
              </>
            )}
            {isShowChatInput && (
              <div
                className={`
                  z-20 
                  max-w-[758px]
                  w-full 
                  flex 
                  gap-4 
                  md:flex-row 
                  flex-col 
                  md:items-end 
                  items-center
                  justify-between
                `}
              >
                {!isUserOptForAutomatedProcess.current.isAutomated && (
                  <ManualMicrophoneButton
                    {...{ minutes, seconds, isWhite, openMic, handleRecording }}
                  />
                )}
                {isUserOptForAutomatedProcess.current.isAutomated && (
                  <AutoMaticMicrophoneButton
                    {...{
                      minutes,
                      seconds,
                      isWhite,
                      openMic,
                      handleRecording,
                      isPause,
                      onTogglePauseRecording,
                    }}
                  />
                )}
                <div
                  className={`
                  border 
                  border-[#FFFFFF33] 
                  bg-GreyThemeBG 
                  dark:bg-[#2B2B2BB2] 
                  p-2
                  pl-4 
                  flex 
                  justify-between 
                  items-center
                  rounded-lg 
                ${
                  !openMic
                    ? "lg:min-w-[688px] md:min-w-[488px] w-full"
                    : "lg:min-w-[540px] md:min-w-[340px] w-full"
                } `}
                >
                  <TextareaAutoSize
                    className={`
                    w-full 
                    bg-transparent 
                    text-primaryBG  
                    dark:text-white 
                    text-[14px]
                    md:text-base 
                    border-none 
                    outline-none 
                    resize-none 
                    placeholder:text-primaryBG 
                    placeholder:opacity-50 
                    dark:placeholder:text-[#FFFFFFB2]
                    `}
                    autoFocus
                    ref={textAreaInputRef}
                    placeholder="Type your Question"
                    minRows={1}
                    maxRows={25}
                    value={inputText}
                    cacheMeasurements
                    onChange={(e) => setInputText(e?.target?.value)}
                    onKeyDown={(e) => {
                      if (
                        e &&
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !isApiResponseLoading
                      ) {
                        handleSubmit(e);
                      }
                    }}
                  />
                  <button
                    className={`
                    self-end 
                    w-[48px]
                    h-[40px]
                    md:w-[58px] 
                    md:h-[48px] 
                    rounded-lg 
                    bg-black 
                    dark:bg-Neon 
                    flex 
                    justify-center 
                    items-center 
                    disabled:opacity-70 
                    disabled:cursor-not-allowed
                    `}
                    onClick={(e) => handleSubmit(e)}
                    disabled={isApiResponseLoading}
                  >
                    <img
                      src={isWhite ? WhiteSendIcon : sendIcons}
                      alt="sendIcons"
                      className="w-4 h-4 md:w-6 md:h-6 z-50"
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isShowWordSearchArrows && !isLoading && !!selectedSearchKeys?.length && (
        <ArrowsBar
          isDownArrowDisabled={
            currentSelectedKeyIndex === selectedSearchKeys?.length - 1
          }
          onUpArrowClick={() => moveFocusOnText(true)}
          onDownArrowClick={() => moveFocusOnText(false)}
          content={`${currentSelectedKeyIndex + 1} out of ${
            selectedSearchKeys?.length
          } matches`}
          className="absolute bottom-[120px] left-[52%] -translate-x-[49%] xl:-translate-x-[51%] w-[690px]"
        />
      )}
    </div>
  );
};

ChatSection.propTypes = {
  chatLog: PropTypes.array,
  isLoading: PropTypes.bool,
  currentSelectedThread: PropTypes.string,
  allEmailsAndTagsOfCurrentSessionSharedWith: PropTypes.array,
  isShowMyResponses: PropTypes.bool,
  setIsShowMyResponses: PropTypes.func,
  bottomRef: PropTypes.object,
  textAreaInputRef: PropTypes.object,
  isApiResponseLoading: PropTypes.bool,
  handleGenerateResponse: PropTypes.func,
  handleRecording: PropTypes.func,
  inputText: PropTypes.string,
  setInputText: PropTypes.func,
  handleSubmit: PropTypes.func,
  isShowChatInput: PropTypes.bool,
  minutes: PropTypes.number,
  seconds: PropTypes.number,
  openMic: PropTypes.bool,
  setSessionData: PropTypes.func,
  toast: PropTypes.func,
  microphoneTranscription: PropTypes.string,
};

export default ChatSection;
