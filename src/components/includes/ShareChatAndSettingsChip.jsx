import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import BodyText from "../molecules/BodyText";


import BlackSettings from "../../assets/svg/black-settings.svg";
import { SHARED_SESSION } from "../../constant/routesNames";
import { LIGHT, MAX_COUNT_OF_SHARED_CHAT_TO_SHOW } from "../../constant/const";
import { SettingIcons } from "../../assets/svgIcon";
import { ThemeContext } from "../../context/Theme/ThemeContext";

const ShareChatAndSettingsChip = ({
  allChatsSharedWithTheUser,
  setShowModal,
}) => {
  //react-hooks
  const navigate = useNavigate();

  //context
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  return (
    <>
      <button
        className={`
        flex 
        justify-between 
        items-center 
        w-full 
        p-3 
        bg-lightWhiteBG 
        dark:bg-[#1F1F1F] 
        rounded-lg
    `}
        onClick={() => navigate(SHARED_SESSION)}
      >
        <p className="dark:text-white text-[14px] md:text-[16px] dark:font-medium">
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
        <BodyText text="Settings" textColor="dark:text-white !text-[14px] md:!text-[16px]" />
        {isWhite ? (
          <img src={BlackSettings} alt="setting-icon" />
        ) : (
          <SettingIcons />
        )}
      </button>
    </>
  );
};

export default ShareChatAndSettingsChip;
