import React, { useContext } from "react";
import PropTypes from "prop-types";

import GreyUserIcon from "../../assets/svg/Grey-Person.svg";
import GreyMic from "../../assets/svg/grey-mic.svg";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { MicChatIcons, UserChatIcons } from "../../assets/svgIcon";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { markDownTextEdit, removeCollins } from "../../utils/utils";
import { LIGHT } from "../../constant/const";

const ChatPromptAndResponse = ({ chat }) => {
  //contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  return (
    <>
      {chat.icon === "recordingIcon" ? (
        <div className="w-full flex justify-start items-end gap-3">
          <div className="w-10 h-10">
            {isWhite ? (
              <div className="rounded-full p-1 bg-GrayText flex justify-center items-center h-[30px] w-[30px]">
                <img src={GreyMic} alt="user-icon" />
              </div>
            ) : (
              <MicChatIcons />
            )}
          </div>
          <MarkdownPreview
            className="no-select !text-black dark:!text-white p-4 rounded-lg w-full font-medium font-DMsans text-[14px] md:text-base"
            style={{
              background: "red !important",
            }}
            source={chat?.chatPrompt}
            rehypeRewrite={markDownTextEdit}
            wrapperElement={{
              "data-color-mode": theme?.theme,
            }}
          />
        </div>
      ) : (
        <div className="w-full flex justify-start items-end gap-3">
          <div className="w-10 h-10">
            {isWhite ? (
              <div className="rounded-full p-1 bg-GrayText flex justify-center items-center h-[30px] w-[30px]">
                <img
                  src={GreyUserIcon}
                  alt="user-icon"
                  className="max-h-[30px] max-w-[30px]"
                />
              </div>
            ) : (
              <UserChatIcons />
            )}
          </div>
          <MarkdownPreview
            style={{ background: isWhite ? "transparent" : "black" }}
            source={removeCollins(chat?.chatPrompt)}
            className="no-select !font-medium !text-black dark:!text-white shadow-custom-first rounded-custom-radius p-4  text-[14px] md:text-base"
            rehypeRewrite={markDownTextEdit}
            wrapperElement={{
              "data-color-mode": theme?.theme,
            }}
          />
        </div>
      )}
    </>
  );
};

ChatPromptAndResponse.propTypes = {
  chat: PropTypes.object,
};

export default ChatPromptAndResponse;
