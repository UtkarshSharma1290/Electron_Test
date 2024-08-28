import React from "react";
import PropTypes from "prop-types";

const LabelWithValue = ({ label, value, onChange, disabled = true }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="dark:text-white text-[16px]">{label}</p>
      <div className="px-[14px] py-[16px] bottom-[8px] bg-GreyThemeBG dark:bg-blackBG rounded-lg w-full border-[1px] bottom-white">
        <input
          {...{ value, onChange, disabled }}
          className={`${
            disabled ? "no-select" : ""
          } text-[#1F1F1F99] dark:text-white text-[14px] font-normal bg-transparent w-full outline-none`}
        />
      </div>
    </div>
  );
};

LabelWithValue.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default LabelWithValue;
