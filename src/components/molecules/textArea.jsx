import PropTypes from "prop-types";

const TextArea = ({
  Label,
  additionalClass,
  placeholder,
  LabelClass,
  inputProps,
  errors,
}) => {
  return (
    <div className="flex flex-col w-full">
      {Label && (
        <label
          className={`font-GilroySemiBold text-base mb-[6px] text-primary ${
            LabelClass ? LabelClass : ""
          }`}
        >
          {Label}
        </label>
      )}
      <div className="relative w-full">
        <textarea
          {...inputProps}
          rows={5}
          className={`text-base outline-none resize-none font-GilroyRegular placeholder:text-bodyText placeholder:opacity-50 text-primary border border-bodyText/[0.2] rounded-[8px] w-full pt-[10px] px-[14px]
        ${additionalClass ? additionalClass : ""}`}
          placeholder={placeholder ? placeholder : "Enter details here"}
        />
        {errors?.[inputProps.name] && (
          <div className="text-[#FF0000] px-2 text-sm font-GilroyRegular">
            {errors[inputProps.name].message}
          </div>
        )}
      </div>
    </div>
  );
};

TextArea.propTypes = {
  Label: PropTypes.string,
  additionalClass: PropTypes.string,
  placeholder: PropTypes.string,
  LabelClass: PropTypes.string,
  inputProps: PropTypes.object,
  errors: PropTypes.object,
};

export default TextArea;
