import PropTypes from "prop-types";

const H5 = ({ label, textColor, additionalClass }) => {
  return (
    <h5
      className={` font-DMSans text-lg ${textColor ? textColor : ""} ${
        additionalClass ? additionalClass : ""
      }`}
    >
      {label}
    </h5>
  );
};

H5.propTypes = {
  label: PropTypes.string,
  textColor: PropTypes.string,
  additionalClass: PropTypes.string,
};

export default H5;
