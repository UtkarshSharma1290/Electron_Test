import React from "react";
import PropTypes from "prop-types";

import UpArrow from "../../assets/svg/up-arrow.svg";

const ArrowsBar = ({
  content,
  className,
  onUpArrowClick,
  onDownArrowClick,
  isUpArrowDisabled,
  isDownArrowDisabled,
}) => {
  return (
    <div
      className={`${className} flex justify-center items-center gap-[18px] border-[1px] dark:border-[0px] bg-white dark:bg-primaryBG rounded-md py-2 px-6 max-w-[760px]`}
    >
      <button
        onClick={onUpArrowClick}
        disabled={isUpArrowDisabled}
        className="disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <img src={UpArrow} alt="up-arrow" />
      </button>
      <p className="font-medium text-[16px] dark:text-white">{content}</p>
      <button
        onClick={onDownArrowClick}
        disabled={isDownArrowDisabled}
        className="disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <img src={UpArrow} alt="down-arrow" className="rotate-180" />
      </button>
    </div>
  );
};

ArrowsBar.propTypes = {
  content: PropTypes.string,
  className: PropTypes.string,
  onUpArrowClick: PropTypes.func,
  onDownArrowClick: PropTypes.func,
  isUpArrowDisabled: PropTypes.bool,
  isDownArrowDisabled: PropTypes.bool,
};

export default ArrowsBar;
