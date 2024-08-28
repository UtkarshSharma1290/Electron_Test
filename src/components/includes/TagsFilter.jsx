import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

import Chip from "../molecules/Chip";
import CustomLoader from "../molecules/customLoader";

import useFetchAllTagsApi from "../../hooks/useFetchAllTagsApi";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import Cross from "../../assets/svg/white-cross.svg";
import BlackCross from "../../assets/svg/cross.svg";
import { LIGHT } from "../../constant/const";

const TagsFilter = ({
  setSelectedTags,
  selectedTags,
  setIsShowFilter,
  searchQueryHandler,
  setUserSearchResult,
  onResetFilters,
  isFetchingFilterResult,
  setUserSearchResultTotalPageCount,
}) => {
  //states
  const [localSelectedTags, setLocalSelectedTags] = useState(
    selectedTags || []
  );

  // custom-hooks
  const {
    isLoading: isFetchingAllTags,
    error: ErrorWhileFetchingTags,
    data: allTags,
  } = useFetchAllTagsApi();

  //contexts
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  const onSelectTagToggle = (tagLabel) => {
    if (localSelectedTags?.includes(tagLabel)) {
      const filteredData = localSelectedTags?.filter((tag) => tag !== tagLabel);
      setLocalSelectedTags(filteredData);
      return;
    }
    setLocalSelectedTags((prev) => {
      return [...prev, tagLabel];
    });
  };

  const onApplyFilter = () => {
    searchQueryHandler({
      isSearch: false,
      query: localSelectedTags?.join(","),
      pageNumber: 1,
      onErrorCallback: (errorMessage) => {
        toast?.error(errorMessage);
      },
      onSuccessCallback: (data) => {
        setIsShowFilter(false);
        setSelectedTags(localSelectedTags);
        setUserSearchResult(data?.data);
        setUserSearchResultTotalPageCount(data?.total);
      },
    });
  };

  const isLoading = isFetchingAllTags || isFetchingFilterResult;

  return (
    <div className="flex-1 min-h-[58vh] h-md:min-h-[70vh] w-full flex flex-col justify-between items-center gap-3">
      <div className="px-4 h-[54%] h-lg:h-[90%] w-full">
        <div className="flex h-[10%] justify-between items-center w-full">
          <p className="text-[12px] font-normal dark:text-[#FFFFFFCC]">
            Filter by tags
          </p>
          <button onClick={() => setIsShowFilter(false)}>
            <img
              src={isWhite ? BlackCross : Cross}
              alt="cross"
              className="w-[12px] h-[12px]"
            />
          </button>
        </div>
        <div className="flex gap-x-[12px] flex-wrap justify-start items-start w-full gap-2 overflow-y-auto max-h-[90%] pt-2">
          {!isLoading &&
            !ErrorWhileFetchingTags &&
            allTags?.map((tag) => {
              return (
                <Chip
                  key={tag}
                  clickable
                  onClick={() => onSelectTagToggle(tag)}
                  label={tag}
                  type={localSelectedTags?.includes(tag) ? "blue" : "black"}
                  maxLength={90}
                  isDisableIcon
                />
              );
            })}
          {!isLoading && !allTags?.length && !ErrorWhileFetchingTags && (
            <div className="flex justify-center items-center p-2 w-full min-h-[100%]">
              <p className="text-black dark:text-white text-[12px]">
                No tags are available!
              </p>
            </div>
          )}
          {isLoading && (
            <div className="h-full w-full flex justify-center items-center">
              <CustomLoader />
            </div>
          )}
          {!!ErrorWhileFetchingTags && (
            <div className="min-h-[40vh] flex justify-center items-center w-full">
              <p className="dark:text-white text-[12px] font-normal">
                {ErrorWhileFetchingTags}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 h-md:pb-8 pt-2 h-md:pt-0 w-full h-[20%] h-lg:h-[10%] min-h-[100px] flex justify-between items-start h-md:items-end  border-t-[1px] border-black dark:border-white">
        <button className="w-1/2 text-red-500" onClick={onResetFilters}>
          Reset
        </button>
        <button
          onClick={onApplyFilter}
          disabled={localSelectedTags?.length === 0}
          className="w-1/2 bg-[#FFFFFF] text-center rounded py-1 px-6 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

TagsFilter.propTypes = {
  setSelectedTags: PropTypes.func,
  selectedTags: PropTypes.array,
  setIsShowFilter: PropTypes.func,
  searchQueryHandler: PropTypes.func,
  onResetFilters: PropTypes.func,
  isFetchingFilterResult: PropTypes.bool,
};

export default TagsFilter;
