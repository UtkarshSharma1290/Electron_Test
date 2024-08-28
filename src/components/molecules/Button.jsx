import React from "react";
import PropTypes from "prop-types";

const Button = ({ label, onClick, disabled, icon, className }) => {
  return (
    <button
      {...{ onClick, disabled }}
      className={`
        ${className}
        bg-black dark:bg-Neon text-white dark:text-black 
        text-[14px]
        md:text-[16px]
        px-[16px] 
        py-[12px]
        w-full 
        flex 
        justify-between 
        items-center 
        gap-[10px] 
        rounded 
        self-end 
        cursor-pointer 
        disabled:opacity-80 
        disabled:cursor-not-allowed
        font-medium
      `}
    >
      {label}
      {icon && (
        <img src={icon} alt="button-icon" className="w-[16px] h-[16px]" />
      )}
    </button>
  );
};

Button.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  className: PropTypes.string,
};

export default Button;
