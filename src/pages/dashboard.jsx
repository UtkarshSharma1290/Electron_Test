import React, { useState, useEffect, useRef, useContext } from "react";
import { toast } from "react-toastify";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";

import ChatSection from "../views/ChatSection";
import Sidebar from "../components/includes/sidebar";
import SettingsModel from "../components/includes/settingModel";
import SidebarTopSection from "../components/includes/SidebarTopSection";
import SilenceDetectionModal from "../components/includes/SilenceDetectionModal";
import TagsFilter from "../components/includes/TagsFilter";

import useGetAllSharedChatsApi from "../hooks/useGetAllSharedChatsApi";
import useGetNewSessionIdApi from "../hooks/useGetNewSessionIdApi";
import useGetSessionHistory from "../hooks/useGetSessionHistory";
import useUpdateUserMicResponseApi from "../hooks/useUpdateUserMicResponseApi";
import useSearchApi from "../hooks/useSearchApi";
import useDimension from "../hooks/useDimensions";
import useSearchTags from "../hooks/useSearchTags";
import {
  compareStrings,
  isScrolledToBottom,
  isUserAllowed,
  onOpacityChangeHandler,
  putCursorFocusAtTheEnd,
  unHighlightText,
} from "../utils/utils";
import {
  DRAWER_DARK_STYLES,
  DRAWER_LIGHT_STYLES,
  DRAWER_SIZE,
  INACTIVITY_MESSAGE,
  LIGHT,
  OPACITY_KEY,
  PROCESS_TYPES,
  RESTRICTION_MESSAGE,
  SESSION_ID,
  SILENCE_DETECTED_MESSAGE,
  USER_EMAIL,
} from "../constant/const";
import { ProcessContext } from "../context/Process/ProcessContext";
import ShareChatAndSettingsChip from "../components/includes/ShareChatAndSettingsChip";
import useChatSearchApi from "../hooks/useChatSearchApi";
import { UserAndAIContext } from "../context/UserAndAI/UserAndAIContext";
import { REGENERATING_MESSAGE } from "../constant/messages";
import { ThemeContext } from "../context/Theme/ThemeContext";

let ipcRenderer;
export default function Dashboard() {
  //states
  const [
    allEmailsAndTagsOfCurrentSessionSharedWith,
    setAllEmailsAndTagsOfCurrentSessionSharedWith,
  ] = useState([]);
  const [allSessionData, setAllSessionData] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [chatsSearchResultData, setChatsSearchResultData] = useState([]);
  const [currentSelectedThread, setCurrentSelectedThread] = useState("");
  const [inputText, setInputText] = useState("");
  const [isApiResponseLoading, setIsApiResponseLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const [isRegeneratingResponse, setIsRegeneratingResponse] = useState(false);
  const [isShowChatInput, setIsShowChatInput] = useState(true);
  const [isShowFilter, setIsShowFilter] = useState(false);
  const [isShowMyResponses, setIsShowMyResponses] = useState(false);
  const [isShowSearchChatsResult, setIsShowSearchChatsResult] = useState(false);
  const [isShowWordSearchArrows, setIsShowWordSearchArrows] = useState(false);
  const [isSilenceModalOpen, setIsSilenceModalOpen] = useState(false);
  const [isStartRecording, setIsStartRecording] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [openMic, setOpenMic] = useState(false);
  const [recordingIcon, setRecordingIcon] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [selectedSearchKeys, setSelectedSearchKeys] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userSearchResult, setUserSearchResult] = useState([]);
  const [userSearchResultTotalPageCount, setUserSearchResultTotalPageCount] =
    useState(9);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  // Page count related states
  const [filtersPage, setFiltersPage] = useState(1);
  const [chatsSearchPage, setChatsSearchPage] = useState(1);
  const [sessionTitlePage, setSessionTitlePage] = useState(1);

  //react-hooks
  const bottomRef = useRef(null);
  const chatLogRef = useRef({ chatLog });
  const finalStoredTranscriptMicrophone = useRef({ finalTextData: "" });
  const finalStoredTranscriptSpeaker = useRef({ finalTextData: "" });
  const handleSubmitRef = useRef({ handleSubmitFunction: null });
  const inputTextRef = useRef({ inputText });
  const isRecordingPaused = useRef({ value: false });
  const isScrollToBottomRef = useRef({ value: false });
  const isUserOptForAutomatedProcess = useRef({ isAutomated: false });
  const setTimerIntervalRef = useRef(null);
  const textAreaInputRef = useRef();

  //custom-hooks
  const {
    fetchUserChatsHistory,
    data: dataOfAllSessions,
    error: errorWhileGettingUserSessionData,
    isLoading: isLoadingAllSessionTitles,
  } = useGetSessionHistory();
  const totalSession = dataOfAllSessions?.total;
  const { getNewSessionId } = useGetNewSessionIdApi();
  const { data: allChatsSharedWithTheUser } = useGetAllSharedChatsApi();
  const { searchQueryHandler, isLoading: isSearchingForUserQuery } =
    useSearchApi();
  const {
    searchTagsHandler,
    data: searchedResultTags,
    isLoading: isSearchingTags,
    setData: setSearchResultTags,
  } = useSearchTags();
  const {
    searchInChatsHandler,
    isLoading: isSearchingInChats,
    data: searchedChatsInitialData,
  } = useChatSearchApi();
  const totalSearchedChats = searchedChatsInitialData?.total;
  const { updateUserResponse } = useUpdateUserMicResponseApi();
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;
  const { width } = useDimension();
  const isMobile = width <= 600;

  //contexts
  const { processDetails } = useContext(ProcessContext);
  isUserOptForAutomatedProcess.current.isAutomated =
    processDetails?.process === PROCESS_TYPES?.AUTOMATIC;
  const { userAndAi } = useContext(UserAndAIContext);

  //Global-variables
  let bufferText = "";

  //functions
  const getAllSessionHandler = () => {
    fetchUserChatsHistory({
      onSuccessCallback: (data) => {
        setAllSessionData(data);
      },
      onErrorCallback: () => {
        toast?.error("Unable to fetch session titles");
      },
    });
  };
  /**
   * Function for updating the values of ChatLog
   * @param {String} userQuery
   * @param {Boolean} isRecording
   * @param {String} botResponse
   * @param {Boolean} isRegeneratedResponse
   * @param {String} chatId
   */
  const updateChatLog = ({
    userQuery,
    isRecording,
    botResponse,
    isRegeneratedResponse,
    chatId,
  }) => {
    if (isRegeneratedResponse) {
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
          userAudioTranscription: "",
          isViaRecording: true,
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
          userAudioTranscription: "",
        },
      ]);
    }
  };
  /**
   * Function for re-setting the value related to bot-response when the user turn off the recording button.
   */
  const resetResponseRelatedValues = () => {
    setIsApiResponseLoading(false);
    setRecordingIcon(false);
    getAllSessionHandler();
    ipcRenderer.removeAllListeners("botResponse");
  };
  /**
   * Function for re-generating any particular response.
   * @param {String} chatId
   */
  const handleGenerateResponse = (chatId) => {
    if (isApiResponseLoading) return;
    const oldBotResponse = chatLog?.filter(
      (chat) => chat?.chatId === chatId
    )?.[0]?.botResponse;
    try {
      setIsApiResponseLoading(true);
      setIsRegeneratingResponse(true);
      const userQuery = chatLog?.filter((chat) => chat?.chatId === chatId)?.[0]
        ?.chatPrompt;
      updateChatLog({
        isRecording: recordingIcon,
        userQuery: userQuery,
        botResponse: REGENERATING_MESSAGE,
        chatId,
        isRegeneratedResponse: true,
      });

      // sending user question to the backend
      const inputBody = {
        userPrompt: userQuery,
        email: localStorage.getItem(USER_EMAIL),
        session_id: currentSelectedThread || localStorage.getItem(SESSION_ID),
        questionNumber: chatId,
        resume: userAndAi?.resume,
        aiContext: userAndAi?.aiContext,
        userInstructions: userAndAi?.userInstruction,
      };

      ipcRenderer.send("regenerated-response", inputBody);
      ipcRenderer.removeAllListeners("bot-regenerated-response", inputBody);

      ipcRenderer.on("bot-regenerated-response", (event, response) => {
        // getting the response from the bot
        updateChatLog({
          isRecording: recordingIcon,
          userQuery: userQuery,
          botResponse: response,
          chatId,
          isRegeneratedResponse: true,
        });
      });
      //old one: botResponseClosed
      ipcRenderer.on("bot-regenerated-close", (event, response) => {
        resetResponseRelatedValues();
        setIsRegeneratingResponse(false);
      });
    } catch (error) {
      updateChatLog({
        isRecording: recordingIcon,
        userQuery: inputText,
        botResponse: oldBotResponse,
        isRegeneratedResponse: true,
      });
      resetResponseRelatedValues();
      setIsRegeneratingResponse(false);
    }
  };
  /**
   * Function for updating the timer values when recording is going on.
   */
  function updateTimer() {
    setRecordingTimer((prev) => {
      const newTimer = prev + 1;
      setMinutes(Math.floor(newTimer / 60));
      setSeconds(newTimer % 60);
      return newTimer;
    });
  }
  /**
   * Function responsible for triggering the actions to the backend for starting the audio transcription.
   */
  function startSecondaryRecordingFromRenderer() {
    //removing old listeners
    ipcRenderer.removeAllListeners("secondaryRecording");
    ipcRenderer.removeAllListeners("parallelRecording");
    ipcRenderer.removeAllListeners("start-recording-microphone");
    ipcRenderer.removeAllListeners("start-recording-speaker");
    ipcRenderer.removeAllListeners("transcription");
    ipcRenderer.removeAllListeners("stop-recording");
    ipcRenderer.removeAllListeners("microphone-text");

    ipcRenderer.send("start-recording-microphone", {
      userId: localStorage?.getItem(USER_EMAIL),
    });
    ipcRenderer.send("start-recording-speaker", {
      userId: localStorage?.getItem(USER_EMAIL),
    });

    setTimerIntervalRef.current = setInterval(() => {
      updateTimer();
    }, 1000);

    ipcRenderer.on("stop-recording", () => {
      clearInterval(setTimerIntervalRef.current);
      setTimerIntervalRef.current = null;
      if (!isRecordingPaused?.current?.value) {
        setRecordingTimer(0);
        setMinutes(0);
        setSeconds(0);
      }
    });

    ipcRenderer.on("microphone-text", (event, dataObj) => {
      let text = dataObj?.textData;
      const message_type = dataObj?.message_type;

      if (message_type === "FinalTranscript") {
        finalStoredTranscriptMicrophone.current.finalTextData += text;
        text = "";
      }

      if (chatLogRef?.current?.chatLog?.length === 0) {
        return;
      }
      if (text?.includes(SILENCE_DETECTED_MESSAGE)) {
        return;
      }
      setChatLog((prev) => {
        const finalText =
          finalStoredTranscriptMicrophone.current.finalTextData + text;
        prev.at(-1).userAudioTranscription = finalText;
        return prev;
      });
    });
    ipcRenderer.on("transcription", (event, dataObj) => {
      let text = dataObj?.textData;
      const message_type = dataObj?.message_type;
      if (text?.includes(SILENCE_DETECTED_MESSAGE)) {
        text = text?.replaceAll(SILENCE_DETECTED_MESSAGE, "");
        if (isUserOptForAutomatedProcess.current.isAutomated) {
          handleSubmitRef.current.handleSubmitFunction();
        }
      }
      text = text?.replace(
        /\\u([0-9]|[a-fA-F])([0-9]|[a-fA-F])([0-9]|[a-fA-F])([0-9]|[a-fA-F])/g,
        SILENCE_DETECTED_MESSAGE
      );
      if (bufferText !== text) bufferText = text;
      if (!inputText.includes(text)) {
        if (compareStrings(text, INACTIVITY_MESSAGE)) {
          setIsSilenceModalOpen(true);
          return;
        }
        if (message_type === "FinalTranscript") {
          finalStoredTranscriptSpeaker.current.finalTextData += text;
          bufferText = "";
        }
        setInputText(() => {
          const finalText =
            finalStoredTranscriptSpeaker.current.finalTextData + bufferText;
          inputTextRef.current.inputText = finalText;
          return finalText;
        });
      }
    });
  }
  /**
   * Function for stopping and re-setting the value once the user has clicked on the stop recording button.
   */
  function stopRecordingFromRenderer() {
    ipcRenderer.send("send-recording-stop-message");
    ipcRenderer.send("stop-recording");
    ipcRenderer.removeAllListeners("transcription");
    ipcRenderer.removeAllListeners("microphone-text");
    ipcRenderer.removeAllListeners("start-recording-microphone");
    ipcRenderer.removeAllListeners("start-recording-speaker");
  }
  /**
   * Function for sending the user prompt to the backend for generating the response using the open-ai model.
   * @param {Event} e
   */
  const handleSubmit = (e) => {
    e?.preventDefault();
    isScrollToBottomRef.current.value = true;
    const isUserAllowedToUseApplication = isUserAllowed();
    if (!isUserAllowedToUseApplication) {
      toast?.error(RESTRICTION_MESSAGE);
      return;
    }
    setIsShowWordSearchArrows(false);
    if (isShowWordSearchArrows) {
      unHighlightText();
    }
    let textToShow =
      chatLog?.at(-1)?.userAudioTranscription ||
      finalStoredTranscriptMicrophone.current.finalTextData ||
      "";
    if (inputText === "") {
      setRecordingIcon(false);
      updateUserResponse({
        userTranscript: openMic ? `${chatLog?.length}:${textToShow}` : "",
        sessionId: currentSelectedThread,
      });
      return;
    }
    if (isApiResponseLoading) return;
    try {
      setIsShowSearchChatsResult(false);
      onScrollEventHandler();
      setIsApiResponseLoading(true);
      const userPrompt = inputText;
      setInputText("");
      updateChatLog({
        userQuery: userPrompt,
        isRecording: recordingIcon || openMic,
        botResponse: "",
        chatId: chatLog?.length + 1,
        isViaRecording: openMic,
      });

      const inputBody = {
        userPrompt: `${chatLog?.length + 1}:${userPrompt}`,
        email: localStorage.getItem(USER_EMAIL),
        session_id: currentSelectedThread,
        userMicAudio: openMic ? textToShow : "",
        isViaRecording: openMic,
        resume: userAndAi?.resume,
        aiContext: userAndAi?.aiContext,
        userInstructions: userAndAi?.userInstructions,
      };

      if (chatLog?.length >= 1) {
        updateUserResponse({
          userTranscript: `${chatLogRef?.current?.chatLog?.length}:${
            textToShow || ""
          }`,
          sessionId: currentSelectedThread,
        });
      }

      finalStoredTranscriptSpeaker.current.finalTextData = "";
      finalStoredTranscriptMicrophone.current.finalTextData = "";
      setInputText("");

      ipcRenderer.send("voice-recording", inputBody);
      ipcRenderer.on("botResponse", (event, response) => {
        updateChatLog({
          userQuery: userPrompt,
          isRecording: recordingIcon,
          botResponse: response,
          chatId: chatLog?.length + 1,
        });
      });
      ipcRenderer.removeAllListeners("botResponseClosed");
      ipcRenderer.on("botResponseClosed", () => {
        resetResponseRelatedValues();
      });
    } catch (error) {
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
  handleSubmitRef.current["handleSubmitFunction"] = handleSubmit;
  /**
   * Function for starting up the audio recording.
   * @param {Event} e
   * @returns
   */
  const handleRecording = async (e, isOpeningRecording) => {
    const isUserAllowedToUseApplication = isUserAllowed();
    if (!isUserAllowedToUseApplication) {
      toast?.error(RESTRICTION_MESSAGE);
      return;
    }
    setIsShowWordSearchArrows(false);
    if (isShowWordSearchArrows) {
      unHighlightText();
    }
    if (
      isUserOptForAutomatedProcess.current.isAutomated &&
      isOpeningRecording
    ) {
      const isUserUsedRecordingInThisSession = chatLog?.find((item) => {
        return item?.isViaRecording;
      });
      if (isUserUsedRecordingInThisSession) {
        //create a new session
        newThread();
        setIsStartRecording(true);
        return;
      }
    }

    if (openMic) {
      setOpenMic(false);
      isRecordingPaused.current.value = false;
      stopRecordingFromRenderer();
      handleSubmit(e);
      return;
    }
    setIsStartRecording(false);
    setOpenMic(true);
    setIsPause(false);
    startSecondaryRecordingFromRenderer();
    textAreaInputRef?.current?.focus();
    setRecordingIcon(true);
  };
  const onTogglePauseRecording = async () => {
    if (!isPause) {
      //stop the timer but do not reset the values of timer and break the connection
      isRecordingPaused.current.value = true;
      ipcRenderer.send("stop-recording");
      ipcRenderer.removeAllListeners("microphone-text");
      setIsPause(true);
      return;
    }
    //resume the timer and create a connection again
    startSecondaryRecordingFromRenderer();
    setIsPause(false);
  };
  /**
   * Function for creating a new session
   */
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
  /**
   * Function for creating a new chat thread.
   */
  const newThread = async () => {
    ipcRenderer.removeAllListeners("botResponse");
    setChatLog([]);
    setIsShowSearchChatsResult(false);
    setIsShowWordSearchArrows(false);
    setAllEmailsAndTagsOfCurrentSessionSharedWith([]);
    setIsShowChatInput(true);
    await createSession();
    getAllSessionHandler();
    stopRecordingFromRenderer();
  };
  /**
   *  Function for showing the details of any particular session.
   * @param {Object} data
   */
  const showThread = (data) => {
    const chatThread = data?.data?.data;
    const allEmailsChatSharedWith = data?.data?.shared_to;
    const tags = data?.data?.tag;
    setSelectedSearchKeys(data?.data?.keysArray || []);
    stopRecordingFromRenderer();
    setAllEmailsAndTagsOfCurrentSessionSharedWith({
      emails: allEmailsChatSharedWith,
      tags,
    });
    setIsLoading(true);
    setChatLog([]);
    chatThread.map((chat, key) => {
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        {
          chatId: key + 1,
          chatPrompt: chat?.question,
          botResponse: chat?.answer,
          userAudioTranscription:
            chat?.userAudioTranscription?.split(":")?.[1] || "",
          isViaRecording: chat?.is_via_recording,
        },
      ]);
    });

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };
  /**
   * Function to scroll the container till the end
   */
  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollTop = bottomRef.current?.scrollHeight;
    }
  };
  /**
   * Function for getting data based on uer search
   * @param {Object} event
   * @returns
   */
  const onUserSearchHandler = (event) => {
    let query = event?.target?.value;
    setUserSearch(query);
    if (query?.trim()?.length === 0) return;
    searchTagsHandler({
      query,
      pageNumber: 1,
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
    });
  };
  /**
   * Function for searching in chats
   */
  const onChatsSearchHandler = () => {
    searchInChatsHandler({
      query: userSearch,
      pageNumber: 1,
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
      onSuccessCallback: (data) => {
        setChatsSearchResultData(data?.data);
      },
    });
  };
  /**
   * Function for resetting the values of selected tags and the view of showing the tags.
   */
  const onResetFilters = () => {
    setSelectedTags([]);
    setIsShowFilter(false);
    setFiltersPage(1);
  };
  /**
   * Function for checking does the user scrolled up or down
   * @param {Object} event
   * @returns
   */
  function checkScrollDirectionIsUp(event) {
    if (event.wheelDelta) {
      return event.wheelDelta > 0;
    }
    return event.deltaY < 0;
  }
  /**
   * Function for adding the event on the scroll
   */
  function onScrollEventHandler() {
    const scrollContainer = bottomRef.current;

    function checkScrollDirection(event) {
      if (checkScrollDirectionIsUp(event)) {
        //up
        isScrollToBottomRef.current.value = false;
      } else {
        //down
        if (isScrolledToBottom(bottomRef)) {
          isScrollToBottomRef.current.value = true;
        }
      }
    }

    if (scrollContainer) {
      scrollContainer.removeEventListener("wheel", checkScrollDirection);
    }
    if (scrollContainer) {
      scrollContainer.addEventListener("wheel", checkScrollDirection);
    }
  }

  //useEffects
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
    getAllSessionHandler();
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

  useEffect(() => {
    ipcRenderer.removeAllListeners("recordingError");
    ipcRenderer.on("recordingError", () => {
      toast.error("Error recording, please try again", 1000);
      setTimeout(() => {
        clearInterval(setTimerIntervalRef.current);
        setTimerIntervalRef.current = null;
        setMinutes(0);
        setSeconds(0);
        stopRecordingFromRenderer();
      }, 1000);
    });
  }, []);

  useEffect(() => {
    chatLogRef.current.chatLog = chatLog;
    if (!isRegeneratingResponse && isScrollToBottomRef.current.value) {
      scrollToBottom();
    }
    if (chatLog?.length === 1 && !chatLog?.[0]?.botResponse) {
      isScrollToBottomRef.current.value = true;
      onScrollEventHandler();
    }
  }, [chatLog]);

  useEffect(() => {
    if (openMic) {
      putCursorFocusAtTheEnd(textAreaInputRef, inputText);
    }
    inputTextRef.current.inputText = inputText;
  }, [inputText]);

  useEffect(() => {
    let timeOutID;
    if (isStartRecording && chatLog?.length == 0) {
      timeOutID = setTimeout(() => {
        handleRecording({});
        setIsStartRecording(false);
      }, 1000);
    }

    return () => {
      clearTimeout(timeOutID);
    };
  }, [isStartRecording, chatLog?.length]);

  /**
   * Setting up the opacity of theme
   */
  useEffect(() => {
    const value = process.env;
    console.log({value}, "frontend")
    ipcRenderer.send("get-env", value)
    const currentOpacity = +localStorage?.getItem(OPACITY_KEY);
    if (currentOpacity) {
      onOpacityChangeHandler({
        changedOpacity: currentOpacity,
        ipcRenderer,
      });
    }
  }, []);

  const getSessionData = () => {
    if (isShowSearchChatsResult) {
      return chatsSearchResultData;
    }
    return selectedTags?.length ? userSearchResult : allSessionData;
  };

  const getSidebar = () => {
    return (
      <>
        <div
          className={`lg:flex-1 ${
            isMobile ? "w-full" : "w-[25%]"
          } min-w-[200px]`}
        >
          <div className="h-full w-full flex flex-col justify-between">
            <SidebarTopSection
              {...{
                setIsSidebarVisible,
                newThread,
                isApiResponseLoading,
                openMic,
                setChatsSearchPage,
                setChatsSearchResultData,
                setIsShowWordSearchArrows,
                setIsShowSearchChatsResult,
                onChatsSearchHandler,
                isSearchingInChats,
                searchInChatsHandler,
                setUserSearchResult,
                setUserSearchResultTotalPageCount,
                searchedResultTags,
                searchQueryHandler,
                setSearchResultTags,
                setSelectedTags,
                userSearch,
                onUserSearchHandler,
              }}
            />
            {!isShowFilter && isSidebarVisible && (
              <>
                <div
                  className={`w-full h-full max-h-[calc(100%_-_380px)] py-4 pt-0 flex items-star flex-col gap-2`}
                >
                  <Sidebar
                    newThread={newThread}
                    sessionData={getSessionData()}
                    setSessionData={setAllSessionData}
                    showThread={showThread}
                    setIsLoading={setIsLoading}
                    {...{
                      isSidebarVisible,
                      setIsSidebarVisible,
                      setAllSessionData,
                      totalSession,
                      setIsShowWordSearchArrows,
                      isSearchingInChats,
                      isShowSearchChatsResult,
                      userSearch,
                      setChatsSearchResultData,
                      isShowSearchChatsResult,
                      totalSearchedChats,
                      userSearchResultTotalPageCount,
                      currentSelectedThread,
                      setUserSearchResult,
                      errorWhileGettingUserSessionData,
                      fetchUserChatsHistory,
                      isLoadingAllSessionTitles,
                      isSearchingForUserQuery,
                      isSearchingTags,
                      onUserSearchHandler,
                      searchQueryHandler,
                      selectedTags,
                      setCurrentSelectedThread,
                      setIsShowChatInput,
                      setIsShowFilter,
                      setSelectedTags,
                      toast,
                      userSearch,
                      setIsShowSearchChatsResult,
                      //Pages count related states
                      filtersPage,
                      setFiltersPage,
                      chatsSearchPage,
                      setChatsSearchPage,
                      sessionTitlePage,
                      setSessionTitlePage,
                    }}
                  />
                </div>
                <div className="p-4 dark:bg-[#1F1F1F]">
                  <ShareChatAndSettingsChip
                    {...{ allChatsSharedWithTheUser, setShowModal }}
                  />
                </div>
              </>
            )}
            {isShowFilter && (
              <TagsFilter
                {...{
                  setSelectedTags,
                  selectedTags,
                  setIsShowFilter,
                  searchQueryHandler,
                  setUserSearchResultTotalPageCount,
                  onResetFilters,
                  setUserSearchResult,
                }}
                isFetchingFilterResult={isSearchingForUserQuery}
              />
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="max-w-[100vw] w-full relative h-screen p- bg-GreyThemeBG dark:bg-primaryBG">
      <div className="relative w-full z-0 flex h-full justify-between overflow-hidden">
        {/* sidebar menu */}
        {!isMobile && isSidebarVisible && getSidebar()}
        {isMobile && (
          <Drawer
            open={isSidebarVisible}
            onClose={() => setIsSidebarVisible(false)}
            direction="left"
            size={DRAWER_SIZE}
            className="bg-primaryBG w-1/2"
            style={isWhite ? DRAWER_LIGHT_STYLES : DRAWER_DARK_STYLES}
          >
            {getSidebar()}
          </Drawer>
        )}
        <ChatSection
          setSessionData={setAllSessionData}
          microphoneTranscription={
            finalStoredTranscriptMicrophone.current.finalTextData
          }
          {...{
            isSidebarVisible,
            setIsSidebarVisible,
            isShowWordSearchArrows,
            selectedSearchKeys,
            isUserOptForAutomatedProcess,
            toast,
            isPause,
            chatLog,
            isLoading,
            openMic,
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
            setInputText,
            handleSubmit,
            isShowChatInput,
            minutes,
            seconds,
            onTogglePauseRecording,
          }}
        />
      </div>
      {isSilenceModalOpen && (
        <SilenceDetectionModal
          onContinue={() => setIsSilenceModalOpen(false)}
          onQuit={() => {
            stopRecordingFromRenderer();
            handleSubmit();
            resetResponseRelatedValues();
            setIsSilenceModalOpen(false);
          }}
          isOpen={isSilenceModalOpen}
          onClose={() => setIsSilenceModalOpen(false)}
        />
      )}
      {showModal && (
        <SettingsModel
          fetchUserChatsHistory={getAllSessionHandler}
          {...{
            showModal,
            setShowModal,
            showThread,
            setIsShowChatInput,
            newThread,
          }}
        />
      )}
    </div>
  );
}
