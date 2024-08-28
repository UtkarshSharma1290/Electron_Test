import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

import Button from "../molecules/Button";
import ImageHeadingContent from "../molecules/ImageHeadingContent";
import ChatBot from "../../assets/svg/Chatbot assistant answering questions online.svg";
import OpenLaptop from "../../assets/svg/open laptop.svg";
import { ProcessContext } from "../../context/Process/ProcessContext";
import { PROCESS_TYPES } from "../../constant/const";

const UserProcesses = ({ activeTab, isShowDescription, onSubmit }) => {
  //context
  const { processDetails, toggleProcesses } = useContext(ProcessContext);
  const process = processDetails?.process;

  //states
  const [currentSelectedProcess, setCurrentSelectedProcess] = useState(process);

  //functions
  const onSubmitHandler = () => {
    toast?.success("Your settings have been successfully updated!");
    onSubmit?.();
    if (currentSelectedProcess === process) return;
    toggleProcesses();
  };

  return (
    <div
      id="seven"
      className={`${
        activeTab === "#seven" ? "" : "hidden"
      } w-full flex flex-col gap-4 justify-between`}
    >
      <div className="w-full flex flex-col gap-4 min-h-[450px]">
        {" "}
        {isShowDescription && (
          <div>
            <p className="text-black dark:text-white">
              Before proceeding, please select how you want to use the software:
            </p>
            <p className="text-black dark:text-white">
              Either by automatically sending questions or manually sending them
              by clicking the send button.
            </p>
          </div>
        )}
        {!isShowDescription && (
          <div>
            <p className="text-black dark:text-white">Select Your Process</p>
          </div>
        )}
        <div className="flex gap-4 justify-around">
          <ImageHeadingContent
            heading="AI Process"
            content="You don’t need to manually stop the recording, our Smart AI will take care of it for you."
            img={ChatBot}
            isSelected={currentSelectedProcess === PROCESS_TYPES?.AUTOMATIC}
            onClick={() => setCurrentSelectedProcess(PROCESS_TYPES?.AUTOMATIC)}
          />
          <ImageHeadingContent
            heading="Manual Process"
            content="You'll need to manually stop the recording. This ensures you have complete control over the process."
            img={OpenLaptop}
            isSelected={currentSelectedProcess === PROCESS_TYPES?.MANUAL}
            onClick={() => setCurrentSelectedProcess(PROCESS_TYPES?.MANUAL)}
          />
        </div>
        {isShowDescription && (
          <p className="text-black dark:text-[#FFFFFF99]">
            You can change this process at any time in the settings.
          </p>
        )}
      </div>
      <div className="w-full p-2 flex justify-end items-center">
        <Button
          label="Submit"
          onClick={onSubmitHandler}
          className={"max-w-fit"}
        />
      </div>
    </div>
  );
};

UserProcesses.propTypes = {
  activeTab: PropTypes.string,
  isShowDescription: PropTypes.bool,
  onSubmit: PropTypes.func,
};

export default UserProcesses;
