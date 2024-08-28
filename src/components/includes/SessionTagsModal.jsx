import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

import Chip from "../molecules/Chip";
import CustomLoader from "../molecules/customLoader";
import InputWithButton from "../molecules/InputWithButton";
import Modal from "../includes/Modal";

import useSearchTags from "../../hooks/useSearchTags";
import { compareStrings } from "../../utils/utils";

const SessionTagsModal = ({
  isSessionTagModalOpen,
  setIsSessionTagModal,
  onUpdateSessionTags,
  isUpdatingSessionTags,
  currentSessionTags,
}) => {
  //states
  const [newlyAddedTag, setNewlyAddedTag] = useState("");

  //custom-hooks
  const {
    searchTagsHandler,
    data: allTags,
    error: errorWhileTagsSearching,
    isLoading,
  } = useSearchTags();

  //functions
  const onSearchTags = (strToSearch) => {
    searchTagsHandler({
      query: strToSearch,
    });
    setNewlyAddedTag(strToSearch);
  };

  const toggleSelectTags = (tagStr) => {
    let finalSelectedTagsStr = "";
    if (currentSessionTags?.includes(tagStr)) {
      const filteredData = currentSessionTags?.filter(
        (tag) => !compareStrings(tag, tagStr)
      );
      finalSelectedTagsStr = filteredData?.join(",");
    } else {
      const updatedData = [...(currentSessionTags || []), tagStr];
      finalSelectedTagsStr = updatedData?.join(",");
    }
    onUpdateSessionTags({}, finalSelectedTagsStr);
  };

  const onCloseHandler = () => {
    setIsSessionTagModal(false);
  };

  useEffect(() => {
    searchTagsHandler({
      query: "",
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
    });
  }, []);

  return (
    <Modal
      isModalOpen={isSessionTagModalOpen}
      onClose={onCloseHandler}
      heading="Add Tag"
    >
      <form
        onSubmit={(e) =>
          onUpdateSessionTags(
            e,
            `${currentSessionTags?.join(",")},${newlyAddedTag}`
          )
        }
        className="w-full flex flex-col justify-center items-center"
      >
        <div className="flex flex-col gap-3 justify-center items-center w-full p-[24px]">
          <label
            htmlFor="tags"
            className="dark:text-white self-start text-[16px]"
          >
            Enter Tag
          </label>
          <InputWithButton
            placeholder="Enter Tag"
            buttonLabel="Submit"
            onChange={(e) => onSearchTags(e?.target?.value)}
            value={newlyAddedTag}
            onClick={(e) =>
              onUpdateSessionTags(
                e,
                `${currentSessionTags?.join(",")},${newlyAddedTag}`
              )
            }
            disabledBtn={
              newlyAddedTag?.trim()?.length === 0 || isUpdatingSessionTags
            }
          />
        </div>
        <div className="w-full flex flex-col justify-start p-[24px] pt-0 gap-6">
          <div className="flex flex-wrap gap-3 w-full p-4 bg-[#dbdbdc] dark:bg-black rounded-lg overflow-y-auto max-h-[60px] lg:max-h-[200px]">
            {!isLoading &&
              allTags?.map((tag) => {
                return (
                  <Chip
                    key={tag}
                    label={tag}
                    type={currentSessionTags?.includes(tag) ? "blue" : "black"}
                    maxLength={60}
                    isDisableIcon
                    clickable
                    onClick={() => toggleSelectTags(tag)}
                  />
                );
              })}
            {!isLoading && !allTags?.length && (
              <div className="p-2 w-full flex justify-center items-center">
                <p className="text-black dark:text-white text-[12px]">
                  No tags are available!
                </p>
              </div>
            )}
            {!!isLoading && (
              <div className="flex w-full justify-center items-center">
                <CustomLoader />
              </div>
            )}
            {!!errorWhileTagsSearching && !isLoading && (
              <div className="p-2 flex justify-center items-center">
                <p className="dark:text-white">{errorWhileTagsSearching}</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

SessionTagsModal.propTypes = {
  isSessionTagModalOpen: PropTypes.bool,
  setIsSessionTagModal: PropTypes.func,
  currentSessionTags: PropTypes.array,
  onUpdateSessionTags: PropTypes.func,
  isUpdatingSessionTags: PropTypes.bool,
};

export default SessionTagsModal;
