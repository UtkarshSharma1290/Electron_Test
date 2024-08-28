import React from "react";
import parse from "html-react-parser";

const SearchedChatsChips = ({ title, content, onClick, isSelected }) => {
  const startIndex = content?.indexOf("<span");
  const trimmedContent = content?.slice(startIndex);

  return (
    <button
      className={`flex flex-col gap-2 px-4 hover:bg-white dark:hover:bg-[#FFFFFF1F] text-start py-2 ${
        isSelected ? "bg-white dark:bg-[#FFFFFF1F]" : ""
      }`}
      {...{ onClick }}
    >
      <p
        className="text-[14px] font-medium text-black dark:text-[#EAECF0] truncate max-w-[90%]"
        id="highlighted-para-1"
      >
        {parse(title)}
      </p>
      {!!trimmedContent && (
        <p
          className="ellipsis-2-lines text-[10px] font-medium dark:text-[#FFFFFF99]"
          id="highlighted-para-2"
        >
          {parse(content)}
        </p>
      )}
    </button>
  );
};

export default SearchedChatsChips;
