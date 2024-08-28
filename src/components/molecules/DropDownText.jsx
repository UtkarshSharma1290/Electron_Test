import React, { useState } from "react";

import CircularIcon from "./CircularIcon";
import PersonIcon from "../../assets/svg/person-grey.svg";

const DropDownText = ({ text }) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false);

  return (
    <div className="flex gap-3 items-end justify-between p-2">
      <div className="bg-GreyBackground px-2 w-full rounded-lg">
        <button
          className="w-full flex items-center h-full"
          onClick={() => setIsShowDropDown((prev) => !prev)}
        >
          <p className="text-[12px] opacity-80 flex justify-center items-center my-auto">
            {isShowDropDown ? "Hide" : "Show"}
          </p>
        </button>
        <div
          className={`flex transition-all duration-300 ease-in-out ${
            isShowDropDown ? "p-4" : "p-2 opacity-0 h-[0px]"
          }`}
        >
          {isShowDropDown && <p>{text}</p>}
        </div>
      </div>
      <CircularIcon
        icon={PersonIcon}
        classNameContainer="bg-Neon"
        classNameIcon="max-w-[12px] min-h-[18px]"
      />
    </div>
  );
};

export default DropDownText;
