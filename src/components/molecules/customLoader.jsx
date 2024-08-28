import { useContext } from "react";
import { ThreeDots } from "react-loader-spinner";

import { ThemeContext } from "../../context/Theme/ThemeContext";
import { LIGHT } from "../../constant/const";

const CustomLoader = ({ small }) => {
  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  return (
    <ThreeDots
      visible={true}
      height={small ? "30" : "50"}
      width={small ? "18" : "30"}
      color={isWhite ? "#000" : "#fff"}
      radius="9"
      ariaLabel="three-dots-loading"
      wrapperStyle={{}}
      wrapperClass=""
    />
  );
};

export default CustomLoader;
