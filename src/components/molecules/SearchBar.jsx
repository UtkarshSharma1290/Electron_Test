import React, { useContext, useState } from "react";
import PropTypes from "prop-types";

import SearchIcon from "../../assets/svg/search.svg";
import SearchSuggestionsBox from "../includes/SearchSuggestionsBox";
import GreySearchIcon from "../../assets/svg/grey-search.svg";
import WhiteCloseIcon from "../../assets/svg/white-close.svg";
import CloseIcon from "../../assets/svg/cross.svg";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { LIGHT } from "../../constant/const";
import { unHighlightText } from "../../utils/utils";

const SearchBar = ({
  setChatsSearchResultData,
  setIsShowWordSearchArrows,
  setIsShowSearchChatsResult,
  onChatsSearchHandler,
  value,
  onChange,
  searchedResultTags,
  searchQueryHandler,
  setSearchResultTags,
  setUserSearchResult,
  setUserSearchResultTotalPageCount,
  setSelectedTags,
  isSearchingInChats,
  setChatsSearchPage,
}) => {
  //states
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  //contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  //functions
  const onCancelSearchHandler = () => {
    if (!value) {
      return;
    }
    onChange({ target: { value: "" } });
    setIsSuggestionModalOpen(false);
    setIsShowSearchChatsResult(false);
    setIsShowWordSearchArrows(false);
    setChatsSearchResultData([]);
    unHighlightText(isWhite);
  };

  const onChatSearchHandler = () => {
    setIsSuggestionModalOpen(false);
    setIsShowSearchChatsResult?.(true);
    onChatsSearchHandler?.();
    setChatsSearchPage(1);
  };

  const searchByTagsHandler = (event) => {
    setIsSuggestionModalOpen(event?.target?.value?.trim()?.length > 0);
    onChange?.(event);
  };

  return (
    <div className="relative flex justify-between items-center bg-InputPlaceholderText dark:bg-black px-[12px] rounded">
      <input
        {...{ value }}
        onChange={searchByTagsHandler}
        placeholder="Search in chats/by tags"
        className="py-[12px] text-[14px] md:text-[16px] outline-none bg-InputPlaceholderText dark:bg-black text-blackBG dark:text-InputPlaceholderText w-[84%]"
      />
      <button
        className="disabled:cursor-not-allowed"
        onClick={onCancelSearchHandler}
      >
        {!value && (
          <img src={isWhite ? GreySearchIcon : SearchIcon} alt="search-icon" />
        )}
        {!!value && (
          <img src={isWhite ? CloseIcon : WhiteCloseIcon} alt="close-icon" />
        )}
      </button>
      {isSuggestionModalOpen && (
        <div className="absolute bottom-[-194px] left-0 right-0 bg-black rounded-lg flex flex-col gap-3">
          <SearchSuggestionsBox
            userSearch={value}
            {...{
              setChatsSearchPage,
              isSearchingInChats,
              onChatSearchHandler,
              searchedResultTags,
              searchQueryHandler,
              setUserSearchResult,
              setUserSearchResultTotalPageCount,
              setSearchResultTags,
              setSelectedTags,
              setIsSuggestionModalOpen,
            }}
          />
        </div>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  setChatsSearchResultData: PropTypes.func,
  setIsShowWordSearchArrows: PropTypes.func,
  setIsShowSearchChatsResult: PropTypes.func,
  onChatsSearchHandler: PropTypes.func,
  value: PropTypes.string,
  onChange: PropTypes.func,
  searchedResultTags: PropTypes.array,
  searchQueryHandler: PropTypes.func,
  setSearchResultTags: PropTypes.func,
  setUserSearchResult: PropTypes.func,
  setUserSearchResultTotalPageCount: PropTypes.func,
  setSelectedTags: PropTypes.func,
  isSearchingInChats: PropTypes.bool,
  setChatsSearchPage: PropTypes.func,
};

export default SearchBar;
