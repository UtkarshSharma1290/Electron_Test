import React from "react";
import PropTypes from "prop-types";

import GreenTick from "../../assets/svg/Green-Check.svg";

const ImageHeadingContent = ({
  img,
  heading,
  content,
  onClick = function () {},
  isSelected,
}) => {
  return (
    <button
      {...{ onClick }}
      className={`relative flex flex-1 flex-col gap-3 items-start justify-between bg-GrayText dark:bg-black rounded-lg p-4 border-[3px] ${
        isSelected ? "border-GreenBorder" : "border-transparent"
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2">
          <img src={GreenTick} alt="check" className="w-[24px]" />
        </div>
      )}
      <img src={img} alt="chatbot" className="w-[120px]" />
      <p className="text-[18px] font-medium dark:text-white text-start">
        {heading}
      </p>
      <p className="text-[14px] font-normal dark:text-white text-start">
        {content}
      </p>
    </button>
  );
};

ImageHeadingContent.propTypes = {
  img: PropTypes.string,
  heading: PropTypes.string,
  content: PropTypes.string,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
};

export default ImageHeadingContent;
