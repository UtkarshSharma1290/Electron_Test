import React from "react";
import PropTypes from "prop-types";

const LabelDateAndOptions = ({
  label1,
  label2,
  value1,
  value2,
  onClickOption1,
  onClickOption2,
  onLabelClick,
  icon1,
  icon2,
  isLoading,
}) => {
  const DATA_TO_RENDER = [
    {
      label: label1,
      value: value1,
    },
    {
      label: label2,
      value: value2,
    },
  ];

  return (
    <div className="flex gap-3 border-b-[1px] dark:border-[#F2F4F7] py-4 w-full">
      <div className="flex gap-3 justify-between items-center w-full">
        {DATA_TO_RENDER?.map((item) => {
          return (
            <button onClick={onLabelClick}  key={item?.label} className="flex flex-col gap-[32px] w-[50%]">
              <p className="text-black dark:text-white text-[16px] font-bold w-full text-start">
                {item?.label}
              </p>
              <p className="text-black dark:text-GrayText text-[14px] font-medium w-[200px] truncate text-start">
                {item?.value}
              </p>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 items-end">
        <button
          onClick={onClickOption1}
          className="disabled:cursor-not-allowed disabled:opacity-70 p-1 bg-black dark:bg-transparent rounded"
          disabled={isLoading}
        >
          <img src={icon1} alt="option-icon" className="w-[18px] h-[17px]" />
        </button>
        <button
          onClick={onClickOption2}
          className="disabled:cursor-not-allowed disabled:opacity-70 p-1 bg-black dark:bg-transparent rounded"
          disabled={isLoading}
        >
          <img src={icon2} alt="option-icon" className="w-[18px] h-[17px]" />
        </button>
      </div>
    </div>
  );
};

LabelDateAndOptions.propTypes = {
  label1: PropTypes.string,
  label2: PropTypes.string,
  value1: PropTypes.string,
  value2: PropTypes.string,
  onClickOption1: PropTypes.func,
  onClickOption2: PropTypes.func,
  onLabelClick: PropTypes.func,
  icon1: PropTypes.string,
  icon2: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default LabelDateAndOptions;
