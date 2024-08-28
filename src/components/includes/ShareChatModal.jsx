import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

import CustomLoader from "../molecules/customLoader";
import ImageLabelButton from "./ImageLableButton";
import InputWithButton from "../molecules/InputWithButton";
import Modal from "../includes/Modal";

import useShareChatApi from "../../hooks/useShareChatApi";
import { delay, validateEmail } from "../../utils/utils";
import ShareEmailSuccess from "../../assets/gifs/check-gif.gif";
import ShareIcon from "../../assets/svg/Share-icon.svg";
import BlackShareIcon from "../../assets/svg/black-ariplane-icon.svg";
import useUnShareSessionApi from "../../hooks/useUnShareSessionApi";
import useFetchSessionChatsApi from "../../hooks/useFetchSessionChatsApi";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { LIGHT } from "../../constant/const";

const ShareChatModal = ({
  selectedSessionToShare,
  setSelectedSessionToShare,
  sessionId,
  setEmailsCurrentSessionSharedWith,
}) => {
  //states
  const [emailToShare, setEmailToShare] = useState("");
  const [isChatSharedSuccessfully, setIsChatSharedSuccessfully] =
    useState(false);

  //custom-hooks
  const { shareChatHandler, isLoading: isSharingChat } = useShareChatApi();
  const { unShareSession, isLoading: isRemovingSharedEmailAccess } =
    useUnShareSessionApi();
  const {
    fetchSessionChats,
    data: allCurrentChatData,
    isLoading: isGettingAlreadySharedPersonsEmail,
  } = useFetchSessionChatsApi();

  // contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  //functions
  const getCurrentChatData = () => {
    fetchSessionChats({
      sessionId,
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
      onSuccessCallback: (message) => {
        toast?.success(message);
      },
    });
  };

  const onShareChatHandler = (e) => {
    e?.preventDefault();
    shareChatHandler({
      sessionId: selectedSessionToShare,
      emailToShare,
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
      onSuccessCallback: async () => {
        setIsChatSharedSuccessfully(true);
        setEmailsCurrentSessionSharedWith((prev) => {
          return [...(prev || []), emailToShare];
        });
        await delay(3000);
        setSelectedSessionToShare("");
      },
    });
  };

  const onUnShareSessionHandler = (emailOfPersonSharedTheEmailWith) => {
    unShareSession({
      sessionId,
      email: emailOfPersonSharedTheEmailWith,
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
      onSuccessCallback: (message) => {
        getCurrentChatData();
        setEmailsCurrentSessionSharedWith((prev) => {
          const filteredEmails = prev?.filter(
            (email) => email !== emailOfPersonSharedTheEmailWith
          );
          return filteredEmails;
        });
      },
    });
  };

  //useEffects
  useEffect(() => {
    getCurrentChatData();
  }, []);
  
  return (
    <Modal
      isModalOpen={!!selectedSessionToShare}
      onClose={() => setSelectedSessionToShare("")}
      heading={isChatSharedSuccessfully ? "" : "Share Chat"}
    >
      {!isChatSharedSuccessfully && (
        <>
          <form
            onSubmit={onShareChatHandler}
            className="flex flex-col justify-center items-center gap-4 w-full p-[24px] pb-0"
          >
            <div className="w-full">
              <p className="dark:text-white">Share this chat with</p>
            </div>
            <InputWithButton
              placeholder="Enter email"
              buttonLabel={isSharingChat ? "Sharing..." : "Share"}
              onChange={(e) => setEmailToShare(e?.target.value?.trim())}
              value={emailToShare}
              disabledBtn={
                !validateEmail(emailToShare) ||
                isSharingChat ||
                isRemovingSharedEmailAccess
              }
              buttonIcon={isWhite ? ShareIcon : BlackShareIcon}
            />
          </form>
          <div className="w-full p-[24px] max-h-[220px]">
            {!isGettingAlreadySharedPersonsEmail &&
              !!allCurrentChatData?.shared_to?.length && (
                <>
                  <div className="w-full flex justify-start items-center">
                    <p className="dark:text-white">
                      People you have already shared this chat with
                    </p>
                  </div>
                  <div className="h-full overflow-y-auto">
                    <div className="flex flex-col justify-center gap-4 items-center py-4 ">
                      {allCurrentChatData?.shared_to?.map((item) => {
                        return (
                          <ImageLabelButton
                            key={item}
                            disabled={isRemovingSharedEmailAccess}
                            label={item}
                            onClick={() => onUnShareSessionHandler(item)}
                            buttonLabel="Remove Access"
                          />
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            {isGettingAlreadySharedPersonsEmail && (
              <div className="p-2 w-full flex justify-center items-center">
                <CustomLoader />
              </div>
            )}
          </div>
        </>
      )}
      {isChatSharedSuccessfully && (
        <div className="p-[36px]">
          <img
            src={ShareEmailSuccess}
            alt="share-email-success-icon"
            className="w-[222px] h-[222px]"
          />
          <p className="dark:text-white">This Chat has been shared</p>
        </div>
      )}
    </Modal>
  );
};

ShareChatModal.propTypes = {
  selectedSessionToShare: PropTypes.string,
  setSelectedSessionToShare: PropTypes.func,
  sessionId: PropTypes.string,
  setEmailsCurrentSessionSharedWith: PropTypes.func,
};

export default ShareChatModal;
