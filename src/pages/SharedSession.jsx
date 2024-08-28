import React, { useContext, useState } from "react";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";

import SharedSessionsView from "../views/SharedSessionsView";
import SharedSessionsSidebar from "../views/SharedSessionsSidebar";
import useGetAllSharedChatsApi from "../hooks/useGetAllSharedChatsApi";
import useFetchAllSharedToSessionsApi from "../hooks/useFetchAllSharedToSessionsApi";
import {
  DRAWER_DARK_STYLES,
  DRAWER_LIGHT_STYLES,
  DRAWER_SIZE,
  LIGHT,
  MOBILE_WIDTH,
  SHARED_SESSION_TYPES,
} from "../constant/const";
import useDimension from "../hooks/useDimensions";
import { ThemeContext } from "../context/Theme/ThemeContext";

const SharedSession = () => {
  //states
  const [currentSelectedSession, setCurrentSelectedSession] = useState("");
  const [sharedType, setSharedType] = useState(SHARED_SESSION_TYPES?.WITH_ME);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  //custom-hooks
  const {
    data: allSessionSharedToTheUser,
    isLoading: isGettingAllSharedChats,
    fetchSharedSessionToTheUser,
  } = useGetAllSharedChatsApi();
  const {
    fetchSessionSharedByTheUser,
    isLoading: isGettingSharedToSessions,
    data: allSessionSharedByTheUser,
  } = useFetchAllSharedToSessionsApi();
  const { width } = useDimension();
  const isMobile = width <= MOBILE_WIDTH;

  //context
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  //functions
  const getLeftSection = () => {
    return (
      <div
        className={`${
          isMobile ? "w-full h-full" : "w-[25%]"
        } min-w-[200px] text-white`}
      >
        <SharedSessionsSidebar
          allSharedSessionToTheUser={
            sharedType === SHARED_SESSION_TYPES?.WITH_ME
              ? allSessionSharedToTheUser
              : allSessionSharedByTheUser
          }
          {...{
            isSidebarOpen,
            setIsSidebarOpen,
            setCurrentSelectedSession,
            currentSelectedSession,
            fetchSessionSharedByTheUser,
            fetchSharedSessionToTheUser,
            sharedType,
            setSharedType,
          }}
          isLoading={isGettingAllSharedChats || isGettingSharedToSessions}
        />
      </div>
    );
  };

  return (
    <div className="w-full flex-1 flex justify-between bg-GreyThemeBG dark:bg-[#1F1F1F] h-full">
      {!isMobile && isSidebarOpen && getLeftSection()}
      {isMobile && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          direction="left"
          size={DRAWER_SIZE}
          className="bg-primaryBG w-1/2"
          style={isWhite ? DRAWER_LIGHT_STYLES : DRAWER_DARK_STYLES}
        >
          {getLeftSection()}
        </Drawer>
      )}
      <div
        className={`${
          isSidebarOpen ? "w-[75%]" : "w-full"
        } text-white flex justify-center items-center p-3`}
      >
        <SharedSessionsView
          {...{ isSidebarOpen, setIsSidebarOpen }}
          sessionId={currentSelectedSession?.session_id}
          sharedBy={currentSelectedSession?.shared_by}
          sharedTo={currentSelectedSession?.shared_to}
          key={currentSelectedSession?.session_id}
        />
      </div>
    </div>
  );
};

export default SharedSession;
