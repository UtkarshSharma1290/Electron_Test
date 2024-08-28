import React, { useState, useEffect, useRef, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useWhisper from "@chengsokdara/use-whisper";

import BodyText from "../components/molecules/BodyText";
import ChatSection from "../views/ChatSection";
import Sidebar from "../components/includes/sidebar";
import SettingsModel from "../components/includes/settingModel";
import SilenceDetectionModal from "../components/includes/SilenceDetectionModal";
import TagsFilter from "../components/includes/TagsFilter";
import Chip from "../components/molecules/Chip";

import useGetAllSharedChatsApi from "../hooks/useGetAllSharedChatsApi";
import useGetNewSessionIdApi from "../hooks/useGetNewSessionIdApi";
import useGetSessionHistory from "../hooks/useGetSessionHistory";
import useSearchApi from "../hooks/useSearchApi";
import useSearchTags from "../hooks/useSearchTags";
import { ThemeContext } from "../context/Theme/ThemeContext";
import {
  compareStrings,
  isUserAllowed,
  putCursorFocusAtTheEnd,
} from "../utils/utils";
import BlueLogo from "../assets/svg/blue-logo.svg";
import SearchBar from "../components/molecules/SearchBar";
import BlackSettings from "../assets/svg/black-settings.svg";
import WhiteChatIcon from "../assets/svg/white-chat.svg";
import { ChatIcons, LogoAIInterviewer, SettingIcons } from "../assets/svgIcon";
import {
  INACTIVITY_MESSAGE,
  LIGHT,
  MAX_COUNT_OF_SHARED_CHAT_TO_SHOW,
  PROCESS_TYPES,
  RESTRICTION_MESSAGE,
  SESSION_ID,
  SILENCE_DETECTED_MESSAGE,
  USER_EMAIL,
} from "../constant/const";
import { SHARED_SESSION } from "../constant/routesNames";
import { ProcessContext } from "../context/Process/ProcessContext";
import "react-toastify/dist/ReactToastify.css";

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
  const [isRegeneratingResponse, setIsRegeneratingResponse] = useState(false);
  const [currentSelectedThread, setCurrentSelectedThread] = useState("");
  const [isShowMyResponses, setIsShowMyResponses] = useState(false);
  const [
    allEmailsAndTagsOfCurrentSessionSharedWith,
    setAllEmailsAndTagsOfCurrentSessionSharedWith,
  ] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [isSilenceModalOpen, setIsSilenceModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [lengthTillLastEnteredInput, setLengthTillLastEnteredInputs] =
    useState(0);
  const [isShowFilter, setIsShowFilter] = useState(false);
  const [page, setPage] = useState(0);
  const [userSearchResult, setUserSearchResult] = useState([]);

  //react-hooks
  const textAreaInputRef = useRef();
  const setTimerInterval = useRef(null);
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  // Just for making the input and chatLog states values available inside the setInterval callback function
  const inputTextRef = useRef({ inputText });
  const chatLogRef = useRef({ chatLog });
  const handleSubmitRef = useRef({ handleSubmitFunction: null });
  const isUserOptForAutomatedProcess = useRef({ isAutomated: false });
  const finalStoredTranscriptSpeaker = useRef({ finalTextData: "" });
  const finalStoredTranscriptMicrophone = useRef({ finalTextData: "" });

  //custom-hooks
  const {
    fetchUserChatsHistory,
    data: allSessionData,
    setData: setAllSessionData,
    error: errorWhileGettingUserSessionData,
    isLoading: isLoadingAllSessionTitles,
  } = useGetSessionHistory();
  const { getNewSessionId } = useGetNewSessionIdApi();
  const { data: allChatsSharedWithTheUser } = useGetAllSharedChatsApi();
  const {
    searchQueryHandler,
    isLoading: isSearchingForUserQuery,
    data: userSearchResultData,
  } = useSearchApi();
  const {
    searchTagsHandler,
    data: searchedResultTags,
    error: errorWhileSearchingTags,
    isLoading: isSearchingTags,
    setData: setSearchResultTags,
  } = useSearchTags();

  // const {
  //   recording: systemRecording,
  //   speaking: systemSpeaking,
  //   transcribing: systemTranscribing,
  //   transcript: systemTranscript,
  //   startRecording: startSystemRecording,
  //   stopRecording: stopSystemRecording,
  //   onClearingChunks,
  // } = useWhisper({
  //   apiKey: "asdxnkdjenwdewjb",
  //   streaming: true,
  //   removeSilence: true,
  //   timeSlice: 1_000, // 1 second
  //   whisperConfig: {
  //     language: "en",
  //     response_format: "verbose_json",
  //   },
  // });

  //contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;
  const { processDetails } = useContext(ProcessContext);
  isUserOptForAutomatedProcess.current.isAutomated =
    processDetails?.process === PROCESS_TYPES?.AUTOMATIC;

  //Global-variables
  let bufferText = "";

  //functions
  /**
   * Function for updating the values of ChatLog
   * @param {String} userQuery
   * @param {Boolean} isRecording
   * @param {String} botResponse
   * @param {Boolean} isReneratedResponse
   * @param {String} chatId
   */
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
          userAudioTranscription: "",
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
    fetchUserChatsHistory({});
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
      };

      // old ones:
      //ipcRenderer.send("voice-recording", inputBody);
      //ipcRenderer.on("botResponse", (event, response)
      ipcRenderer.send("regenerated-response", inputBody);
      ipcRenderer.removeAllListeners("bot-regenerated-response", inputBody);

      ipcRenderer.on("bot-regenerated-response", (event, response) => {
        // getting the response from the bot
        updateChatLog({
          isRecording: recordingIcon,
          userQuery: userQuery,
          botResponse: response,
          chatId,
          isReneratedResponse: true,
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
        isReneratedResponse: true,
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
   * Function responsible for triggering the actions on the backend for starting the audio transcription.
   */
  function startSecondaryRecordingFromRenderer() {
    setOpenMic(true);

    //removing old listeners
    ipcRenderer.removeAllListeners("secondaryRecording");
    ipcRenderer.removeAllListeners("parallelRecording");
    ipcRenderer.removeAllListeners("start-recording-microphone");
    ipcRenderer.removeAllListeners("start-recording-speaker");
    ipcRenderer.removeAllListeners("transcription");
    ipcRenderer.removeAllListeners("stop-recording");
    /**
     * Below option is for Wishper AI frontend audio transcription
     */
    // ipcRenderer.send("speaker-testing");

    // ipcRenderer.send("secondaryRecording");
    // ipcRenderer.send("parallelRecording"); // for getting the audio from microphone

    //::: FOR ASSEMBLY AI
    // ipcRenderer.send("assembly-ai-speaker");
    // ipcRenderer.send("assembly-ai-microphone");
    /////////////////////

    ipcRenderer.send("start-recording-microphone", {
      userId: localStorage?.getItem(USER_EMAIL),
    });
    ipcRenderer.send("start-recording-speaker", {
      userId: localStorage?.getItem(USER_EMAIL),
    });

    setTimerInterval.current = setInterval(() => {
      updateTimer();
    }, 1000);

    ipcRenderer.on("stop-recording", (event, args) => {
      clearInterval(setTimerInterval.current);
      setTimerInterval.current = null;
      // stopSystemRecording();
      setRecordingTimer(0);
      setMinutes(0);
      setSeconds(0);
    });

    //Note: ASSEMBLY-AI
    // if (isUserPersonaOn) {
    //   ipcRenderer.removeAllListeners(MICROPHONE_TEXT);
    //   ipcRenderer.on(MICROPHONE_TEXT, (event, text) => {
    //     setMircroPhoneInputText((prev) => prev + text);
    //   });
    // }
    //////////////////

    ipcRenderer.removeAllListeners("microphone-text");
    ipcRenderer.on("microphone-text", (event, dataObj) => {
      let text = dataObj?.textData;
      const message_type = dataObj?.message_type;

      console.log({ micObj: dataObj });
      if (message_type === "FinalTranscript") {
        finalStoredTranscriptMicrophone.current.finalTextData += text;
        text = "";
      }

      console.log("newly coming user audio text:", { text, chatLogRef });
      if (chatLogRef?.current?.chatLog?.length === 0) {
        return;
      }
      if (text?.includes(SILENCE_DETECTED_MESSAGE)) {
        return;
      }
      //TODO: need to work on this later
      setChatLog((prev) => {
        const finalText =
          finalStoredTranscriptMicrophone.current.finalTextData + text;
        prev.at(-1).userAudioTranscription = finalText;
        return prev;
      });
    });
    ipcRenderer.on("transcription", (event, dataObj) => {
      console.log({ dataObj });
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
          console.log("---------- updating the transcript ------------------");
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
    setOpenMic(false);
    ipcRenderer.send("stop-recording");
    setRecordingTimer(0);
    ipcRenderer.removeAllListeners("transcription");
    ipcRenderer.removeAllListeners("microphone-text");

    ipcRenderer.removeAllListeners("start-recording-microphone");
    ipcRenderer.removeAllListeners("start-recording-speaker");
    //ASSEMBLY_AI
    ipcRenderer.send("stop-recording-assembly-ai");
  }
  /**
   * Function for sending the user prompt to the backend for generating the response using the open-ai model.
   * @param {Event} e
   */
  const handleSubmit = async (e) => {
    e?.preventDefault();
    const isUserAllowedToUseApplication = isUserAllowed();
    if (!isUserAllowedToUseApplication) {
      toast?.error(RESTRICTION_MESSAGE);
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

      // let textToShow = systemTranscript?.text;
      let textToShow =
        chatLog?.at(-1)?.userAudioTranscription ||
        finalStoredTranscriptMicrophone.current.finalTextData ||
        "";
      if (textToShow?.length >= lengthTillLastEnteredInput) {
        textToShow = textToShow?.slice(lengthTillLastEnteredInput);
      }

      const inputBody = {
        userPrompt: userPrompt,
        email: localStorage.getItem(USER_EMAIL),
        session_id: currentSelectedThread,
        userMicAudio: openMic ? textToShow : "",
      };
      finalStoredTranscriptSpeaker.current.finalTextData = "";
      finalStoredTranscriptMicrophone.current.finalTextData = "";
      setInputText("");

      // if (openMic) {
      //   setLengthTillLastEnteredInputs(systemTranscript?.text?.length + 1);
      // }

      ipcRenderer.send("clear-chunks");
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
        console.log("bot response ended");
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
      // stopSystemRecording();
    }
  };
  handleSubmitRef.current["handleSubmitFunction"] = handleSubmit;
  /**
   * Function for starting up the audio recording.
   * @param {Event} e
   * @returns
   */
  const handleRecording = (e) => {
    const isUserAllowedToUseApplication = isUserAllowed();
    if (!isUserAllowedToUseApplication) {
      toast?.error(RESTRICTION_MESSAGE);
      return;
    }
    if (openMic) {
      console.log("closing both the mics");
      // stopSystemRecording();
      stopRecordingFromRenderer();
      handleSubmit(e);
      return;
    }
    // startSystemRecording(); // starting up the user audio transcription
    startSecondaryRecordingFromRenderer();
    textAreaInputRef?.current?.focus();
    setRecordingIcon(true);
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
    setAllEmailsAndTagsOfCurrentSessionSharedWith([]);
    setIsShowChatInput(true);
    await createSession();
    fetchUserChatsHistory({});
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
          userAudioTranscription: chat?.user_answer,
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

  const onUserSearchHandler = (event) => {
    let query = event?.target?.value;
    setUserSearch(query);
    searchTagsHandler({
      query,
      pageNumber: 1,
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
      onSuccessCallback: (data) => {
        setUserSearchResult(data?.data);
      },
    });
    //TODO: add general search query as well
  };

  const fetchNextAllSession = () => {
    searchQueryHandler({
      query: userSearch,
      pageNumber: page + 1,
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
      onSuccessCallback: (data) => {
        setPage((prev) => {
          return prev + 1;
        });
        setUserSearchResult((prev) => {
          return [...(prev || []), ...data?.data];
        });
      },
    });
  };

  const fetchNextSearchQuery = () => {
    searchQueryHandler({
      query: userSearch,
      pageNumber: page + 1,
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
      onSuccessCallback: (data) => {
        setPage((prev) => {
          return prev + 1;
        });
        setUserSearchResult((prev) => {
          return [...(prev || []), ...data?.data];
        });
      },
    });
  };

  const fetchNextSelectedTags = () => {
    searchQueryHandler({
      query: userSearch,
      pageNumber: page + 1,
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
      onSuccessCallback: (data) => {
        setPage((prev) => {
          return prev + 1;
        });
        setUserSearchResult((prev) => {
          return [...(prev || []), ...data?.data];
        });
      },
    });
  };

  const onFetchNextResult = () => {
    console.log("called....");
    console.log("called.... twice");
    if (isSearchingForUserQuery || isSearchingTags) {
      return;
    }
    console.log({ userSearch });
    if (selectedTags?.length === 0 && !userSearch) {
      fetchNextAllSession();
      return;
    }

    if (selectedTags?.length === 0) {
      fetchNextSearchQuery();
      return;
    }

    fetchNextSelectedTags();
  };

  const onResetFilters = () => {
    setSelectedTags([]);
    setIsShowFilter(false);
  };

  const onRemoveAppliedFilterTags = (tagLabel) => {
    const filteredData = selectedTags?.filter((tag) => tag !== tagLabel);
    setSelectedTags(filteredData);
    searchQueryHandler({
      query: filteredData?.join(","),
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
    });
  };

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
    chatLogRef.current.chatLog = chatLog;
    if (!isRegeneratingResponse) {
      scrollToBottom();
    }
  }, [chatLog]);

  useEffect(() => {
    if (openMic) {
      putCursorFocusAtTheEnd(textAreaInputRef, inputText);
    }
    inputTextRef.current.inputText = inputText;
  }, [inputText]);

  // for wishper ai on frontend
  // useEffect(() => {
  //   if (chatLog?.length === 0) {
  //     return;
  //   }
  //   if (
  //     systemTranscript?.text &&
  //     systemTranscript?.text?.trim()?.toLowerCase() !== "you"
  //   ) {
  //     let textToShow = systemTranscript?.text;
  //     if (textToShow?.length >= lengthTillLastEnteredInput) {
  //       textToShow = textToShow?.slice(lengthTillLastEnteredInput);
  //     }
  //     setChatLog((prev) => {
  //       prev.at(-1).userAudioTranscription = textToShow + "";
  //       return prev;
  //     });
  //   }
  // }, [systemTranscript?.text]);

  return (
    <div className="max-w-[100vw] w-full relative h-screen p- bg-GreyThemeBG dark:bg-primaryBG">
      <div className="relative w-full z-0 flex h-full justify-between overflow-hidden">
        {/* sidebar menu */}
        <div className="lg:flex-1 w-[25%] min-w-[200px]">
          <div className="h-full w-full flex flex-col justify-between">
            <div className="w-full flex flex-col gap-4 p-4">
              {!isWhite ? (
                <LogoAIInterviewer />
              ) : (
                <img
                  src={BlueLogo}
                  alt="blue-logo"
                  className="w-[72px] h-[72px]"
                />
              )}
              <button
                className={`
                  bg-black 
                  text-white 
                  dark:bg-Neon 
                  dark:text-blackBG  
                  w-full 
                  p-3 
                  rounded 
                  flex 
                  justify-between 
                  text-base 
                  font-medium
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                `}
                onClick={newThread}
                disabled={isApiResponseLoading}
              >
                <p>New Chat</p>
                {isWhite ? (
                  <img src={WhiteChatIcon} alt="chat-icon" />
                ) : (
                  <ChatIcons />
                )}
              </button>
              <SearchBar
                {...{
                  searchedResultTags,
                  searchQueryHandler,
                  setSearchResultTags,
                  setSelectedTags,
                }}
                value={userSearch}
                onChange={onUserSearchHandler}
              />
            </div>
            {!isShowFilter && (
              <>
                <div className="w-full h-full max-h-[calc(100%_-_380px)] py-4 pt-0 flex items-star flex-col gap-2">
                  {!!selectedTags?.length && (
                    <div className="p-2 flex flex-wrap overflow-y-auto max-h-[220px] gap-2">
                      {selectedTags?.map((tag) => {
                        return (
                          <Chip
                            isAlignReverse
                            key={tag}
                            label={tag}
                            type="black"
                            isCrossIcon
                            clickable
                            onClick={() => onRemoveAppliedFilterTags(tag)}
                          />
                        );
                      })}
                    </div>
                  )}
                  <Sidebar
                    newThread={newThread}
                    sessionData={
                      // selectedTags?.length || userSearch
                      selectedTags?.length
                        ? userSearchResultData?.data
                        : allSessionData
                    }
                    setSessionData={setAllSessionData}
                    showThread={showThread}
                    setIsLoading={setIsLoading}
                    {...{
                      toast,
                      isLoadingAllSessionTitles,
                      fetchUserChatsHistory,
                      setIsShowChatInput,
                      errorWhileGettingUserSessionData,
                      setCurrentSelectedThread,
                      currentSelectedThread,
                      isSearchingForUserQuery,
                      userSearchResult,
                      page,
                      onUserSearchHandler,
                      onFetchNextResult,
                      setIsShowFilter,
                    }}
                  />
                </div>
                <div className="p-4">
                  <button
                    className={`
                  flex 
                  justify-between 
                  items-center 
                  w-full 
                  p-3 
                  bg-lightWhiteBG 
                  dark:bg-transparent 
                  rounded-lg
                `}
                    onClick={() => navigate(SHARED_SESSION)}
                  >
                    <p className="dark:text-white text-[16px] dark:font-medium">
                      Shared chats
                    </p>
                    {!!allChatsSharedWithTheUser?.length && (
                      <span
                        className={`
                      text-white 
                      bg-black 
                      dark:text-black 
                      dark:bg-Neon 
                      rounded-full 
                      text-[12px] 
                      min-w-[24px] 
                      min-h-[24px] 
                      flex 
                      justify-center 
                      items-center
                    `}
                      >
                        +
                        {Math.min(
                          MAX_COUNT_OF_SHARED_CHAT_TO_SHOW,
                          allChatsSharedWithTheUser?.length
                        )}
                      </span>
                    )}
                  </button>
                  <button
                    className={`
                flex 
                justify-between 
                items-center 
                p-3  
                w-full 
                bg-lightWhiteBG 
                dark:bg-primaryBG 
                my-2 
                rounded-lg
              `}
                    onClick={() => setShowModal(true)}
                  >
                    <BodyText text="Settings" textColor="dark:text-white" />
                    {isWhite ? (
                      <img src={BlackSettings} alt="setting-icon" />
                    ) : (
                      <SettingIcons />
                    )}
                  </button>
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
                  onResetFilters,
                }}
                isFetchingFilterResult={isSearchingForUserQuery}
              />
            )}
          </div>
        </div>
        {/* chat section */}
        <ChatSection
          setSessionData={setAllSessionData}
          {...{
            toast,
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
            lengthTillLastEnteredInput,
          }}
        />
      </div>
      {isSilenceModalOpen && (
        <SilenceDetectionModal
          onContinue={() => setIsSilenceModalOpen(false)}
          onQuit={() => {
            stopRecordingFromRenderer();
            handleSubmit();
            setIsSilenceModalOpen(false);
          }}
          isOpen={isSilenceModalOpen}
          onClose={() => setIsSilenceModalOpen(false)}
        />
      )}
      {showModal && (
        <SettingsModel
          {...{
            showModal,
            setShowModal,
            fetchUserChatsHistory,
            showThread,
            setIsShowChatInput,
            newThread,
          }}
        />
      )}
      {/* <ToastContainer
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
        limit={1}
      /> */}
    </div>
  );
}
