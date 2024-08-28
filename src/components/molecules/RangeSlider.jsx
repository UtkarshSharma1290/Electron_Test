import React from "react";

const RangeSlider = ({ onChange, value, start, end, label, containerClassName }) => {
  return (
    <div className={`${containerClassName} flex flex-col gap-2 justify-start w-full self-start`}>
      <h1 className=" text-black dark:text-white">{label}</h1>
      <div className="flex justify-start items-center w-full h-6">
        <div className="flex items-center gap-4 w-full h-16 w-ful">
          <input
            {...{ onChange, value }}
            type="range"
            min={start}
            max={end}
            id="range"
            className={`w-full cursor-pointer outline-none rounded-full h-1 bg-gray-300`}
          />
          <div className="text-[16px] text-black dark:text-white w-12 text-center">{value}</div>
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
