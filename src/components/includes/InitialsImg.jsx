import React from "react";
import PropTypes from "prop-types";

import { getRandomHexColor } from "../../utils/utils";

//TODO: need to fix this same color issue
let BG_COLOR;
const InitialsImg = React.memo(({ character, className, style }) => {
  if (!BG_COLOR) {
    BG_COLOR = getRandomHexColor();
  }

  return (
    <div
      style={{ backgroundColor: BG_COLOR, ...style }}
      className={`${className} border-black rounded-full h-[38px] w-[38px] flex justify-center items-center`}
    >
      <p className="text-white">{character}</p>
    </div>
  );
});

InitialsImg.propTypes = {
  character: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default InitialsImg;
