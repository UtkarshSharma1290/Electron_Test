import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

import RangeSlider from "../molecules/RangeSlider";

import WhiteTheme from "../../assets/svg/WhiteTheme.svg";
import DarkTheme from "../../assets/svg/DarkTheme.svg";
import GreenCheck from "../../assets/svg/Green-Check.svg";
import { onOpacityChangeHandler } from "../../utils/utils";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import {
  DARK,
  LIGHT,
  MINIMUM_OPACITY_RANGE,
  OPACITY_KEY,
} from "../../constant/const";

let ipcRenderer;
const SystemTheme = ({ activeTab }) => {
  //states
  const [opacityRange, setOpacityRange] = useState(() => {
    const currentOpacity = +localStorage.getItem(OPACITY_KEY);
    return currentOpacity ? currentOpacity : 100;
  });

  //context
  const {
    theme: { theme },
    toggleTheme,
  } = useContext(ThemeContext);

  const THEMES = [
    {
      label: "Light",
      img: WhiteTheme,
      isSelected: theme === LIGHT,
      onClick: () => {
        if (theme === LIGHT) {
          return;
        }
        toggleTheme?.();
      },
    },
    {
      label: "Dark",
      img: DarkTheme,
      isSelected: theme === DARK,
      onClick: () => {
        if (theme === DARK) {
          return;
        }
        toggleTheme?.();
      },
    },
  ];

  //useEffects
  useEffect(() => {
    if (window.require) {
      const electron = window.require("electron");
      ipcRenderer = electron.ipcRenderer;
    } else {
      ipcRenderer = {
        send: () => console.log("send is not available in web browser"),
        on: () => console.log("on is not available in web browser"),
        removeAllListeners: () =>
          console.log("removeAllListeners is not available in web browser"),
      };
    }
  }, []);

  useEffect(() => {
    const currentOpacity = +localStorage.getItem(OPACITY_KEY);
    onOpacityChangeHandler({
      changedOpacity: currentOpacity ? currentOpacity : 100,
      ipcRenderer,
      setOpacityRange,
    });
  }, []);

  return (
    <div
      className={`w-full ${
        activeTab === "#sixth" ? "" : "hidden"
      } flex flex-col justify-start items-center p-2 rounded gap-[12px]`}
    >
      <div className="w-full">
        <p className="dark:text-white text-[16px]">Select Theme</p>
      </div>
      <div className="flex justify-around items-center gap-4 w-full">
        {THEMES?.map((item) => {
          return (
            <button
              key={item?.label}
              className={`flex flex-col gap-[12px] relative`}
              onClick={item?.onClick}
            >
              <img
                src={item?.img}
                alt="theme-img"
                className={`${
                  item?.isSelected ? "border-GreenBorder" : "border-transparent"
                } border-[3px] rounded-lg`}
              />
              <p className="dark:text-white">{item?.label}</p>
              {item?.isSelected && (
                <img
                  src={GreenCheck}
                  alt="check-icon"
                  className="absolute top-2 right-2 w-[24px] h-[24px]"
                />
              )}
            </button>
          );
        })}
      </div>
      <RangeSlider
        containerClassName={"max-w-[400px] pt-6"}
        value={opacityRange}
        label={"Theme Opacity"}
        onChange={(e) =>
          onOpacityChangeHandler({
            changedOpacity: e?.target?.value,
            ipcRenderer,
            setOpacityRange,
          })
        }
        start={MINIMUM_OPACITY_RANGE}
        end={100}
      />
    </div>
  );
};

SystemTheme.propTypes = {
  activeTab: PropTypes.string,
};

export default SystemTheme;
