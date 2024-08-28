import PropTypes from "prop-types";

const H4 = ({ label, textColor, additionalClass }) => {
  return (
    <h4
      className={`${
        additionalClass ? additionalClass : ""
      } font-DMSans font-medium text-[40px] leading-[42px] ${
        textColor ? textColor : ""
      }`}
    >
      {label}
    </h4>
  );
};

H4.propTypes = {
  label: PropTypes.string,
  textColor: PropTypes.string,
  additionalClass: PropTypes.string,
};

export default H4;
