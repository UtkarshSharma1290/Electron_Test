import React, { useContext } from "react";
import PropTypes from "prop-types";

import BodyText from "../../components/molecules/BodyText";

import NeonPlayButton from "../../assets/svg/Neon-Play-Button.svg";
import Play from "../../assets/svg/Play.svg";
import PlayWhite from "../../assets/svg/Play-white.svg";
import Pause from "../../assets/svg/Pause.svg";
import PauseWhite from "../../assets/svg/Pause-white.svg";
import MicIcons from "../../assets/img/MicIcons.png";
import { MicStopIcons } from "../../assets/svgIcon";
import { formatTime } from "../../utils/utils";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { LIGHT } from "../../constant/const";

const AutoMaticMicrophoneButton = ({
  minutes,
  seconds,
  openMic,
  handleRecording,
  isPause,
  onTogglePauseRecording,
}) => {
  //context
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  return (
    <div
      className={`
        ${openMic ? "bg-black min-w-[184px]" : "bg-Neon"} 
        dark:bg-white 
        rounded-xl 
        min-h-[48px] 
        md:min-h-[64px]
        flex 
        justify-between 
        items-center 
        px-3  
        ${!openMic ? "" : "max-w-[248px] w-full"}`}
    >
      {!openMic ? (
        <button onClick={(e) => handleRecording(e, true)}>
          <img
            src={MicIcons}
            alt="MicIcons"
            className="min-w-[25px] w-[25px] h-[25px]"
          />
        </button>
      ) : (
        <div className="flex justify-between items-center gap-2 p-1 w-full">
          <BodyText
            text={`${formatTime(minutes)} : ${formatTime(seconds)}`}
            textColor="dark:text-blackBG text-white"
            additionalClass="!font-medium font-DMSans max-w-[100px] min-w-[60px] w-full text-center"
          />
          <button onClick={onTogglePauseRecording}>
            {isPause ? (
              <img
                src={isWhite ? PlayWhite : Play}
                alt="play-icon"
                className="min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px]"
              />
            ) : (
              <img
                src={isWhite ? PauseWhite : Pause}
                alt="play-icon"
                className="min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px]"
              />
            )}
          </button>
          <button onClick={(e) => handleRecording(e, false)}>
            {isWhite ? (
              <img
                src={NeonPlayButton}
                alt="play-button-icon"
                className="min-w-[44px] min-h-[44px] max-w-[44px] max-h-[44px]"
              />
            ) : (
              <span className="w-full">
                <MicStopIcons />
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

AutoMaticMicrophoneButton.propTypes = {
  minutes: PropTypes.number,
  seconds: PropTypes.number,
  isWhite: PropTypes.bool,
  openMic: PropTypes.bool,
  handleRecording: PropTypes.func,
  isPause: PropTypes.bool,
  onTogglePauseRecording: PropTypes.func,
};

export default AutoMaticMicrophoneButton;
