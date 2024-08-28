import React from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import PropTypes from "prop-types";

import BodyTextTitle from "../molecules/BodyTextTitle";
import SmallBodyText from "../molecules/SmallBodyText";

const UserSettingContext = ({
  activeTab,
  handlePrompts,
  setCustomInstruction,
  setCustomInstructionLimit,
  customInstruction,
  customInstructionLimit,
  apiResponse,
  customAI,
  setCustomAI,
  customAILimit,
  setCustomAILimit,
}) => {
  return (
    <div
      id="first"
      className={`w-full ${activeTab === "#first" ? "" : "hidden"}`}
    >
      <form
        className="flex flex-col justify-end items-end gap-3"
        onSubmit={handlePrompts}
      >
        <div className="flex flex-col items-start gap-3 w-full">
          <BodyTextTitle
            text="What would you like the AI Assistant to know about you to provide better responses?"
            textColor="dark:text-white"
          />
          <ReactTextareaAutosize
            className={`
              w-full 
              bg-GreyThemeBG
              dark:bg-blackBG 
              border 
              border-[#FFFFFF80] 
              p-3 
              min-h-[170px] 
              rounded-xl 
              text-primaryBG 
              dark:opacity-100 
              dark:text-white 
              text-base 
              outline-none 
              resize-none 
              placeholder:text-primaryBG 
              dark:placeholder:opacity-60 
              dark:placeholder:text-[#FFFFFFB2]
            `}
            autoFocus
            autosize
            placeholder="For example - "
            minRows={1}
            maxRows={5}
            value={customAI || ""}
            maxLength={1500}
            disabled={apiResponse}
            onChange={(e) => {
              setCustomAI(e.target.value);
              setCustomInstructionLimit(e.target.value.length);
            }}
            cacheMeasurements
          />
          <SmallBodyText
            text={
              customInstructionLimit === 1500
                ? "Only 1500 char allowed"
                : `${customInstructionLimit}/1500`
            }
            textColor={
              customInstructionLimit === 1500
                ? "!text-red-500 font-semibold"
                : "!text-[#FFFFFF99]"
            }
          />
        </div>
        <div className="flex flex-col items-start gap-3 w-full">
          <BodyTextTitle
            text="How would you like the AI Assistant to respond?"
            textColor="dark:text-white"
          />
          <ReactTextareaAutosize
            className={`
              w-full 
              bg-GreyThemeBG
              dark:bg-blackBG 
              border 
              border-[#FFFFFF80] 
              p-3 
              min-h-[170px] 
              rounded-xl 
              text-primaryBG 
              dark:opacity-100 
              dark:text-white 
              text-base 
              outline-none 
              resize-none 
              placeholder:text-primaryBG 
              dark:placeholder:opacity-60 
              dark:placeholder:text-[#FFFFFFB2]
            `}
            autoFocus
            autosize
            placeholder="For example - Formally "
            minRows={1}
            maxRows={5}
            disabled={apiResponse}
            value={customInstruction}
            cacheMeasurements
            maxLength={1500}
            onChange={(e) => {
              setCustomInstruction(e.target.value);
              setCustomAILimit(e.target.value.length);
            }}
          />
          {/* set text color to red if limit crosses 1500 */}
          <SmallBodyText
            text={
              customAILimit === 1500
                ? "Only 1500 char allowed"
                : `${customAILimit}/1500`
            }
            textColor={
              customAILimit === 1500
                ? "!text-red-500 font-semibold"
                : "!text-[#FFFFFF99]"
            }
          />
        </div>
        <button
          className="bg-blackBG dark:bg-Neon border border-[#667085] text-white dark:text-blackBG text-sm leading-6 font-medium rounded py-3 px-5 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={apiResponse}
        >
          {apiResponse ? "Loading..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

UserSettingContext.propTypes = {
  activeTab: PropTypes.string,
  handlePrompts: PropTypes.func,
  setCustomInstruction: PropTypes.func,
  setCustomInstructionLimit: PropTypes.func,
  customInstruction: PropTypes.string,
  customInstructionLimit: PropTypes.number,
  apiResponse: PropTypes.bool,
  customAI: PropTypes.string,
  setCustomAI: PropTypes.func,
  customAILimit: PropTypes.number,
  setCustomAILimit: PropTypes.func,
};

export default UserSettingContext;
