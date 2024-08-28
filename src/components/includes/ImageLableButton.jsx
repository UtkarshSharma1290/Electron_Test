import React from "react";
import PropTypes from "prop-types";

import InitialsImg from "./InitialsImg";

const ImageLabelButton = ({ label, img, onClick, buttonLabel, disabled }) => {
  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex gap-2 justify-center items-center">
        <div>
          {!!img && (
            <img src={img} alt="user-img" className="w-[38px] h-[38px]" />
          )}
          {!img && <InitialsImg character={label?.toUpperCase()?.at(0)} />}
        </div>
        <p className="text-[20px] dark:text-white">{label}</p>
      </div>
      <button
        {...{ onClick, disabled }}
        className="text-GreyText dark:text-Red1 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {buttonLabel}
      </button>
    </div>
  );
};

ImageLabelButton.propTypes = {
  label: PropTypes.string,
  img: PropTypes.string,
  onClick: PropTypes.func,
  buttonLabel: PropTypes.string,
  disabled: PropTypes.bool,
};

export default ImageLabelButton;
