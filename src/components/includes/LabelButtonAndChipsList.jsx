import React from "react";
import { toast } from "react-toastify";
import NewSessionTab from "../molecules/NewSessionTab";
import Chip from "../molecules/Chip";

const LabelButtonAndChipsList = ({
  data,
  icon,
  tagsList,
  currentSelectedThread,
  label,
  getThread,
  onRename,
  onDelete,
  onArchive,
  onRemoveAppliedFilterTags,
  onIconClick,
  stringToCheck,
}) => {
  return (
    <>
      {!!data?.length && (
        <>
          <div className="flex justify-between items-center pr-1">
            <p className="text-xs dark:text-[#FFFFFFCC] font-DMSans ps-4">
              {label}
            </p>
            {!!icon && (
              <button onClick={onIconClick}>
                <img src={icon} alt="filter-icon" />
              </button>
            )}
          </div>
          {!!tagsList?.length && (
            <div className="p-2 flex overflow-x-auto max-h-[8vh] gap-2">
              {tagsList?.map((tag) => {
                return (
                  <Chip
                    isAlignReverse
                    key={tag}
                    label={tag}
                    type="black"
                    isCrossIcon
                    clickable
                    maxLength={90}
                    onClick={() => onRemoveAppliedFilterTags(tag)}
                  />
                );
              })}
            </div>
          )}
          {data?.map((session, index) => {
            const sessionId = session?.session || session?.session_id;
            return (
              session.date_message == stringToCheck && (
                <NewSessionTab
                  key={index}
                  isSelected={currentSelectedThread === sessionId}
                  isHideOption={currentSelectedThread !== sessionId}
                  label={session?.title}
                  {...{ getThread, toast }}
                  onRename={() => onRename(sessionId)}
                  onDelete={() => onDelete(sessionId)}
                  onArchive={() => onArchive(sessionId)}
                  tags={session?.tag}
                  sessionId={sessionId}
                />
              )
            );
          })}
        </>
      )}
    </>
  );
};

export default LabelButtonAndChipsList;
