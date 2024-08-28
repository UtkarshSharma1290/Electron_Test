import React, { useContext } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { ToastContainer } from "react-toastify";

import CrossIcon from "../../assets/svg/cross.svg";
import WhiteCrossIcon from "../../assets/svg/white-cross.svg";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { LIGHT } from "../../constant/const";

const Modal = ({
  children,
  isModalOpen,
  onClose,
  className,
  heading,
  isRemoveCrossIcon,
}) => {
  //contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  if (!isModalOpen) {
    return null;
  }

  return ReactDOM?.createPortal(
    <>
      <div
        className={`bg-[#00000080] flex flex-col p-3 justify-center items-center absolute top-0 left-0 right-0 bottom-0`}
      >
        <div
          className={`${
            className || ""
          } w-[50vw] max-w-[723px] min-w-[300px] min-h-[15vh] relative bg-white dark:bg-primaryBG flex flex-col justify-between items-center rounded-lg border-[1px] dark:border-[0px]`}
        >
          {!!heading && (
            <div
              className={`w-full flex justify-between items-center p-[24px] border-b-[1px]`}
            >
              <p className="text-[18px] md:text-[22px] font-medium dark:text-white">
                {heading}
              </p>
              {!isRemoveCrossIcon && (
                <button
                  onClick={onClose}
                  className="top-1 right-0 cursor-pointe"
                >
                  <img
                    src={isWhite ? CrossIcon : WhiteCrossIcon}
                    alt="cross-icon"
                    className="max-h-[14px] max-w-[14px] min-h-[14px] min-w-[14px] "
                  />
                </button>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </>,
    document?.getElementById("modal-container")
  );
};

Modal.propTypes = {
  children: PropTypes.node,
  isModalOpen: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
  heading: PropTypes.string,
  isRemoveCrossIcon: PropTypes.bool,
};

export default Modal;
