import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

import CustomLoader from "../components/molecules/customLoader";
import ListWithTitle from "../components/molecules/ListWithTitle";

import ArrowBack from "../assets/svg/arrow_back.svg";
import BlackBackArrow from "../assets/img/black-arrow-icon.png";
import BlueLogo from "../assets/svg/blue-logo.svg";
import SidebarIcon from "../assets/svg/sidebar-icon.svg";
import SidebarBlackIcon from "../assets/svg/sidebar-black-icon.svg";
import Logo from "../assets/svg/312-logo.svg";
import { ThemeContext } from "../context/Theme/ThemeContext";
import { HOME } from "../constant/routesNames";
import { LIGHT, SHARED_SESSION_TYPES } from "../constant/const";

const SharedSessionsSidebar = ({
  allSharedSessionToTheUser,
  setCurrentSelectedSession,
  currentSelectedSession,
  isLoading,
  sharedType,
  setSharedType,
  fetchSessionSharedByTheUser,
  fetchSharedSessionToTheUser,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const navigate = useNavigate();

  //contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  const SHARED_TABS = [
    {
      label: "With me",
      onClick: () => {
        fetchSharedSessionToTheUser({
          onSuccessCallback: () => {
            setSharedType(SHARED_SESSION_TYPES?.WITH_ME);
          },
          onErrorCallback: (errorMessage) => {
            toast?.error(errorMessage);
          },
        });
      },
      isSelected: sharedType === SHARED_SESSION_TYPES?.WITH_ME,
    },
    {
      label: "By me",
      onClick: () => {
        fetchSessionSharedByTheUser({
          onSuccessCallback: () => {
            setSharedType(SHARED_SESSION_TYPES?.BY_ME);
          },
          onErrorCallback: (errorMessage) => {
            toast?.error(errorMessage);
          },
        });
      },
      isSelected: sharedType === SHARED_SESSION_TYPES?.BY_ME,
    },
  ];

  const ALL_SEVEN_DAYS_OLDER_SESSIONS = allSharedSessionToTheUser?.filter(
    (session) => session.date_message === "7_days_older"
  );
  const ALL_EARLIER_SESSIONS = allSharedSessionToTheUser?.filter(
    (session) => session.date_message === "others"
  );
  const ALL_TODAYS_SESSIONS = allSharedSessionToTheUser?.filter(
    (session) => session.date_message === "today"
  );

  return (
    <div className="p-3 flex flex-col gap-3 justify-between h-full">
      <div className="flex flex-col gap-4 h-[80%]">
        <div className="flex justify-between h-[20%]">
          <img src={isWhite ? BlueLogo : Logo} alt="312-logo" />
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-start justify-end pt-3"
            >
              <img
                src={isWhite ? SidebarBlackIcon : SidebarIcon}
                alt="sidebar"
                className="w-[24px] h-[24px] opacity-70"
              />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-[24px] h-[80%]">
          <div className="flex flex-col gap-2 h-[20%]">
            <p className="font-normal text-[12px] text-black dark:text-white">
              Shared
            </p>
            <div className="flex gap-[6px] bg-primaryBG dark:bg-[#414141] p-2 justify-between items-center w-full rounded-md">
              {SHARED_TABS?.map((tab) => {
                return (
                  <button
                    key={tab?.label}
                    onClick={tab?.onClick}
                    className={`w-1/2 ${
                      tab?.isSelected
                        ? "bg-white dark:bg-Neon text-black"
                        : "bg-transparent dark:text-white"
                    } 
                    py-[4px] 
                    px-[8px] 
                    flex 
                    justify-center 
                    items-center 
                    rounded
                  `}
                  >
                    <p className="text-[12px] font-medium">{tab?.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col overflow-y-auto max-h-[66vh] gap-6 h-[80%] pb-12">
            {!isLoading && !!ALL_TODAYS_SESSIONS?.length && (
              <ListWithTitle
                title="Today"
                data={ALL_TODAYS_SESSIONS}
                onClick={(sharedEmailsProperties) =>
                  setCurrentSelectedSession(sharedEmailsProperties)
                }
                selectedItemId={currentSelectedSession?.id}
              />
            )}
            {!isLoading && !!ALL_SEVEN_DAYS_OLDER_SESSIONS?.length && (
              <ListWithTitle
                title="Last 7 days"
                data={ALL_SEVEN_DAYS_OLDER_SESSIONS}
                onClick={(sharedEmailsProperties) =>
                  setCurrentSelectedSession(sharedEmailsProperties)
                }
                selectedItemId={currentSelectedSession?.id}
              />
            )}
            {!isLoading && !!ALL_EARLIER_SESSIONS?.length && (
              <ListWithTitle
                title="Earlier"
                data={ALL_EARLIER_SESSIONS}
                onClick={(sharedEmailsProperties) =>
                  setCurrentSelectedSession(sharedEmailsProperties)
                }
                selectedItemId={currentSelectedSession?.id}
              />
            )}
            {isLoading && (
              <div className="min-h-[40vh] flex justify-center items-center h-full m-auto w-full">
                <CustomLoader />
              </div>
            )}
            {!isLoading &&
              !ALL_EARLIER_SESSIONS?.length &&
              !ALL_SEVEN_DAYS_OLDER_SESSIONS?.length &&
              !ALL_TODAYS_SESSIONS?.length && (
                <div className="h-full flex justify-center items-center">
                  <p className="text-black dark:text-white">
                    No Session to show!
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
      <button
        className="flex w-full max-h-[60px] min-h-[40px] h-[20%] pl-[24px] pb-[16px] gap-4 justify-start items-center bg-primaryBG"
        onClick={() => navigate(HOME)}
      >
        <img
          src={isWhite ? BlackBackArrow : ArrowBack}
          alt="back-arrow-icon"
          className={isWhite ? "w-[24px] rotate-180" : ""}
        />
        <p className="text-[16px] font-medium text-black dark:text-white">
          Go back
        </p>
      </button>
    </div>
  );
};

SharedSessionsSidebar.propTypes = {
  allSharedSessionToTheUser: PropTypes.array,
  setCurrentSelectedSession: PropTypes.func,
  currentSelectedSession: PropTypes.string,
  isLoading: PropTypes.bool,
  sharedType: PropTypes.number,
  setSharedType: PropTypes.func,
  fetchSessionSharedByTheUser: PropTypes.func,
  fetchSharedSessionToTheUser: PropTypes.func,
};

export default SharedSessionsSidebar;
