import React, { useContext } from "react";

import BlueLogo from "../../assets/svg/blue-logo.svg";
import SearchBar from "../../components/molecules/SearchBar";
import WhiteChatIcon from "../../assets/svg/white-chat.svg";
import BlackChatIcon from "../../assets/svg/black-chat-icon.svg";
import SidebarIcon from "../../assets/svg/sidebar-icon.svg";
import SidebarBlackIcon from "../../assets/svg/sidebar-black-icon.svg";
import { LogoAIInterviewer } from "../../assets/svgIcon";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import Button from "../molecules/Button";
import { LIGHT } from "../../constant/const";

const SidebarTopSection = ({
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
}) => {
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  return (
    <div className="w-full flex flex-col gap-4 p-4">
      <div className="flex justify-between">
        {!isWhite ? (
          <LogoAIInterviewer />
        ) : (
          <img src={BlueLogo} alt="blue-logo" className="w-[72px] h-[72px]" />
        )}
        <button
          onClick={() => setIsSidebarVisible(false)}
          className="flex items-start pt-5"
        >
          <img
            src={isWhite ? SidebarBlackIcon : SidebarIcon}
            alt="sidebar"
            className="w-[24px] h-[24px] opacity-70"
          />
        </button>
      </div>
      <Button
        onClick={newThread}
        disabled={isApiResponseLoading || openMic}
        label="New Chat"
        icon={isWhite ? WhiteChatIcon : BlackChatIcon}
      />
      <SearchBar
        {...{
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
        }}
        value={userSearch}
        onChange={onUserSearchHandler}
      />
    </div>
  );
};

export default SidebarTopSection;
