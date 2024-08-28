import React from "react";

import BodyText from "../../components/molecules/BodyText";

import WhiteWaveIcon from "../../assets/svg/white-wave-icon.svg";
import MicIcons from "../../assets/img/MicIcons.png";
import NeonPlayButton from "../../assets/svg/Neon-Play-Button.svg";
import { MicStopIcons, SoundWaveIcons } from "../../assets/svgIcon";
import { formatTime } from "../../utils/utils";

const ManualMicrophoneButton = ({
  minutes,
  seconds,
  isWhite,
  openMic,
  handleRecording,
}) => {
  return (
    <button
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
      onClick={(e) => handleRecording(e)}
    >
      {!openMic ? (
        <img
          src={MicIcons}
          alt="MicIcons"
          className="w-[20px] h-[20px] md:w-[25px] md:h-[25px]"
        />
      ) : (
        <div className="flex justify-between items-center gap-2 p-1 w-full">
          <BodyText
            text={`${formatTime(minutes)} : ${formatTime(seconds)}`}
            textColor="dark:text-blackBG text-white w-[70px]"
            additionalClass="!font-medium font-DMSans max-w-[100px] min-w-[60px] w-full"
          />
          {isWhite ? (
            <img
              src={WhiteWaveIcon}
              alt="wave-icon"
              className="w-[54px] h-[20px]"
            />
          ) : (
            <span className="w-full">
              <SoundWaveIcons />
            </span>
          )}
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
        </div>
      )}
    </button>
  );
};

export default ManualMicrophoneButton;
