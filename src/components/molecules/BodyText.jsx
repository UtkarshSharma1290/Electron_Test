import PropTypes from "prop-types";

const BodyText = ({ text, textColor, additionalClass }) => {
  return (
    <p
      className={`font-DMsans text-[16px] leading-6 text-primaryBG ${
        textColor ? textColor : ""
      } ${additionalClass}`}
    >
      {text}
    </p>
  );
};

BodyText.propTypes = {
  text: PropTypes.string,
  textColor: PropTypes.string,
  additionalClass: PropTypes.string,
};

export default BodyText;
