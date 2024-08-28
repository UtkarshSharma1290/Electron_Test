import React from "react";

import SessionChip from "./SessionChip";

const ListWithTitle = ({ title, data, onClick, selectedItemId }) => {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] text-black dark:text-[#FFFFFFCC] font-normal">{title}</p>
      <div className="flex flex-col gap-3">
        {data?.map((item, index) => {
          return (
            <button
              onClick={() => onClick(item)}
              key={item?.id}
              className="flex flex-col gap-1"
            >
              <SessionChip
                title={item?.session_title}
                sessionId={item?.session_id}
                isHideOption
                isSelected={item?.id === selectedItemId}
              />
              {item?.id === selectedItemId && (
                <p className="text-[10px] text-black dark:text-GrayText truncate max-w-[90%]">
                  {item?.shared_by
                    ? `Shared By ${item?.shared_by}`
                    : `Shared to ${item?.shared_to}`}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ListWithTitle;
