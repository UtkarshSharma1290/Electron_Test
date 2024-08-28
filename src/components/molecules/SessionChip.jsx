import { useState } from "react";
import PropTypes from "prop-types";

import SessionDotMenu from "../includes/SessionDotMenu";

const SessionChip = ({
  getThread,
  onArchive,
  onDelete,
  onRename,
  title,
  sessionId,
  isHideOption,
  isSelected = true,
}) => {
  const [isDotMenuOpen, setIsDotMenuOpen] = useState(false);

  return (
    <div
      className={`flex gap-1 justify-center items-center p-2 ${
        isSelected ? "bg-[#F9FAFB] dark:bg-[#414141]" : ""
      } w-full rounded-md`}
    >
      <button
        type="button"
        onClick={(e) => getThread?.(sessionId)}
        className="text-sm font-medium rounded-md w-[90%] flex justify-start items-center gap-1"
      >
        <p className="truncate text-black dark:text-white">{title}</p>
      </button>
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

SessionChip.propTypes = {
  getThread: PropTypes.func,
  onArchive: PropTypes.func,
  onDelete: PropTypes.func,
  onShareChat: PropTypes.func,
  title: PropTypes.string,
  sessionId: PropTypes.string,
  isHideOption: PropTypes.bool,
};

export default SessionChip;
