import PropTypes from "prop-types";

const BodyTextTitle = ({ text, textColor, additionalClass }) => {
  return (
    <p
      className={`font-DMsans text-base ${
        textColor ? textColor : "text-primaryBG"
      } ${additionalClass}`}
    >
      {text}
    </p>
  );
};

BodyTextTitle.propTypes = {
  text: PropTypes.string,
  textColor: PropTypes.string,
  additionalClass: PropTypes.string,
};

export default BodyTextTitle;
