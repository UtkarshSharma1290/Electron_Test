import React from "react";

const CircularIcon = ({ icon, classNameContainer, classNameIcon }) => {
  return (
    <div
      className={`${
        classNameContainer || "bg-[#414141]"
      } rounded-full p-1 px-2 max-w-fit`}
    >
      <img
        src={icon}
        alt="icon"
        className={`${
          classNameIcon || "min-h-[20px] min-w-[15px] max-h-[20px] max-w-[15px]"
        }`}
      />
    </div>
  );
};

export default CircularIcon;
