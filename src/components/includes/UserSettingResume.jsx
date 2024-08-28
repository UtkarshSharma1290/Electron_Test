import React, { useContext } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import PropTypes from "prop-types";

import BodyText from "../molecules/BodyText";
import BodyTextTitle from "../molecules/BodyTextTitle";
import { UploadResumeIcons } from "../../assets/svgIcon";
import GreyUploadIcon from "../../assets/svg/grey-upload-icon.svg";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { LIGHT } from "../../constant/const";

const UserSettingResume = ({
  activeTab,
  fileSelect,
  handleChange,
  handleResume,
  setResumeData,
  resumeData,
  file,
  apiResponse,
}) => {
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  return (
    <div
      id="second"
      className={`w-full flex flex-col gap-4 ${
        activeTab === "#second" ? "" : "hidden"
      }`}
    >
      <div className="w-full flex md:flex-row  flex-col justify-between items-center">
        <BodyTextTitle
          text="You can write or paste your resume below."
          textColor="dark:text-white"
        />
        {fileSelect == null ? (
          ""
        ) : (
          <BodyText
            text={fileSelect}
            textColor="dark:text-Neon"
            additionalClass="truncate max-w-[150px] font-bold"
          />
        )}
        <label className="border-none text-sm leading-6 text-medium font-DMSans dark:text-Neon flex gap-[10px] items-center cursor-pointer">
          Upload Resume
          {isWhite ? (
            <img src={GreyUploadIcon} alt="upload-icon" />
          ) : (
            <UploadResumeIcons />
          )}
          <input
            type="file"
            className="hidden"
            onChange={handleChange}
            name="originalDoc"
            id="originalDoc"
          />
        </label>
      </div>
      <form
        className="flex flex-col justify-end items-end gap-5"
        onSubmit={handleResume}
      >
        <ReactTextareaAutosize
          className={`
            w-full 
            bg-GreyThemeBG
            dark:bg-blackBG 
            border 
            border-[#FFFFFF80] 
            p-3 
            min-h-[452px] 
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
          value={resumeData || ""}
          onChange={(e) => setResumeData(e.target.value)}
          placeholder="Paste your resume here or else you can create it from scratch."
          minRows={1}
          maxRows={10}
          cacheMeasurements
        />
        <button
          className="bg-primaryBG text-white dark:bg-Neon border border-[#667085]
                       dark:text-blackBG text-sm leading-6 font-medium 
                       rounded py-3 px-5 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={apiResponse}
        >
          {apiResponse ? "Loading..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

UserSettingResume.propTypes = {
  activeTab: PropTypes.string,
  fileSelect: PropTypes.instanceOf(File),
  handleChange: PropTypes.func,
  handleResume: PropTypes.func,
  setResumeData: PropTypes.func,
  resumeData: PropTypes.string,
  file: PropTypes.instanceOf(File),
  apiResponse: PropTypes.bool,
};

export default UserSettingResume;
