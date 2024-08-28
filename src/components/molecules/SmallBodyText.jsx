import PropTypes from "prop-types";

const SmallBodyText = ({ text, textColor, additionalClass }) => {
  return (
    <p
      className={`font-DMsans text-sm leading-6 font-medium text-primaryBG ${
        textColor ? textColor : ""
      } ${additionalClass}`}
    >
      {text}
    </p>
  );
};

SmallBodyText.propTypes = {
  text: PropTypes.string,
  textColor: PropTypes.string,
  additionalClass: PropTypes.string,
};

export default SmallBodyText;
