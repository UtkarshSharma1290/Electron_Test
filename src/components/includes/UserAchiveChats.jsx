import React from "react";
import PropTypes from "prop-types";

import useFetchArchiveApi from "../../hooks/useFetchArchiveChatsApi";
import LabelDateAndOptions from "./LabelDateAndOptions";
import { formatDate } from "../../utils/utils";
import BinIcon from "../../assets/svg/Bin-new.svg";
import UnarchiveIcon from "../../assets/svg/Unarchive.svg";
import useRemoveArchiveApi from "../../hooks/useRemoveArchived";
import useDeleteSingleSession from "../../hooks/useDeleteSingleSession";
import useGetArchivedChatApi from "../../hooks/useGetArchivedChatApi";

const UserAchiveChats = ({
  activeTab,
  fetchUserChatsHistory,
  showThread,
  setShowModal,
  setIsShowChatInput,
  toast,
}) => {
  // custom-hooks
  const { removeChatFromArchivedHandler, isLoading: isUnArchivingChats } =
    useRemoveArchiveApi();
  const { deleteSingleSessionHandler, isLoading: isDeletingSession } =
    useDeleteSingleSession();
  const {
    data: allArchivedChatsData,
    fetchArchivedChats,
    isLoading: isFetchingArchiveChats,
  } = useFetchArchiveApi();
  const { getArchivedChat } = useGetArchivedChatApi();

  //functions
  const onRemoveArchivedChats = (sessionId) => {
    removeChatFromArchivedHandler({
      sessionId,
      onSuccessCallback: () => {
        fetchArchivedChats({});
        fetchUserChatsHistory?.({});
      },
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
    });
  };

  const onDeletingSession = (sessionId) => {
    deleteSingleSessionHandler({
      sessionId,
      onSuccessCallback: (message) => {
        toast?.success(message);
        fetchArchivedChats({});
      },
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
    });
  };

  const onFetchingArchivedChatData = (sessionId) => {
    getArchivedChat({
      sessionId,
      onSuccessCallback: (data) => {
        showThread({ data: { data, shared_to: [], tag: [] } });
        setShowModal(false);
        setIsShowChatInput(false);
      },
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
    });
  };
  const areChatsAvailable =
    !!allArchivedChatsData && allArchivedChatsData?.length > 0;

  return (
    <div
      id="third"
      className={`w-full flex flex-col gap-4 ${
        activeTab === "#third" ? "" : "hidden"
      }`}
    >
      <div className="min-h-[500px] min-w-[300px] rounded flex flex-col gap-3 p-2 overflow-y-auto max-h-[500px]">
        {areChatsAvailable &&
          allArchivedChatsData?.map((archivedChats) => {
            return (
              <LabelDateAndOptions
                key={archivedChats?.created_at}
                onLabelClick={() =>
                  onFetchingArchivedChatData(archivedChats?.session)
                }
                label1="Name"
                label2="Date Created"
                value1={archivedChats?.title}
                value2={formatDate(archivedChats?.created_at)}
                icon1={UnarchiveIcon}
                icon2={BinIcon}
                onClickOption1={() =>
                  onRemoveArchivedChats(archivedChats?.session)
                }
                onClickOption2={() => onDeletingSession(archivedChats?.session)}
                isLoading={isDeletingSession || isUnArchivingChats}
              />
            );
          })}
        {!areChatsAvailable && (
          <div className="p-4 min-h-[50vh] flex justify-center items-center">
            <p className="text-black font-medium dark:text-white">
              {isFetchingArchiveChats
                ? "Loading chats...."
                : "No archived chats!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

UserAchiveChats.propTypes = {
  activeTab: PropTypes.string,
  fetchUserChatsHistory: PropTypes.func,
  showThread: PropTypes.func,
  setShowModal: PropTypes.func,
  setIsShowChatInput: PropTypes.func,
};

export default UserAchiveChats;
