import React from "react";

import IntroSection from "../components/includes/IntroSection";

import BannerImg from "../assets/img/bannerimg-login.png";
import { LogoAIInterviewer } from "../assets/svgIcon";

const Login = () => {

  return (
    <div className="bg-blackBG w-full md:p-8 p-4 h-screen">
      <div className="w-full h-[calc(100vh_-_64px)] flex md:flex-row flex-col-reverse overflow-auto lg:gap-[63px] gap-8 justify-between">
        <div className="flex-1 flex lg:max-w-[538px] max-w-1/2 w-full lg:p-8 md:p-4 p-0">
          <IntroSection />
        </div>
        <div className="flex-1 flex flex-col lg:max-w-full max-w-1/2 w-full h-full bg-primaryBG md:items-center items-start md:justify-center justify-between">
          <div className="md:hidden block">
            <LogoAIInterviewer />
          </div>
          <img
            src={BannerImg}
            alt="Banner"
            className="lg:w-[623px] md:h-[351px] h-fit w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
