import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import CustomLoader from "../molecules/customLoader";
import DeleteModal from "./DeleteModal";
import SingleInputModal from "./SingleInputModal";
import LabelButtonAndChipsList from "./LabelButtonAndChipsList";
import SmallBodyText from "../molecules/SmallBodyText";

import useDeleteSingleSession from "../../hooks/useDeleteSingleSession";
import useFetchSessionChatsApi from "../../hooks/useFetchSessionChatsApi";
import useMarkArchiveApi from "../../hooks/useMarkArchiveApi";
import useObserver from "../../hooks/useObserver";
import useUpdateSessionDetailsApi from "../../hooks/useUpdateSessionDetailsApi";
import useAddAuthenticateUserApi from "../../hooks/useAddAuthenticateUserApi";
import { myToast } from "./ToastNotification";
import {
  delay,
  logout,
  removeParticularSessionTitleFromList,
  updateSessionTitle,
} from "../../utils/utils";
import ChatSidebar from "../../assets/img/chatbubbles.png";
import FiltersIcon from "../../assets/svg/filter-icon.svg";
import BlackFilterIcon from "../../assets/svg/black-filter-icon.svg";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import {
  AUTHENTICATION_API_KEY,
  LIGHT,
  MOBILE_WIDTH,
  PAGINATION_LIMIT,
} from "../../constant/const";
import { LOGIN } from "../../constant/routesNames";
import SearchedChatsChips from "../molecules/SearchedChatsChips";
import useGetSearchedSessionDetailsApi from "../../hooks/useGetSearchedSessionDetailsApi";
import UserProcessesSelectionModal from "./UserProcessesSelectionModal";
import useChatSearchApi from "../../hooks/useChatSearchApi";
import useDimension from "../../hooks/useDimensions";

const Sidebar = ({
  currentSelectedThread,
  errorWhileGettingUserSessionData,
  userSearchResultTotalPageCount,
  fetchUserChatsHistory,
  isLoadingAllSessionTitles,
  isSearchingForUserQuery,
  isSearchingTags,
  newThread,
  searchQueryHandler,
  selectedTags,
  sessionData,
  setCurrentSelectedThread,
  setIsLoading,
  setIsShowChatInput,
  setIsShowFilter,
  setSelectedTags,
  setSessionData,
  setUserSearchResult,
  totalSearchedChats,
  showThread,
  toast,
  isShowSearchChatsResult,
  setChatsSearchResultData,
  userSearch,
  setIsShowSearchChatsResult,
  isSearchingInChats,
  setIsShowWordSearchArrows,
  totalSession,
  setAllSessionData,
  isSidebarVisible,
  setIsSidebarVisible,
  //Pages count related states
  filtersPage,
  setFiltersPage,
  chatsSearchPage,
  setChatsSearchPage,
  sessionTitlePage,
  setSessionTitlePage,
}) => {
  //states
  const [
    selectedSessionForPerformingOperation,
    setSelectedSessionForPerformingOperation,
  ] = useState("");
  const [isDeleteChatModalOpen, setIsDeleteChatModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isUserProcessesModalOpen, setIsUserProcessesModalOpen] =
    useState(false);
  const [newName, setNewName] = useState("");
  const [targetRef, setTargetRef] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedSearchedSession, setSelectedSearchedSession] = useState("");

  //ref
  const fetchNextAllSessionRef = useRef();
  const fetchNextSelectedTagsRef = useRef();
  const onFetchNextResultRef = useRef();

  //react-hooks
  const navigate = useNavigate();

  //contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  //custom-hooks
  const { addAuthenticateUserToDb } = useAddAuthenticateUserApi();
  useObserver({
    callback: () => {
      onFetchNextResultRef.current();
    },
    targetRef,
  });
  const { markChatAsArchivedHandler } = useMarkArchiveApi();
  const { deleteSingleSessionHandler, isLoading: isDeletingChat } =
    useDeleteSingleSession();
  const { fetchSessionChats } = useFetchSessionChatsApi();
  const { updateSessionDetails, isLoading: isUpdatingSessionDetails } =
    useUpdateSessionDetailsApi();
  const { getSearchedSessionDetails } = useGetSearchedSessionDetailsApi();
  const { searchInChatsHandler, isLoading: isFetchingNextChats } =
    useChatSearchApi();
  const { width, height } = useDimension();
  const isMobile = width <= MOBILE_WIDTH;

  //functions
  const getThread = async (sessionId) => {
    setIsLoading(true);
    setIsShowChatInput(true);
    setCurrentSelectedThread(sessionId);
    fetchSessionChats({
      sessionId,
      onErrorCallback: () => {
        toast?.error("Unable to Fetch chats!");
        setIsLoading(false);
      },
      onSuccessCallback: (response) => {
        showThread({ data: response });
        setIsLoading(false);
      },
    });
  };

  const getSearchedSessionThread = (sessionId) => {
    setIsLoading(true);
    setIsShowChatInput(true);
    setCurrentSelectedThread(sessionId);
    getSearchedSessionDetails({
      sessionId,
      query: userSearch,
      onSuccessCallback: (data) => {
        showThread({ data: data });
        setIsLoading(false);
        setIsShowWordSearchArrows(true);
      },
      onErrorCallback: () => {
        toast?.error("Unable to Fetch chats!");
        setIsLoading(false);
      },
    });
  };

  const onMarkSessionArchive = ({ sessionId }) => {
    markChatAsArchivedHandler({
      sessionId,
      onSuccessCallback: async (message) => {
        myToast("You can view archived chats in the settings.");
        removeParticularSessionTitleFromList(
          sessionData,
          sessionId,
          setAllSessionData
        );
        if (currentSelectedThread === sessionId) {
          newThread?.();
        }
      },
      onErrorCallback: (error) => {
        toast?.error(error);
      },
    });
  };

  const onDeleteSingleSession = () => {
    deleteSingleSessionHandler({
      sessionId: selectedSessionForPerformingOperation?.session,
      onSuccessCallback: async (message) => {
        toast?.success(message);
        await delay(3000);
        fetchUserChatsHistory?.({});
        setIsDeleteChatModalOpen(false);
        if (
          currentSelectedThread ===
          selectedSessionForPerformingOperation?.session
        ) {
          newThread?.();
        }
      },
      onErrorCallback: (error) => {
        toast?.error(error);
      },
    });
  };

  const onRenameModal = () => {
    updateSessionDetails({
      sessionId: selectedSessionForPerformingOperation?.session,
      name: newName,
      onSuccessCallback: async () => {
        toast.success("Successfully changed the session title");
        await delay(3000);
        setIsRenameModalOpen(false);
        updateSessionTitle({
          setSessionData,
          id: selectedSessionForPerformingOperation?.session,
          updatedTitle: newName,
        });
      },
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
    });
  };

  const onRemoveAppliedFilterTags = (tagLabel) => {
    const filteredData = selectedTags?.filter((tag) => tag !== tagLabel);
    setSelectedTags(filteredData);
    setFiltersPage(1);
    searchQueryHandler({
      query: filteredData?.join(","),
      pageNumber: 1,
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
      onSuccessCallback: (data) => {
        setUserSearchResult(data?.data || []);
      },
    });
  };

  const fetchNextAllSession = () => {
    fetchUserChatsHistory({
      onSuccessCallback: () => {
        setPage((prev) => prev + 1);
      },
      onErrorCallback: () => {
        toast.error("Error while fetching the all session titles");
      },
      pageNumber: page + 1,
    });
  };
  fetchNextAllSessionRef.current = fetchNextAllSession;

  const fetchNextSelectedTags = () => {
    const totalPages = Math.ceil(
      userSearchResultTotalPageCount / PAGINATION_LIMIT
    );
    if (totalPages < filtersPage + 1) {
      return;
    }
    searchQueryHandler({
      query: selectedTags?.join(","),
      pageNumber: filtersPage + 1,
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
      onSuccessCallback: (data) => {
        setFiltersPage((prev) => {
          return prev + 1;
        });
        setUserSearchResult((prev) => {
          return [...(prev || []), ...(data?.data || [])];
        });
      },
    });
  };
  fetchNextSelectedTagsRef.current = fetchNextSelectedTags;

  const fetchNextChatsSearchResult = () => {
    const totalPageCount = Math.ceil(totalSearchedChats / PAGINATION_LIMIT);
    if (totalPageCount < chatsSearchPage + 1) {
      return;
    }
    searchInChatsHandler({
      query: userSearch,
      pageNumber: chatsSearchPage + 1,
      onErrorCallback: () => {
        toast?.error("Unable to fetch next chats!");
      },
      onSuccessCallback: (data) => {
        setChatsSearchPage((prev) => prev + 1);
        setChatsSearchResultData((prev) => {
          return [...(prev || []), ...(data?.data || [])];
        });
      },
    });
  };

  const fetchNextSessionTitles = () => {
    const totalPageCount = Math.ceil(totalSession / PAGINATION_LIMIT);
    if (totalPageCount < sessionTitlePage + 1) {
      return;
    }
    fetchUserChatsHistory({
      pageNumber: sessionTitlePage + 1,
      onErrorCallback: () => {
        toast?.error("Unable to fetch session titles!");
      },
      onSuccessCallback: (data) => {
        setSessionTitlePage((prev) => prev + 1);
        setSessionData((prev) => {
          return [...(prev || []), ...(data || [])];
        });
      },
    });
  };

  const isShowLoader =
    isFetchingNextChats || isLoadingAllSessionTitles || isSearchingForUserQuery;

  const onFetchNextResult = () => {
    if (
      isSearchingForUserQuery ||
      isSearchingTags ||
      isSearchingInChats ||
      isShowLoader
    ) {
      return;
    }
    if (isShowSearchChatsResult) {
      fetchNextChatsSearchResult();
      return;
    }
    if (selectedTags?.length === 0) {
      //pagination for default titles
      fetchNextSessionTitles();
      return;
    }

    fetchNextSelectedTagsRef.current();
  };
  onFetchNextResultRef.current = onFetchNextResult;

  const getIcon = () => {
    return isWhite ? BlackFilterIcon : FiltersIcon;
  };

  const ALL_SEVEN_DAYS_OLDER_SESSIONS = sessionData?.filter(
    (session) => session.date_message === "7_days_older"
  );
  const ALL_TODAYS_SESSIONS = sessionData?.filter(
    (session) => session.date_message === "today"
  );
  const ALL_EARLIER_SESSIONS = sessionData?.filter(
    (session) => session.date_message === "others"
  );

  const allUserCreatedChats = [
    {
      data: ALL_TODAYS_SESSIONS,
      label: "Today",
      stringToCheck: "today",
      icon: ALL_TODAYS_SESSIONS?.length ? getIcon() : "",
      selectedTags: ALL_TODAYS_SESSIONS?.length ? selectedTags : "",
    },
    {
      data: ALL_SEVEN_DAYS_OLDER_SESSIONS,
      label: "Last 7 days",
      stringToCheck: "7_days_older",
      icon:
        ALL_SEVEN_DAYS_OLDER_SESSIONS?.length && !ALL_TODAYS_SESSIONS?.length
          ? getIcon()
          : "",
      selectedTags:
        ALL_SEVEN_DAYS_OLDER_SESSIONS?.length && !ALL_TODAYS_SESSIONS?.length
          ? selectedTags
          : "",
    },
    {
      data: ALL_EARLIER_SESSIONS,
      label: "Earlier",
      stringToCheck: "others",
      icon:
        ALL_EARLIER_SESSIONS?.length &&
        !ALL_SEVEN_DAYS_OLDER_SESSIONS?.length &&
        !ALL_TODAYS_SESSIONS?.length
          ? getIcon()
          : "",
      selectedTags:
        ALL_EARLIER_SESSIONS?.length &&
        !ALL_SEVEN_DAYS_OLDER_SESSIONS?.length &&
        !ALL_TODAYS_SESSIONS?.length
          ? selectedTags
          : "",
    },
  ];

  //useEffects
  useEffect(() => {
    if (localStorage?.getItem(AUTHENTICATION_API_KEY)) {
      return;
    }
    addAuthenticateUserToDb({
      onErrorCallback: async () => {
        toast.error("Failed to verify, please try again in a while!");
        await delay(3000);
        logout(() => navigate(LOGIN));
      },
      onSuccessCallback: (data) => {
        localStorage?.setItem(AUTHENTICATION_API_KEY, true);
        if (!data?.is_already_register) {
          setIsUserProcessesModalOpen(true);
        }
      },
    });
  }, []);

  if (isShowSearchChatsResult) {
    return (
      <div className="w-full h-full flex flex-col">
        <p className="font-normal text-[12px] dark:text-GreyText px-4">
          All Chats
        </p>
        {!isSearchingInChats && !!sessionData?.length && (
          <div className="overflow-y-auto flex flex-col gap-4 flex-1">
            {!!sessionData?.length &&
              sessionData?.map((chat) => {
                return (
                  <SearchedChatsChips
                    isSelected={selectedSearchedSession === chat?.session}
                    onClick={() => {
                      setIsShowSearchChatsResult(true);
                      getSearchedSessionThread(chat?.session);
                      setSelectedSearchedSession(chat?.session);
                    }}
                    key={chat?.session}
                    title={chat?.title}
                    content={chat?.content}
                  />
                );
              })}
            {isShowLoader && (
              <div className="w-full flex justify-center items-center">
                <CustomLoader />
              </div>
            )}
            <div
              ref={(refVal) => setTargetRef(refVal)}
              className="opacity-100 text-[4px] text-white dark:text-black"
            >
              Last Div
            </div>
          </div>
        )}
        {!!isSearchingInChats && (
          <div className="w-full flex justify-center items-center h-full">
            <CustomLoader />
          </div>
        )}
        {!isSearchingInChats && !sessionData?.length && (
          <div className="w-full min-h-[120px] flex justify-center items-center">
            <p className="text-black dark:text-white text-[12px]">
              No Chats to show!
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="overflow-y-auto h-full flex flex-col justify-center items-center w-full">
        {sessionData?.length > 0 && sessionData != [] ? (
          <div
            className={`flex flex-col gap-2 w-full ${
              isMobile ? `` : "h-full"
            } py-1`}
            style={isMobile ? { maxHeight: `${height - 380}px` } : {}}
          >
            <div className="w-full flex flex-col gap-[10px]">
              {allUserCreatedChats?.map((chat) => {
                return (
                  <LabelButtonAndChipsList
                    label={chat?.label}
                    data={chat?.data}
                    tagsList={chat?.selectedTags}
                    icon={chat?.icon}
                    stringToCheck={chat?.stringToCheck}
                    {...{
                      currentSelectedThread,
                      getThread,
                      onRemoveAppliedFilterTags,
                      setIsShowFilter,
                    }}
                    onIconClick={() => setIsShowFilter(true)}
                    onRename={(session) => {
                      setSelectedSessionForPerformingOperation(session);
                      setIsRenameModalOpen(true);
                      setNewName(session?.title || "");
                    }}
                    onArchive={(sessionId) =>
                      onMarkSessionArchive({
                        sessionId: sessionId,
                      })
                    }
                    onDelete={(session) => {
                      setSelectedSessionForPerformingOperation(session);
                      setIsDeleteChatModalOpen(true);
                    }}
                  />
                );
              })}
              {isShowLoader && (
                <div className="w-full flex justify-center items-center">
                  <CustomLoader />
                </div>
              )}
            </div>
            <div
              ref={(refVal) => setTargetRef(refVal)}
              className="opacity-100 text-[4px] text-white dark:text-black"
            >
              Last Div
            </div>
          </div>
        ) : (
          <>
            {(sessionData?.status === "No session title found" ||
              sessionData?.length === 0) &&
            !isLoadingAllSessionTitles ? (
              <div className="flex flex-col items-center justify-center gap-2 h-full">
                <img
                  src={ChatSidebar}
                  alt="ChatSidebar"
                  className="w-[162px] h-[108px] opacity-[0.2] bg-lightgray bg-center bg-contain bg-no-repeat mix-blend-luminosity"
                />
                <SmallBodyText
                  text="No History yet"
                  textColor="text-black dark:!text-GrayText"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 w-full h-full px-4">
                <div className="flex flex-col justify-center items-center">
                  <img
                    src={ChatSidebar}
                    alt="ChatSidebar"
                    className="w-[162px] h-[108px] opacity-[0.2] bg-lightgray bg-center bg-contain bg-no-repeat mix-blend-luminosity"
                  />
                  {errorWhileGettingUserSessionData && (
                    <p className="dark:text-white px-4">
                      Something went wrong while loading history
                    </p>
                  )}
                  {isLoadingAllSessionTitles && <CustomLoader />}
                </div>
              </div>
            )}
          </>
        )}
        {isDeleteChatModalOpen && (
          <DeleteModal
            isModalOpen={isDeleteChatModalOpen}
            onClose={() => setIsDeleteChatModalOpen(false)}
            onDelete={onDeleteSingleSession}
            chatTitle={selectedSessionForPerformingOperation?.title}
            disabledBtn={isDeletingChat}
          />
        )}
        {isRenameModalOpen && (
          <SingleInputModal
            value={newName}
            onChange={(e) => setNewName(e?.target?.value)}
            isOpen={isRenameModalOpen}
            onClose={() => setIsRenameModalOpen(false)}
            buttonLabel={isUpdatingSessionDetails ? "Submitting" : "Submit"}
            placeholder="Enter Name"
            heading="Rename Chat"
            onClick={onRenameModal}
            loading={isUpdatingSessionDetails}
            disabled={isUpdatingSessionDetails || newName?.trim()?.length === 0}
          />
        )}
        {isUserProcessesModalOpen && (
          <UserProcessesSelectionModal
            isOpen={isUserProcessesModalOpen}
            onClose={() => setIsUserProcessesModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  sessionData: PropTypes.array,
  showThread: PropTypes.func,
  setIsLoading: PropTypes.func,
  fetchUserChatsHistory: PropTypes.func,
  setIsShowChatInput: PropTypes.func,
  errorWhileGettingUserSessionData: PropTypes.string,
  setCurrentSelectedThread: PropTypes.func,
  currentSelectedThread: PropTypes.string,
  isSearchingForUserQuery: PropTypes.bool,
  newThread: PropTypes.func,
  setSessionData: PropTypes.func,
  userSearchResultTotalPageCount: PropTypes.number,
  isLoadingAllSessionTitles: PropTypes.bool,
  isSearchingTags: PropTypes.bool,
  searchQueryHandler: PropTypes.func,
  selectedTags: PropTypes.array,
  setIsShowFilter: PropTypes.func,
  setSelectedTags: PropTypes.func,
  toast: PropTypes.func,
};

export default Sidebar;
