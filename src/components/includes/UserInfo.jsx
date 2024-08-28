import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

import Button from "../molecules/Button";
import LabelWithValue from "./LabelWithValue";

import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";
import useFetchUserProfile from "../../hooks/useFetchUserProfile";
import { LIGHT, USER_EMAIL } from "../../constant/const";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { convertToHumanReadableDateAndTime } from "../../utils/utils";

let ORIGINAL_USERNAME;
const UserInfo = ({ activeTab }) => {
  const userEmail = localStorage?.getItem(USER_EMAIL);

  //custom-hooks
  const { updateUserProfile, isLoading: isUpdatingUserProfile } =
    useUpdateUserProfile();
  const { data: userProfileData, fetchUserProfile } = useFetchUserProfile({
    isCallApiOnLoad: true,
  });

  //states
  const [userName, setUserName] = useState(userProfileData?.name);

  //contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  const RESTRICTED_TIME = null;

  //functions
  const onUpdateUserName = () => {
    updateUserProfile({
      userName,
      onSuccessCallback: (message) => {
        toast?.success(message);
        fetchUserProfile?.({});
        ORIGINAL_USERNAME = userName;
      },
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
    });
  };

  useEffect(() => {
    setUserName(userProfileData?.name);
    ORIGINAL_USERNAME = userProfileData?.name;
  }, [userProfileData?.name]);

  return (
    <div
      className={`w-full ${
        activeTab === "#fifth" ? "" : "hidden"
      } flex flex-col gap-3 justify-between items-start p-2 h-full`}
    >
      <div className="w-full flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <LabelWithValue
            label="Name"
            value={userName}
            disabled={false}
            onChange={(e) => setUserName(e?.target?.value)}
          />
          <Button
            className={isWhite ? "max-w-fit" : `bg-Neon text-black max-w-fit`}
            onClick={onUpdateUserName}
            disabled={
              isUpdatingUserProfile ||
              ORIGINAL_USERNAME === userName ||
              userName?.trim()?.length === 0
            }
            label={isUpdatingUserProfile ? "Updating..." : "Update Name"}
          />
        </div>
        <LabelWithValue label="Email" value={userEmail} />
        {!!RESTRICTED_TIME?.startTime && !!RESTRICTED_TIME?.endTime && (
          <div className="flex gap-4 justice-between items-center w-full pt-6">
            <LabelWithValue
              label="Restricted Time starts from"
              value={convertToHumanReadableDateAndTime(
                RESTRICTED_TIME?.startTime
              )}
            />
            <LabelWithValue
              label="Restricted Time ends at"
              value={convertToHumanReadableDateAndTime(
                RESTRICTED_TIME?.endTime
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};

UserInfo.propTypes = {
  activeTab: PropTypes.string,
};

export default UserInfo;
