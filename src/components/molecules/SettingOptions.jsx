import React from "react";
import PropTypes from "prop-types";

const SettingOptions = ({ label, onClick, isSelected }) => {
  return (
    <li
      className={`w-full cursor-pointer font-medium text-base py-3 rounded-xl md:text-left text-center md:ps-4 ps-0 flex items-center md:justify-start justify-center ${
        isSelected
          ? "border-xl bg-GrayText dark:bg-white font-medium dark:text-blackBG"
          : "dark:text-white"
      }`}
    >
      <a {...{ onClick }}>{label}</a>
    </li>
  );
};

SettingOptions.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
};

export default SettingOptions;
