import React from "react";
import BodyTextTitle from "./BodyTextTitle";
import LoadingIcons from "../../assets/img/progressbar.gif";

const Loading = () => {
  return (
    <div className="h-screen bg-primaryBG w-full flex justify-center items-center">
      <div className="max-w-[320px] w-full flex flex-col justify-center items-center gap-4 ">
        <BodyTextTitle
          text="Please hold while we redirect you"
          textColor="text-white"
          additionalClass="w-full text-center"
        />
        <img src={LoadingIcons} alt="LoadingIcons" />
      </div>
    </div>
  );
};

export default Loading;
