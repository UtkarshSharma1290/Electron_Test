import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

import Chip from "../molecules/Chip";
import InitialsImg from "../includes/InitialsImg";
import SessionTagsModal from "./SessionTagsModal";
import SingleTextAndButtonModal from "./SingleTextAndButtonModal";
import ShareChatModal from "./ShareChatModal";

import useUpdateTagsApi from "../../hooks/useUpdateTagsApi";
import ShareIcon from "../../assets/svg/share.svg";
import SidebarIcon from "../../assets/svg/sidebar-icon.svg";
import SidebarBlackIcon from "../../assets/svg/sidebar-black-icon.svg";
import BlackShareIcon from "../../assets/svg/black-share.svg";
import TurnOffToggleIcon from "../../assets/svg/turn-off-toggle.svg";
import GreyToggleOff from "../../assets/svg/grey-Toggle-off.svg";
import TurnOnToggleIcon from "../../assets/svg/turn-on-toggle.svg";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import {
  splitStrBasedOnCommaAndFilterEmptyStr,
  updateSessionTitle,
} from "../../utils/utils";
import {
  DUPLICATE_MESSAGE,
  LIGHT,
  MAX_TAGS_TO_SHOW,
  TAGS_LIMIT_EXCEED_MESSAGE,
} from "../../constant/const";

const ChatHeader = ({
  setIsSidebarVisible,
  isSidebarVisible,
  sessionId,
  isShowMyResponses,
  setSessionData,
  setIsShowMyResponses,
  allEmailsAndTagsOfCurrentSessionSharedWith,
}) => {
  //states
  const [currentSessionTags, setCurrentSessionTags] = useState(
    splitStrBasedOnCommaAndFilterEmptyStr(
      allEmailsAndTagsOfCurrentSessionSharedWith?.tags
    ) || []
  );
  const [emailsCurrentSessionSharedWith, setEmailsCurrentSessionSharedWith] =
    useState(allEmailsAndTagsOfCurrentSessionSharedWith?.emails);
  const [isSessionTagModalOpen, setIsSessionTagModal] = useState(false);
  const [selectedSessionToShare, setSelectedSessionToShare] = useState("");
  const [isDuplicateTagModalOpen, setIsDuplicateTagModalOpen] = useState(false);
  const [isTagLimitModalOpen, setIsTagLimitModalOpen] = useState(false);

  //custom-hooks
  const { updateSessionTags, isLoading: isUpdatingSessionTags } =
    useUpdateTagsApi();

  //contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  //functions
  const onUpdateSessionTags = (e, tagsStringToUpdate) => {
    if (e?.preventDefault) {
      e?.preventDefault();
    }
    updateSessionTags({
      sessionId,
      tags: tagsStringToUpdate,
      onSuccessCallback: () => {
        setCurrentSessionTags(
          splitStrBasedOnCommaAndFilterEmptyStr(tagsStringToUpdate)
        );
        updateSessionTitle({
          setSessionData,
          id: sessionId,
          tags: splitStrBasedOnCommaAndFilterEmptyStr(tagsStringToUpdate),
        });
      },
      onErrorCallback: ({ isChatDuplication, error }) => {
        if (isChatDuplication) {
          setIsDuplicateTagModalOpen(true);
          return;
        }
        setIsTagLimitModalOpen(true);
      },
    });
  };

  const onRemoveTag = (tagToRemove) => {
    const filteredTags = currentSessionTags?.filter(
      (tag) => tag?.toLowerCase() !== tagToRemove
    );
    onUpdateSessionTags({}, filteredTags?.join(","));
  };

  const openModal = () => {
    if (currentSessionTags?.length >= MAX_TAGS_TO_SHOW) {
      setIsTagLimitModalOpen(true);
      return;
    }
    setIsSessionTagModal(true);
  };

  //useEffects
  useEffect(() => {
    setEmailsCurrentSessionSharedWith(
      allEmailsAndTagsOfCurrentSessionSharedWith?.emails
    );
  }, [allEmailsAndTagsOfCurrentSessionSharedWith?.emails]);

  return (
    <>
      <div className="flex justify-between items-center border-gray-300 dark:border-white border-b-[1px] w-full p-[16px]">
        <div className="flex justify-between items-center gap-[24px]">
          <div className="flex gap-2 justify-between items-center">
            {!isSidebarVisible && (
              <button
                onClick={() => setIsSidebarVisible(true)}
                className="flex items-start justify-end"
              >
                <img
                  src={isWhite ? SidebarBlackIcon : SidebarIcon}
                  alt="sidebar"
                  className="w-[24px] h-[24px] opacity-70"
                />
              </button>
            )}
            <button onClick={() => setIsShowMyResponses((prev) => !prev)}>
              {isShowMyResponses ? (
                <img src={TurnOnToggleIcon} alt="toggle-icon" />
              ) : (
                <img
                  src={isWhite ? GreyToggleOff : TurnOffToggleIcon}
                  alt="toggle-icon"
                />
              )}
            </button>
            <p className="dark:text-white text-[14px] md:text-base">
              Show My Responses
            </p>
          </div>
          <div className="flex gap-2 max-w-[40vw] overflow-x-auto">
            <div className="flex gap-2 max-w-[40vw] overflow-x-auto">
              {Array?.isArray(currentSessionTags) &&
                currentSessionTags?.map((tag) => {
                  return (
                    <Chip
                      key={tag}
                      label={tag}
                      onClose={() => onRemoveTag(tag)}
                      maxLength={90}
                    />
                  );
                })}
            </div>
            <Chip label="Add tag" type="black" clickable onClick={openModal} />
          </div>
        </div>
        <div className="flex gap-2 justify-center items-center">
          <div className="flex gap-1 relative">
            {emailsCurrentSessionSharedWith
              ?.slice(0, 3)
              ?.map((email, index) => {
                return (
                  <InitialsImg
                    key={email}
                    style={{ right: (index + 1) * 15, zIndex: -index + 10 }}
                    className={`absolute bottom-0 -top-5 border-[1px]`}
                    character={email?.toUpperCase()?.at(0)}
                  />
                );
              })}
          </div>
          <button onClick={() => setSelectedSessionToShare(sessionId)}>
            <img
              src={isWhite ? BlackShareIcon : ShareIcon}
              alt="share-chat-icon"
              className="w-[24px] h-[24px]"
            />
          </button>
        </div>
      </div>
      {isDuplicateTagModalOpen && (
        <SingleTextAndButtonModal
          content={DUPLICATE_MESSAGE}
          buttonLabel="Got it"
          onClick={() => setIsDuplicateTagModalOpen(false)}
          heading="Duplicate Tag"
          isOpen={isDuplicateTagModalOpen}
          onClose={() => setIsDuplicateTagModalOpen(false)}
        />
      )}
      {isTagLimitModalOpen && (
        <SingleTextAndButtonModal
          content={TAGS_LIMIT_EXCEED_MESSAGE}
          buttonLabel="Got it"
          onClick={() => setIsTagLimitModalOpen(false)}
          heading="Tag Limit Exceeded"
          isOpen={isTagLimitModalOpen}
          onClose={() => setIsTagLimitModalOpen(false)}
        />
      )}
      {!!selectedSessionToShare && (
        <ShareChatModal
          {...{
            sessionId,
            selectedSessionToShare,
            setSelectedSessionToShare,
            setEmailsCurrentSessionSharedWith,
          }}
        />
      )}
      {isSessionTagModalOpen && (
        <SessionTagsModal
          {...{
            onUpdateSessionTags,
            isSessionTagModalOpen,
            setIsSessionTagModal,
            setCurrentSessionTags,
            currentSessionTags,
            isUpdatingSessionTags,
          }}
        />
      )}
    </>
  );
};

ChatHeader.propTypes = {
  sessionId: PropTypes.string,
  isShowMyResponses: PropTypes.bool,
  setSessionData: PropTypes.func,
  setIsShowMyResponses: PropTypes.func,
  allEmailsAndTagsOfCurrentSessionSharedWith: PropTypes.object,
};

export default ChatHeader;
