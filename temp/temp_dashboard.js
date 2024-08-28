import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import TextareaAutosize from "react-textarea-autosize";
import { useNavigate } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";

import BodyText from "../components/molecules/BodyText";
import ChatHeader from "../components/includes/ChatHeader";
import Sidebar from "../components/includes/sidebar";
import SessionTagsModal from "../components/includes/SessionTagsModal";
import DashIntroSection from "../components/includes/dashIntroSection";
import SmallBodyText from "../components/molecules/SmallBodyText";
import BodyTextTitle from "../components/molecules/BodyTextTitle";
import SettingsModel from "../components/includes/settingModel";
import CustomLoader from "../components/molecules/customLoader";
import ShareChatModal from "../components/includes/ShareChatModal";

import useGetAllSharedChatsApi from "../hooks/useGetAllSharedChatsApi";
import useGetNewSessionIdApi from "../hooks/useGetNewSessionIdApi";
import useGetSessionHistory from "../hooks/useGetSessionHistory";
import {
  formatTime,
  putCursorFocusAtTheEnd,
  removeExtraSpacesBetweenTags,
} from "../utils/utils";
import BackgroundImg from "../assets/img/3d-render-imge.png";
import MicIcons from "../assets/img/MicIcons.png";
import sendIcons from "../assets/img/sendIcons.png";
import RightIcons from "../assets/img/animationRight.gif";
import SearchIcon from "../assets/svg/search.svg";
import {
  ChatIcons,
  LogoAIInterviewer,
  MicChatIcons,
  MicStopIcons,
  SettingIcons,
  SoundWaveIcons,
  UserChatIcons,
  UserChatRobotIcons,
} from "../assets/svgIcon";
import RetryIcon from "../assets/svg/Retry-icon.svg";
import {
  MAX_COUNT_OF_SHARED_CHAT_TO_SHOW,
  MICROPHONE_TEXT,
  SESSION_ID,
  USER_EMAIL,
  USER_PERSONA,
} from "../constant/const";
import "react-toastify/dist/ReactToastify.css";
import { SHARED_SESSION } from "../constant/routesNames";

let ipcRenderer;
export default function Dashboard() {
  //states
  const [isApiResponseLoading, setIsApiResponseLoading] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [openMic, setOpenMic] = useState(false);
  const [recordingIcon, setRecordingIcon] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isShowChatInput, setIsShowChatInput] = useState(true);
  const [isSessionTagModalOpen, setIsSessionTagModal] = useState(false);
  const [currentSessionTags, setCurrentSessionTags] = useState("");
  const [isRegeneratingResponse, setIsRegeneratingResponse] = useState(false);
  const [currentSelectedThread, setCurrentSelectedThread] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUserPersonaOn, setIsUserPersonaOn] = useState(
    localStorage?.getItem(USER_PERSONA) || false
  );
  const [selectedSessionToShare, setSelectedSessionToShare] = useState("");
  const [
    allEmailsCurrentSessionSharedWith,
    setAllEmailsCurrentSessionSharedWith,
  ] = useState([]);

  //below states are going to be used upcoming functionality
  const [microphoneInputText, setMircroPhoneInputText] = useState();
  const [isMicrophoneTextModalOpen, setIsMicrophoneTextModalOpen] =
    useState(false);
  console.log({ currentSelectedThread });

  //react-hooks
  const textAreaInputRef = useRef();
  const setTimerInterval = useRef(null);
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  // Just for making the input and chatLog states values available inside the setInterval callback function
  const inputTextRef = useRef({ inputText });
  const chatLogRef = useRef({ chatLog });

  //custom-hooks
  const {
    fetchUserChatsHistory,
    data: allSessionData,
    error: errorWhileGettingUserSessionData,
  } = useGetSessionHistory();
  const { getNewSessionId } = useGetNewSessionIdApi();
  const { data: allChatsSharedWithTheUser } = useGetAllSharedChatsApi();

  //Global-variables
  let bufferText = "";

  const updateChatLog = ({
    userQuery,
    isRecording,
    botResponse,
    isReneratedResponse,
    chatId,
  }) => {
    if (isReneratedResponse) {
      const modifiedChatData = chatLog?.map((chat) => {
        if (+chat?.chatId === +chatId && !isNaN(+chatId)) {
          chat.botResponse = botResponse;
          return chat;
        }
        return chat;
      });
      setChatLog(modifiedChatData);
      return;
    }
    if (isRecording) {
      setChatLog([
        ...chatLog,
        {
          chatId,
          chatPrompt: userQuery,
          botResponse: botResponse,
          icon: "recordingIcon",
        },
      ]);
    } else {
      setChatLog([
        ...chatLog,
        {
          chatId,
          chatPrompt: userQuery,
          botResponse: botResponse,
          icon: "userIcon",
        },
      ]);
    }
  };

  const resetResponseRelatedValues = () => {
    setIsApiResponseLoading(false);
    setRecordingIcon(false);
    fetchUserChatsHistory({});
    ipcRenderer.removeAllListeners("botResponse");
  };

  const handleGenerateResponse = (chatId) => {
    if (isApiResponseLoading) return;
    try {
      setIsApiResponseLoading(true);
      setIsRegeneratingResponse(true);
      const userQuery = chatLog?.filter((chat) => chat?.chatId === chatId)?.[0]
        ?.chatPrompt;
      const oldBotResponse = chatLog?.filter(
        (chat) => chat?.chatId === chatId
      )?.[0]?.botResponse;

      updateChatLog({
        isRecording: recordingIcon,
        userQuery: userQuery,
        botResponse: "Regenerating your response...",
        chatId,
        isReneratedResponse: true,
      });

      // sending user question to the backend
      const inputBody = {
        userPrompt: userQuery,
        email: localStorage.getItem(USER_EMAIL),
        session_id: currentSelectedThread || localStorage.getItem(SESSION_ID),
        token: process.env.REACT_APP_SECURITY_MESSAGE_OPENAI,
        tags: removeExtraSpacesBetweenTags(currentSessionTags),
      };

      // old ones:
      //ipcRenderer.send("voice-recording", inputBody);
      //ipcRenderer.on("botResponse", (event, response)
      ipcRenderer.send("regenrate-response", inputBody);
      ipcRenderer.removeAllListeners("bot-regenrated-response", inputBody);

      ipcRenderer.on("bot-regenrated-response", (event, response) => {
        // getting the response from the bot
        console.log("new resposne from the bot: ", response, { chatId });
        updateChatLog({
          isRecording: recordingIcon,
          userQuery: userQuery,
          botResponse: response,
          chatId,
          isReneratedResponse: true,
        });
      });
      //old one: botResponseClosed
      ipcRenderer.on("bot-regenated-close", (event, response) => {
        resetResponseRelatedValues();
        setIsRegeneratingResponse(false);
      });
    } catch (error) {
      console.log(error);
      updateChatLog({
        isRecording: recordingIcon,
        userQuery: inputText,
        botResponse: error?.message,
        isReneratedResponse: true,
      });
      resetResponseRelatedValues();
      setIsRegeneratingResponse(false);
    }
  };

  function startRecordingFromRenderer() {
    ipcRenderer.removeAllListeners("stop-recording");
    ipcRenderer.send("start-recording");
    ipcRenderer.on("stop-recording", (event, args) => {});

    ipcRenderer.on("transcription", (event, text) => {
      text = text.replace(
        /\\u([0-9]|[a-fA-F])([0-9]|[a-fA-F])([0-9]|[a-fA-F])([0-9]|[a-fA-F])/g,
        ""
      );
      console.log("text comming from WebSocket", { text });
      if (bufferText !== text) bufferText = text;
      if (!inputText.includes(text)) {
        setInputText((prevInput) => prevInput + bufferText);
      }
    });
  }

  function updateTimer() {
    setRecordingTimer((prev) => {
      const newTimer = prev + 1;
      setMinutes(Math.floor(newTimer / 60));
      setSeconds(newTimer % 60);
      return newTimer;
    });
  }

  function handleAutomaticSubmit() {
    console.log({ inputTextRef });
    console.log({ inputText: inputTextRef.current?.inputText });
    if (inputTextRef.current?.inputText === "") {
      return;
    }
    console.log(
      "calling the automatic submit function for sending the query to the backend"
    );
    setIsApiResponseLoading(true);
    const userPrompt = inputTextRef.current?.inputText;
    setInputText("");
    setChatLog([
      ...(chatLogRef?.current?.chatLog || []),
      {
        chatPrompt: userPrompt,
        botResponse: "",
        chatId: chatLog?.length + 1,
        icon: "userIcon",
      },
    ]);

    const inputBody = {
      userPrompt: userPrompt,
      email: localStorage.getItem(USER_EMAIL),
      session_id: localStorage.getItem(SESSION_ID),
      token: process.env.REACT_APP_SECURITY_MESSAGE_OPENAI,
    };

    ipcRenderer.send("voice-recording", inputBody);
    ipcRenderer.on("botResponse", (event, response) => {
      setChatLog([
        ...(chatLogRef?.current?.chatLog || []),
        {
          chatPrompt: userPrompt,
          botResponse: response,
          chatId: chatLog?.length + 1,
          icon: "recordingIcon",
        },
      ]);
    });

    ipcRenderer.on("botResponseClosed", (event, response) => {
      setIsApiResponseLoading(false);
      ipcRenderer?.removeAllListeners("botResponse");
      // sessionHistory();
      fetchUserChatsHistory({});
    });
  }

  function startSecondaryRecordingFromRenderer() {
    setOpenMic(true);
    console.log("started recording");

    //removing old listeners
    ipcRenderer.removeAllListeners("secondaryRecording");
    ipcRenderer.removeAllListeners("parallelRecording");

    ipcRenderer.send("secondaryRecording");

    //::: FOR ASSEMBLY AI
    // ipcRenderer.send("assembly-ai-speaker");
    // ipcRenderer.send("assembly-ai-microphone");
    /////////////////////
    if (isUserPersonaOn) {
      ipcRenderer.send("parallelRecording"); // for getting the audio from microphone
    }

    // ipcRenderer.send("start-recording"); // for getting the new audio (assembly AI)
    setTimerInterval.current = setInterval(() => {
      updateTimer();
    }, 1000);

    // let transcriptionCheckInterval;
    ipcRenderer.removeAllListeners("stop-recording");
    ipcRenderer.on("stop-recording", (event, args) => {
      clearInterval(setTimerInterval.current);
      setTimerInterval.current = null;
      setRecordingTimer(0);
      setMinutes(0);
      setSeconds(0);
      // clearInterval(transcriptionCheckInterval);
      console.log("stopped recording", recordingTimer, minutes, seconds);
    });

    // ----- For automatically submit the query after 3 seconds -----
    // let lastTranscriptionTime = Date.now();
    // let isTranscriptionSubmitted = false;
    // transcriptionCheckInterval = setInterval(() => {
    //   if (
    //     Date.now() - lastTranscriptionTime > 3000 &&
    //     !isTranscriptionSubmitted
    //   ) {
    //     console.log("stopped");
    //     handleAutomaticSubmit();
    //     isTranscriptionSubmitted = true;
    //   }
    // }, 1000);
    ipcRenderer.removeAllListeners("transcription");

    if (isUserPersonaOn) {
      ipcRenderer.removeAllListeners(MICROPHONE_TEXT);
      ipcRenderer.on(MICROPHONE_TEXT, (event, text) => {
        setMircroPhoneInputText((prev) => prev + text);
      });
    }

    console.log("listening to the transaction...");
    ipcRenderer.on("transcription", (event, text) => {
      // For automatically submit the query after 3 seconds
      // lastTranscriptionTime = Date.now();
      // isTranscriptionSubmitted = false;

      console.log("inside the transcription", { text });
      text = text.replace(
        /\\u([0-9]|[a-fA-F])([0-9]|[a-fA-F])([0-9]|[a-fA-F])([0-9]|[a-fA-F])/g,
        ""
      );
      if (bufferText !== text) bufferText = text;
      if (!inputText.includes(text)) {
        setInputText((prevInput) => {
          inputTextRef.current.inputText = prevInput + bufferText;
          return prevInput + bufferText;
        });
      }
    });
  }

  function stopRecordingFromRenderer() {
    console.log("stopped recording fn called");
    setOpenMic(false);
    console.log("stopped recording");
    ipcRenderer.send("stop-recording");
    setRecordingTimer(0);
    ipcRenderer.removeAllListeners("transcription");

    //ASSEMBLY_AI
    ipcRenderer.send("stop-recording-assembly-ai");
  }

  const handleRecording = (e) => {
    if (openMic) {
      stopRecordingFromRenderer();
      handleSubmit(e);
      return;
    }
    if (!openMic && chatLog?.length === 0 && !currentSessionTags) {
      setIsSessionTagModal(true);
      return;
    }
    startSecondaryRecordingFromRenderer();
    // startRecordingFromRenderer();
    textAreaInputRef?.current?.focus();
    setRecordingIcon(true);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (chatLog?.length === 0 && !currentSessionTags) {
      setIsSessionTagModal(true);
      return;
    }
    if (inputText === "") {
      setRecordingIcon(false);
      return;
    }
    if (isApiResponseLoading) return;
    try {
      setIsApiResponseLoading(true);
      const userPrompt = inputText;
      setInputText("");
      updateChatLog({
        userQuery: userPrompt,
        isRecording: recordingIcon || openMic,
        botResponse: "",
        chatId: chatLog?.length + 1,
      });

      const inputBody = {
        userPrompt: userPrompt,
        email: localStorage.getItem(USER_EMAIL),
        session_id: localStorage.getItem(SESSION_ID),
        tags: removeExtraSpacesBetweenTags(currentSessionTags),
      };

      ipcRenderer.send("voice-recording", inputBody);
      ipcRenderer.on("botResponse", (event, response) => {
        updateChatLog({
          userQuery: userPrompt,
          isRecording: recordingIcon,
          botResponse: response,
          chatId: chatLog?.length + 1,
        });
      });
      ipcRenderer.on("botResponseClosed", () => {
        resetResponseRelatedValues();
      });
    } catch (error) {
      console.log(error);
      const userPrompt = inputText;
      updateChatLog({
        userQuery: userPrompt,
        isRecording: recordingIcon || openMic,
        botResponse: error?.message || "Something went wrong!",
        chatId: chatLog?.length + 1,
      });
      resetResponseRelatedValues();
    }
  };

  const createSession = async () => {
    getNewSessionId({
      onErrorCallback: () => {
        toast?.error("Unable to generate new Session");
      },
      onSuccessCallback: (sessionId) => {
        localStorage.setItem(SESSION_ID, sessionId);
        setCurrentSelectedThread(sessionId);
      },
    });
  };

  const newThread = async () => {
    ipcRenderer.removeAllListeners("botResponse");
    setChatLog([]);
    setAllEmailsCurrentSessionSharedWith([]);
    setCurrentSessionTags("");
    setIsShowChatInput(true);
    await createSession();
    fetchUserChatsHistory({});
  };

  const showThread = (data) => {
    const chatThread = data?.data?.data;
    const allEmailsChatSharedWith = data?.data?.shared_to;
    setAllEmailsCurrentSessionSharedWith(allEmailsChatSharedWith);
    console.log({ data, allEmailsChatSharedWith });
    setIsLoading(true);
    setChatLog([]);
    chatThread.map((chat, key) => {
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        {
          chatId: key + 1,
          chatPrompt: chat?.question,
          botResponse: chat?.answer,
        },
      ]);
    });

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollTop = bottomRef.current?.scrollHeight;
    }
  };

  useEffect(() => {
    getNewSessionId({
      onErrorCallback: () => {
        toast?.error("Unable to generate new Session Id");
      },
      onSuccessCallback: (sessionId) => {
        localStorage.setItem(SESSION_ID, sessionId);
        setCurrentSelectedThread(sessionId);
      },
    });
    fetchUserChatsHistory({});
  }, []);

  useEffect(() => {
    if (window.require) {
      const electron = window.require("electron");
      ipcRenderer = electron.ipcRenderer;
    } else {
      ipcRenderer = {
        send: () => console.log("send is not available in web browser"),
        on: () => console.log("on is not available in web browser"),
        removeAllListeners: () =>
          console.log("removeAllListeners is not available in web browser"),
      };
    }
  }, []);

  console.log({ loc: window?.location });

  useEffect(() => {
    ipcRenderer.removeAllListeners("recordingError");
    ipcRenderer.on("recordingError", (event, args) => {
      toast.error("Error recording, please try again", 1000);
      setTimeout(() => {
        clearInterval(setTimerInterval.current);
        setTimerInterval.current = null;
        setRecordingTimer(0);
        setMinutes(0);
        setSeconds(0);
        stopRecordingFromRenderer();
      }, 1000);
    });
  }, []);

  useEffect(() => {
    if (!isRegeneratingResponse) {
      scrollToBottom();
    }
  }, [chatLog]);

  useEffect(() => {
    putCursorFocusAtTheEnd(textAreaInputRef, inputText);
  }, [inputText]);

  return (
    <div className="w-full relative h-screen p-4 bg-primaryBG">
      <div className="relative z-0 flex h-full w-full justify-between overflow-hidden gap-[19px]">
        {/* sidebar menu */}
        <div className="lg:flex-1 lg:max-w-[220px] max-w-[20%] w-full">
          <div className="h-full w-full flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <LogoAIInterviewer />
              <button
                className="bg-Neon w-full p-3 rounded flex justify-between text-blackBG text-base font-medium"
                onClick={newThread}
              >
                New Chat
                <ChatIcons />
              </button>
              <div className="flex justify-between items-center bg-black px-[12px] rounded">
                <input
                  placeholder="Search"
                  className="py-[12px] outline-none bg-black text-InputPlaceholderText w-[84%]"
                />
                <button disabled className="disabled:cursor-not-allowed">
                  <img src={SearchIcon} alt="search-icon" />
                </button>
              </div>
            </div>
            <div className="w-full min-h-[calc(100%_-_316px)] py-4">
              <Sidebar
                newThread={newThread}
                sessionData={allSessionData}
                showThread={showThread}
                setIsLoading={setIsLoading}
                {...{
                  isLoading,
                  fetchUserChatsHistory,
                  setIsShowChatInput,
                  errorWhileGettingUserSessionData,
                  setCurrentSelectedThread,
                  currentSelectedThread,
                  isSearchModalOpen,
                  setIsSearchModalOpen,
                }}
              />
            </div>
            {!!allChatsSharedWithTheUser?.length && (
              <button
                className="flex justify-between items-center w-full p-3 cursor-pointer"
                onClick={() => {
                  console.log("called...");
                  navigate(SHARED_SESSION);
                }}
              >
                <p className="text-white text-[16px] font-medium">
                  Shared chats
                </p>
                <span className="rounded-full text-[12px] bg-Neon min-w-[24px] min-h-[24px] flex justify-center items-center">
                  +
                  {Math.min(
                    MAX_COUNT_OF_SHARED_CHAT_TO_SHOW,
                    allChatsSharedWithTheUser?.length
                  )}
                </span>
              </button>
            )}
            <div
              className="flex justify-between items-center p-3 cursor-pointer w-full"
              onClick={() => setShowModal(true)}
            >
              <BodyText text="Settings" textColor="text-white" />
              <SettingIcons />
            </div>
            {showModal && (
              <SettingsModel
                {...{
                  showModal,
                  setShowModal,
                  fetchUserChatsHistory,
                  showThread,
                  setIsShowChatInput,
                  newThread,
                  isUserPersonaOn,
                  setIsUserPersonaOn,
                }}
              />
            )}
          </div>
        </div>
        {/* chat section */}
        <div className="relative flex justify-center items-center lg:max-w-[calc(100%_-_239px)] max-w-[80%] w-full h-full bg-blackBG rounded-xl flex-col overflow-auto">
          <img
            src={BackgroundImg}
            alt="BackgroundImg"
            className={`absolute bottom-0  mix-blend-[luminosity] h-full w-full object-cover ${
              chatLog.length === 0 || isLoading
                ? "bg-custom-gradient block"
                : "hidden"
            }`}
          />
          <ChatHeader
            sessionId={currentSelectedThread}
            {...{
              setSelectedSessionToShare,
              allEmailsCurrentSessionSharedWith,
            }}
          />
          {!openMic ? (
            ""
          ) : (
            <div className="absolute top-0 w-full h-10 rounded-t-xl bg-[#414141] flex items-center px-4">
              <SmallBodyText
                text="Please ensure that you have the interviewer's consent when using this AI interview assistant."
                textColor="text-white"
              />
            </div>
          )}
          <div
            className={`relative max-w-[758px] w-full h-full flex flex-col  items-center pb-6 ${
              chatLog.length === 0 ? "justify-end" : "gap-4 justify-between"
            }`}
          >
            {isLoading ? (
              <div className="max-h-[calc(100vh_-_122px)] h-full flex items-center ">
                <CustomLoader />
              </div>
            ) : (
              <>
                {chatLog?.length === 0 ? (
                  <DashIntroSection />
                ) : (
                  <div
                    className="min-h-[calc(80vh_-_178px)] w-full overflow-x-hidden overflow-y-auto text-white mt-10 flex flex-col gap-4"
                    ref={bottomRef}
                  >
                    {chatLog.map((chat, key) => (
                      <div className="w-full flex flex-col gap-4 pr-4">
                        {chat.icon === "recordingIcon" ? (
                          <div className="w-full flex justify-start items-end gap-3">
                            <div className="w-10 h-10">
                              <MicChatIcons />
                            </div>
                            <BodyTextTitle
                              text={chat.chatPrompt}
                              textColor="text-white"
                              additionalClass="font-medium"
                            />
                          </div>
                        ) : (
                          <div className="w-full flex justify-end items-end gap-3">
                            <MarkdownPreview
                              source={chat.chatPrompt}
                              rehypeRewrite={(node, index, parent) => {
                                if (
                                  node.tagName === "a" &&
                                  parent &&
                                  /^h(1|2|3|4|5|6)/.test(parent.tagName)
                                ) {
                                  parent.children = parent.children.slice(1);
                                }
                              }}
                              wrapperElement={{
                                "data-color-mode": "dark",
                              }}
                              className="no-select !font-medium !bg-[#363636] !text-white shadow-custom-first rounded-custom-radius p-4"
                            />
                            <div className="w-10 h-10">
                              <UserChatIcons />
                            </div>
                          </div>
                        )}
                        {chat.botResponse !== "" ? (
                          <div>
                            <div className="w-full flex justify-start items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#424242] p-2">
                                <UserChatRobotIcons />
                              </div>
                              <div className="flex flex-col gap-2">
                                <MarkdownPreview
                                  source={chat.botResponse}
                                  rehypeRewrite={(node, index, parent) => {
                                    if (
                                      node.tagName === "a" &&
                                      parent &&
                                      /^h(1|2|3|4|5|6)/.test(parent.tagName)
                                    ) {
                                      parent.children =
                                        parent.children.slice(1);
                                    }
                                  }}
                                  wrapperElement={{
                                    "data-color-mode": "dark",
                                  }}
                                  className=" no-select !text-white bg-transparent p-4"
                                />
                                {isShowChatInput && (
                                  <button
                                    onClick={() => {
                                      handleGenerateResponse(chat?.chatId);
                                    }}
                                    className="p-[4px] rounded bg-white disabled:opacity-70 disabled:cursor-not-allowed max-w-fit"
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
                            <div className="w-10 h-10 rounded-full bg-[#424242] p-2">
                              <UserChatRobotIcons />
                            </div>
                            <CustomLoader />
                          </div>
                        )}
                        <div />
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
                <div className="max-w-[758px] w-full flex items-center justify-between bg-[#363636] py-1 px-4 rounded-lg">
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
              {isShowChatInput && (
                <div className="z-20 max-w-[758px] w-full flex gap-4 md:flex-row flex-col items-center justify-between">
                  <button
                    className={`bg-white rounded-xl min-h-[64px] flex justify-center items-center px-3  ${
                      !openMic ? "" : "max-w-[148px] w-full"
                    }`}
                    onClick={(e) => handleRecording(e)}
                  >
                    {!openMic ? (
                      <img
                        src={MicIcons}
                        alt="MicIcons"
                        className="min-w-[25px] w-[25px] h-[25px]"
                      />
                    ) : (
                      <div className="flex justify-start items-center gap-1">
                        <BodyText
                          text={`${formatTime(minutes)} : ${formatTime(
                            seconds
                          )}`}
                          textColor="text-blackBG"
                          additionalClass="!font-medium font-DMSans max-w-[100px] w-full"
                        />
                        <SoundWaveIcons />
                        <MicStopIcons />
                      </div>
                    )}
                  </button>
                  <div
                    className={`border border-[#FFFFFF33] bg-[#2B2B2BB2] p-2 flex justify-between items-center rounded-lg ${
                      !openMic
                        ? "lg:min-w-[688px] md:min-w-[488px] w-full"
                        : "lg:min-w-[540px] md:min-w-[340px] w-full"
                    } `}
                  >
                    <TextareaAutosize
                      className="w-full bg-transparent text-white text-base border-none outline-none resize-none placeholder:text-[#FFFFFFB2]"
                      autoFocus
                      ref={textAreaInputRef}
                      autosize
                      placeholder="Type your Question"
                      minRows={1}
                      maxRows={3}
                      value={inputText}
                      cacheMeasurements
                      onChange={(e) => setInputText(e.target.value)}
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
                      className="w-[58px] h-[48px] rounded-lg bg-Neon flex justify-center 
                  items-center disabled:opacity-70 disabled:cursor-not-allowed"
                      onClick={(e) => handleSubmit(e)}
                      disabled={isApiResponseLoading}
                    >
                      <img
                        src={sendIcons}
                        alt="sendIcons"
                        className="w-6 h-6 z-50"
                      />
                    </button>
                  </div>
                  {/* To be removed */}
                  {/* {isUserPersonaOn && (
                    <button
                      className="w-[58px] px-2 h-[48px] rounded-lg bg-Neon flex justify-center 
                  items-center disabled:opacity-70 disabled:cursor-not-allowed"
                      onClick={(e) =>
                        setIsMicrophoneTextModalOpen((prev) => !prev)
                      }
                    >
                      Mic
                    </button>
                  )} */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isSessionTagModalOpen && (
        <SessionTagsModal
          {...{
            isSessionTagModalOpen,
            setIsSessionTagModal,
            setCurrentSessionTags,
            currentSessionTags,
          }}
        />
      )}
      {!!selectedSessionToShare && (
        <ShareChatModal
          {...{ selectedSessionToShare, setSelectedSessionToShare }}
        />
      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"
      />
    </div>
  );
}
