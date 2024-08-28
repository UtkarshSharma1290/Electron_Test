import React from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

import Chip from "../molecules/Chip";
import ChatsIcon from "../../assets/svg/chats-icon.svg";
import CustomLoader from "../molecules/customLoader";

const SearchSuggestionsBox = ({
  searchedResultTags,
  searchQueryHandler,
  setSearchResultTags,
  setUserSearchResultTotalPageCount,
  setSelectedTags,
  setIsSuggestionModalOpen,
  setUserSearchResult,
  onChatSearchHandler,
  userSearch,
  isSearchingInChats,
  setChatsSearchPage,
}) => {
  const onClickTag = (tagStr) => {
    setChatsSearchPage(1);
    searchQueryHandler({
      query: tagStr,
      onErrorCallback: () => {
        toast?.error("Something went wrong!");
      },
      onSuccessCallback: (data) => {
        setSearchResultTags(null);
        setSelectedTags?.([tagStr]);
        setIsSuggestionModalOpen(false);
        setUserSearchResult(data?.data);
        setUserSearchResultTotalPageCount(data?.total);
      },
    });
  };

  return (
    <div className="w-full flex-col gap-4 pt-4">
      <button
        className="flex gap-1 w-full justify-start items-center px-4"
        disabled={isSearchingInChats}
        onClick={onChatSearchHandler}
      >
        {!isSearchingInChats && (
          <>
            <img src={ChatsIcon} alt="chat-icon" />
            <div className="text-[14px] font-normal w-full flex justify-start items-center">
              <p className="font-bold mr-1 truncate max-w-[50%] text-white">
                {userSearch}
              </p>
              <p className="text-white">in all chats</p>
            </div>
          </>
        )}
        {isSearchingInChats && (
          <span className="w-full flex justify-center items-center">
            <CustomLoader small />
          </span>
        )}
      </button>
      <div className="w-full">
        <p className="text-GreyText text-[12px] pl-4 pt-4">Tags:</p>
        <div className="flex flex-wrap gap-2 w-full h-[120px] overflow-y-auto p-4 items-start">
          {!!searchedResultTags?.length &&
            searchedResultTags?.map((tag) => {
              return (
                <Chip
                  key={tag}
                  label={tag}
                  clickable
                  isDisableIcon
                  type="blue"
                  onClick={() => onClickTag(tag)}
                  maxLength={90}
                />
              );
            })}
          {!searchedResultTags?.length && (
            <div className="flex justify-center items-center w-full min-h-[40px]">
              <p className="text-white text-[12px]">No tags found!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

SearchSuggestionsBox.propTypes = {
  searchedResultTags: PropTypes.array,
  searchQueryHandler: PropTypes.func,
  setSearchResultTags: PropTypes.func,
  setUserSearchResultTotalPageCount: PropTypes.func,
  setSelectedTags: PropTypes.func,
  setIsSuggestionModalOpen: PropTypes.func,
  setUserSearchResult: PropTypes.func,
};

export default SearchSuggestionsBox;
