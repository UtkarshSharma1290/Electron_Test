import PropTypes from "prop-types";

const Input = ({
  Label,
  additionalClass,
  type,
  placeholder,
  helpText,
  LabelClass,
  inputProps,
  errors,
}) => {
  return (
    <div className="flex flex-col w-full">
      {Label && (
        <label
          className={`font-NotoSans text-base mb-[6px] text-primary ${
            LabelClass ? LabelClass : ""
          }`}
        >
          {Label}
        </label>
      )}
      <div className="relative w-full">
        <input
          {...inputProps}
          type={type ? type : "text"}
          className={`text-base outline-none font-NotoSans placeholder:text-bodyText placeholder:opacity-50 text-primary border border-bodyText/[0.2] min-h-[44px] rounded-[8px] w-full py-[10px] px-[14px]
          ${additionalClass ? additionalClass : ""} ${
            helpText ? "pr-[38px]" : ""
          }`}
          placeholder={placeholder ? placeholder : "Enter details here"}
        />
        {helpText && (
          <div className="group/item absolute top-0 bottom-0 right-[14px] m-auto h-fit flex justify-center">
            {/* <HelpText /> */}
            <p className="group-hover/item:visible invisible bottom-full flex bg-black rounded-xl absolute text-white text-xs py-[6px] px-[10px]">
              {helpText}
            </p>
          </div>
        )}
        {errors?.[inputProps.name] && (
          <div className="text-[#FF0000] px-2 text-sm font-NotoSans mt-[4px]">
            {errors[inputProps.name].message}
          </div>
        )}
      </div>
    </div>
  );
};

Input.propTypes = {
  Label: PropTypes.string,
  additionalClass: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  helpText: PropTypes.string,
  LabelClass: PropTypes.string,
  inputProps: PropTypes.object,
  errors: PropTypes.object,
};

export default Input;
