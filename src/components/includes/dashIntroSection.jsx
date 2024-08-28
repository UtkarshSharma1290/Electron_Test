import React, { useContext } from "react";
import H4 from "../molecules/headings/h4";
import H5 from "../molecules/headings/h5";
import BodyTextTitle from "../molecules/BodyTextTitle";
import Image1 from "../../assets/img/bullseye.svg";
import Image2 from "../../assets/img/waveform.svg";
import Image3 from "../../assets/img/time-fast.svg";
import BlackSpiral from "../../assets/svg/black-spiral.svg";
import BlackWave from "../../assets/svg/black-wave.svg";
import BlackTime from "../../assets/svg/black-time-fast 1.svg";
import SmallBodyText from "../molecules/SmallBodyText";
import { LIGHT } from "../../constant/const";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import useDimension from "../../hooks/useDimensions";

export default function DashIntroSection() {
  //custom-hooks
  const { width } = useDimension();
  const isHideDescription = width <= 800;
  const isHideMainHeading = width <= 600;

  //context
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  const Card = ({ image, heading, description }) => {
    return (
      <div className="card flex flex-col justify-center items-center gap-[6px] max-w-[210px] w-full mb-[197px]">
        <img src={image} alt="Card" />
        <BodyTextTitle
          text={heading}
          textColor="dark:text-white"
          additionalClass="font-medium text-center"
        />
        <SmallBodyText
          text={description}
          textColor="text-primaryBG opacity-60 dark:opacity-100 dark:text-[#F2F4F7]"
          additionalClass="text-center leading-[22px]"
        />
      </div>
    );
  };

  const CardList = ({ data }) => {
    if (isHideDescription) {
      return null;
    }

    return (
      <div className="card-list flex md:flex-row flex-col md:justify-between justify-center items-center w-full">
        {data?.map((item, index) => (
          <Card
            key={index}
            image={item.image}
            heading={item.heading}
            description={item.description}
          />
        ))}
      </div>
    );
  };

  const cardData = [
    {
      image: isWhite ? BlackSpiral : Image1,
      heading: "Accurate Answers",
      description: "Trustworthy, precise responses tailored to you.",
    },
    {
      image: isWhite ? BlackWave : Image2,
      heading: "Audio Analysis",
      description: "Deep insights from cutting-edge audio technology.",
    },
    {
      image: isWhite ? BlackTime : Image3,
      heading: "Fast Response",
      description: "Rapid assistance for seamless productivity.",
    },
  ];

  if(isHideMainHeading){
    return null;
  }

  return (
    <div
      className={`z-20 max-w-[758px] gap-[60px] w-full flex flex-col ${
        isHideDescription ? "h-full justify-center p-4" : ""
      }`}
    >

        <div className="flex flex-col gap-4 justify-center">
          <H4
            label="Welcome to AI Interview Assistant"
            textColor="dark:text-white"
            additionalClass="text-center !text-[18px] md:!text-[40px]"
          />
          <H5
            label="Maximizing Interview Success Through AI-Powered Guidance"
            textColor="text-primaryBG opacity-60 dark:opacity-100 dark:text-[#F2F4F7]"
            additionalClass="text-center !text-[16px] md:!text-[24px]"
          />
        </div>
      <div className="app">
        <CardList data={cardData} />
      </div>
    </div>
  );
}
