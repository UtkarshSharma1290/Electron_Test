import React, { useContext } from "react";
import PropTypes from "prop-types";
import MarkdownPreview from "@uiw/react-markdown-preview";

import CircularIcon from "../molecules/CircularIcon";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { LIGHT } from "../../constant/const";
import { markDownTextEdit } from "../../utils/utils";

const IconWithText = ({
  icon,
  text,
  isReverse,
  IconContainerClassName,
  classNameIcon,
  className,
  isDownIcon,
}) => {
  //contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  return (
    <div
      className={`flex ${
        isReverse ? "flex-row-reverse" : ""
      } gap-3 p-2 justify-start ${
        isDownIcon ? "items-end" : "items-start"
      } w-full`}
    >
      <CircularIcon
        {...{ icon }}
        classNameContainer={IconContainerClassName}
        {...{ classNameIcon }}
      />
      <div
        className={`${className} overflow-x-auto max-w-[50vw] xl:max-w-[65vw]`}
      >
        <MarkdownPreview
          style={{
            background: isWhite ? "transparent" : "transparent",
          }}
          source={text}
          className="no-select !font-medium !text-black dark:!text-white shadow-custom-first rounded-custom-radius p-2 max-w-full text-[14px] md:text-base"
          rehypeRewrite={markDownTextEdit}
          wrapperElement={{
            "data-color-mode": theme?.theme,
          }}
        />
      </div>
    </div>
  );
};

IconWithText.propTypes = {
  icon: PropTypes.string,
  text: PropTypes.string,
  classNameIcon: PropTypes.string,
  isReverse: PropTypes.bool,
  IconContainerClassName: PropTypes.string,
  className: PropTypes.string,
  isDownIcon: PropTypes.bool,
};

export default IconWithText;
