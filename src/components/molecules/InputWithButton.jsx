import React from "react";
import PropTypes from "prop-types";

import Button from "../molecules/Button";

const InputWithButton = ({
  placeholder,
  buttonLabel,
  onChange,
  value,
  onClick,
  disabledBtn,
  buttonIcon,
}) => {
  return (
    <div className="bg-GrayText dark:bg-blackBG flex justify-between items-center w-full p-[16px] rounded-lg">
      <input
        {...{ onChange, value, placeholder }}
        type="text"
        className="text-[14px] md:text-[18px] rounded w-[80%] outline-none text-primaryBG dark:text-InputPlaceholderText bg-GrayText dark:bg-blackBG"
      />
      <Button
        label={buttonLabel}
        {...{ onClick }}
        disabled={disabledBtn}
        icon={buttonIcon}
        className={"max-w-fit"}
      />
    </div>
  );
};

InputWithButton.propTypes = {
  placeholder: PropTypes.string,
  buttonLabel: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  onClick: PropTypes.func,
  disabledBtn: PropTypes.bool,
  buttonIcon: PropTypes.string,
};

export default InputWithButton;
