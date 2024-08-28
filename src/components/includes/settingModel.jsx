import React, { useState, useEffect, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import UserSettingContext from "./UserSettingContext";
import UserSettingResume from "./UserSettingResume";
import SettingOptions from "../molecules/SettingOptions";
import UserAchiveChats from "./UserAchiveChats";
import UserInfo from "./UserInfo";
import UserProcesses from "./UserProcesses";

import useFetchUserContextApi from "../../hooks/useFetchUserContextApi";
import useUpdateUserContextApi from "../../hooks/useUpdateUserContextApi";
import useUploadFileApi from "../../hooks/useUploadFileApi.";
import SystemTheme from "./SystemTheme";
import BlackCrossIcon from "../../assets/svg/cross.svg";
import { CloseIcons, LogoutIcons } from "../../assets/svgIcon";
import { LIGHT } from "../../constant/const";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { UserAndAIContext } from "../../context/UserAndAI/UserAndAIContext";
import { LOGIN } from "../../constant/routesNames";
import { logout } from "../../utils/utils";

const SettingsModel = ({
  showModal,
  setShowModal,
  fetchUserChatsHistory,
  showThread,
  setIsShowChatInput,
}) => {
  // states
  const [activeTab, setActiveTab] = useState("#first");
  const [apiResponse, setApiResponse] = useState(false);
  const [customAI, setCustomAI] = useState("");
  const [customAILimit, setCustomAILimit] = useState(0);
  const [customInstruction, setCustomInstruction] = useState("");
  const [customInstructionLimit, setCustomInstructionLimit] = useState(0);
  const [file, setFile] = useState(null);
  const [fileSelect, setFileSelect] = useState(null);
  const [resumeData, setResumeData] = useState();

  //custom-hooks
  const { uploadFileHandler } = useUploadFileApi();
  const { updateUserContextHandler } = useUpdateUserContextApi();
  const { fetchUserContext } = useFetchUserContextApi();

  //react-hooks
  const navigate = useNavigate();

  // contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;
  const { userAndAi, setUserAndAi } = useContext(UserAndAIContext);

  //functions
  const getBase64 = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        let base64String = reader.result;
        if (typeof base64String === "string") {
          base64String = base64String.replace(
            /^data:application\/pdf;base64,/,
            ""
          );
        }
        setFile(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = useCallback((e) => {
    if (e?.target?.files?.length > 0) {
      const selectedFile = e?.target?.files[0];
      setFileSelect(selectedFile.name);
      getBase64(selectedFile);
    }
  }, []);

  const handlePrompts = async (e) => {
    e?.preventDefault(e);
    toast.info("Uploading your preferences. Please wait.", { autoClose: 2000 });
    updateUserContextHandler({
      file: null,
      customInstruction: customInstruction,
      customAI: customAI,
      onSuccessCallback: () => {
        toast.success("Your preferences have been saved successfully!", {
          autoClose: 2000,
        });
        setUserAndAi((prev) => {
          return {
            userInstructions: customInstruction,
            aiContext: customAI,
            resume: prev?.resume,
          };
        });
      },
      onErrorCallback: () => {
        toast.error("Could not upload your preferences, please try again.", {
          autoClose: 2000,
        });
      },
    });
  };

  const handleResume = async (e) => {
    e?.preventDefault();
    toast.info("Uploading your resume. Please wait.", { autoClose: 2000 });
    uploadFileHandler({
      file: file ? file : resumeData || "",
      customInstruction: null,
      customAI: null,
      onSuccessCallback: () => {
        toast.success("Your resume has been saved successfully!", {
          autoClose: 2000,
        });
        fetchUserContext({
          onSuccessCallback: (response) => {
            setCustomAI(response?.custom_ai_response);
            setCustomInstruction(response?.custom_instruction);
            setResumeData(response?.resume_data);
            setUserAndAi({
              userInstructions: response?.custom_instruction,
              aiContext: response?.custom_ai_response,
              resume: response?.resume_data,
            });
          },
        });
      },
      onErrorCallback: () => {
        toast.error("Could not upload your preferences, please try again.", {
          autoClose: 2000,
        });
      },
    });
  };

  const onLogout = () => {
    logout(navigate(LOGIN));
  };

  const TABS_ARRAY = [
    {
      label: "Customise Bot",
      onClick: () => setActiveTab("#first"),
      isSelected: activeTab === "#first",
    },
    {
      label: "Resume Management",
      onClick: () => setActiveTab("#second"),
      isSelected: activeTab === "#second",
    },
    {
      label: "Archived Chats",
      onClick: () => setActiveTab("#third"),
      isSelected: activeTab === "#third",
    },
    {
      label: "My Profile",
      onClick: () => setActiveTab("#fifth"),
      isSelected: activeTab === "#fifth",
    },
    {
      label: "System Theme",
      onClick: () => setActiveTab("#sixth"),
      isSelected: activeTab === "#sixth",
    },
    {
      label: "Auto-Send Questions",
      onClick: () => setActiveTab("#seven"),
      isSelected: activeTab === "#seven",
    },
  ];

  // useEffects
  useEffect(() => {
    setCustomAI(userAndAi?.aiContext);
    setCustomInstruction(userAndAi?.userInstructions);
    setResumeData(userAndAi?.resume);
  }, []);

  if (!showModal) {
    return null;
  }

  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto dark:bg-[#000000]/[0.3] fixed inset-0 z-50 outline-none focus:outline-none ">
      <div className="relative mx-auto min-h-[680px] w-[971px] bg-white dark:bg-primaryBG outline-none rounded-xl shadow-lg focus:outline-none cursor-auto">
        <div className="p-6 flex justify-between items-center border-b dark:border-[#FFFFFF80] w-full">
          <h3 className="text-[22px] font-DMSans font-semibold leading-6 dark:text-white">
            Settings
          </h3>
          <button
            onClick={() => {
              setShowModal(false);
            }}
          >
            {isWhite ? (
              <img src={BlackCrossIcon} alt="cross-icon" />
            ) : (
              <CloseIcons />
            )}
          </button>
        </div>
        <div className="p-6 w-full min-h-[65vh]">
          <div className="rounded w-full mx-auto flex md:flex-row flex-col gap-[44px]">
            {/* Tabs */}
            <ul className="md:max-w-[194px] flex-1 w-full flex md:flex-col flex-row gap-4 justify-start">
              {TABS_ARRAY?.map((tab) => {
                return (
                  <SettingOptions
                    key={tab}
                    isSelected={tab?.isSelected}
                    label={tab?.label}
                    onClick={tab?.onClick}
                  />
                );
              })}
            </ul>
            {/* Tab Contents */}
            <div
              id="tab-contents"
              className="md:max-w-[calc(100%_-_232px)] w-full"
            >
              <UserSettingContext
                {...{
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
                }}
              />
              <UserSettingResume
                {...{
                  activeTab,
                  fileSelect,
                  handleChange,
                  handleResume,
                  setResumeData,
                  resumeData,
                  apiResponse,
                  file,
                }}
              />
              <UserAchiveChats
                {...{
                  activeTab,
                  fetchUserChatsHistory,
                  showThread,
                  setShowModal,
                  setIsShowChatInput,
                  toast,
                }}
              />
              <UserInfo {...{ activeTab }} />
              <SystemTheme {...{ activeTab }} />
              <UserProcesses {...{ activeTab }} />
            </div>
          </div>
        </div>
        <button
          className="flex gap-[10px] py-3 px-6 text-[#898989] text-base font-medium font-DMSans max-w-[203px] 
              w-full items-center absolute bottom-6 left-6 z-40 cursor-pointer"
          onClick={onLogout}
        >
          <LogoutIcons /> Log Out
        </button>
      </div>
    </div>
  );
};

SettingsModel.propTypes = {
  showModal: PropTypes.bool,
  setShowModal: PropTypes.func,
  showThread: PropTypes.func,
  setIsShowChatInput: PropTypes.func,
};

export default SettingsModel;
