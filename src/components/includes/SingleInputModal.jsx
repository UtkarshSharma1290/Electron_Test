import React, { useEffect } from "react";
import PropTypes from "prop-types";

import Modal from "./Modal";
import InputWithButton from "../molecules/InputWithButton";

const SingleInputModal = ({
  isOpen,
  onClose,
  onClick,
  value,
  onChange,
  buttonLabel,
  placeholder,
  heading,
  subHeading,
  disabled,
  loading,
}) => {
  useEffect(() => {
    return () => {
      onChange?.("");
    };
  }, []);

  return (
    <Modal isModalOpen={isOpen} {...{ onClose, heading }}>
      <form
        className="w-full p-3 flex flex-col gap-[12px]"
        onSubmit={(e) => {
          e?.preventDefault();
          onClick?.();
        }}
      >
        <p className="dark:text-white">{subHeading}</p>
        <InputWithButton
          buttonLabel={buttonLabel}
          onChange={(e) => onChange(e)}
          {...{ value, onClick, placeholder }}
          disabledBtn={disabled || loading}
        />
      </form>
    </Modal>
  );
};

SingleInputModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onClick: PropTypes.func,
  value: PropTypes.string,
  onChange: PropTypes.func,
  buttonLabel: PropTypes.string,
  placeholder: PropTypes.string,
  heading: PropTypes.string,
  subHeading: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
};

export default SingleInputModal;
