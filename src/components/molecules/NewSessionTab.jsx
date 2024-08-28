import React, { useState } from "react";
import PropTypes from "prop-types";

import Chip from "./Chip";
import SessionDotMenu from "../includes/SessionDotMenu";
import { NO_SESSION_TITLE } from "../../constant/const";

const NewSessionTab = ({
  tags,
  label,
  getThread,
  onArchive,
  onDelete,
  onRename,
  sessionId,
  isHideOption,
  isSelected = true,
}) => {
  //states
  const [isDotMenuOpen, setIsDotMenuOpen] = useState(false);

  const are3Tags = tags?.length === 3;

  return (
    <div
      className={`
      flex
      items-center
      justify-between 
      w-full
      gap-[16px] 
      py-4 
      pr-3
      px-4 
      ${isSelected ? "bg-[#FCFCFD] dark:bg-[#FFFFFF1F]" : "dark:bg-transparent"}
      dark:hover:bg-[#FFFFFF1F]
    `}
    >
      <div
        className={`flex flex-col gap-2 ${!isSelected ? "w-[95%]" : "w-[80%]"}`}
      >
        <button
          onClick={(e) => getThread?.(sessionId)}
          className="w-full justify-start"
        >
          <p
            className={`text-[12px] md:text-[14px] font-medium dark:text-white truncate w-[100%] text-start`}
          >
            {label || NO_SESSION_TITLE}
          </p>
        </button>
        {!!tags?.length && (
          <div className="flex gap-2 min-h-[20px]">
            {tags?.slice(0, 2)?.map((tag) => {
              return (
                <Chip
                  key={tag}
                  label={tag}
                  type="black"
                  maxLength={40}
                  isDisableIcon
                />
              );
            })}
            {are3Tags && <Chip label="+1" type="black" isDisableIcon />}
          </div>
        )}
      </div>
      {!isHideOption && (
        <SessionDotMenu
          onMenuClick={() => setIsDotMenuOpen((prev) => !prev)}
          {...{
            isDotMenuOpen,
            onArchive,
            onDelete,
            setIsDotMenuOpen,
            onRename,
          }}
        />
      )}
    </div>
  );
};

NewSessionTab.propTypes = {
  tags: PropTypes.array,
  label: PropTypes.string,
  getThread: PropTypes.func,
  onArchive: PropTypes.func,
  onDelete: PropTypes.func,
  onRename: PropTypes.func,
  sessionId: PropTypes.string,
  isHideOption: PropTypes.bool,
  isSelected: PropTypes.bool,
};

export default NewSessionTab;
