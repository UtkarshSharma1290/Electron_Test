import React, { useContext } from "react";
import PropTypes from "prop-types";

import { ThemeContext } from "../../context/Theme/ThemeContext";
import Cross from "../../assets/svg/white-cross.svg";
import BlackCross from "../../assets/svg/cross.svg";
import AddIcon from "../../assets/svg/add-white.svg";
import BlackAddIcon from "../../assets/svg/black-add.svg";
import { LIGHT } from "../../constant/const";

const Chip = ({
  label,
  onClose,
  type = "blue",
  maxLength,
  clickable,
  onClick,
  isDisableIcon,
  isCrossIcon,
  isAlignReverse,
}) => {
  const isBlackType = type === "black";

  //contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  //functions
  const getIcon = () => {
    if (isBlackType && !isCrossIcon) {
      if (isWhite) {
        return BlackAddIcon;
      }
      return AddIcon;
    }

    if (!isBlackType) {
      return Cross;
    }

    if (isWhite) {
      return BlackCross;
    }
    return Cross;
  };

  return (
    <button
      type="button"
      className={`
        flex
        justify-center
        items-center 
        gap-1 
        px-[12px] 
        py-[4px] 
        rounded-[100px] 
        border-[1px]
        ${
          isBlackType
            ? `${
                isAlignReverse ? "flex-row" : "flex-row-reverse"
              } bg-gray-200 dark:opacity-100 dark:bg-black border-black dark:border-white`
            : "bg-PrimaryBlue border-transparent"
        } 
        ${clickable ? "cursor-pointer" : "cursor-default"}`}
      onClick={clickable ? onClick : () => {}}
    >
      <p
        style={{ maxWidth: `${maxLength ? maxLength + "px" : "100%"}` }}
        className={`text-[12px] font-medium opacity-100 ${
          isBlackType ? "dark:text-white" : "text-white"
        } truncate w-full max-w-full text-start`}
      >
        {label}
      </p>
      {!isDisableIcon && (
        <button
          onClick={onClose}
          className="flex justify-center items-center min-h-[12px] min-w-[12px]"
        >
          <img
            src={getIcon()}
            alt="cross-icon"
            className="min-h-[12px] max-h-[12px]"
          />
        </button>
      )}
    </button>
  );
};

Chip.propTypes = {
  label: PropTypes.string,
  onClose: PropTypes.func,
  type: PropTypes.string,
  maxLength: PropTypes.number,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  isDisableIcon: PropTypes.bool,
  isCrossIcon: PropTypes.bool,
  isAlignReverse: PropTypes.bool,
};

export default Chip;
