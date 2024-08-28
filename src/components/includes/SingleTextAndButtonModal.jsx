import React from "react";
import PropTypes from "prop-types";

import Modal from "./Modal.jsx";
import Button from "../molecules/Button.jsx";

const SingleTextAndButtonModal = ({
  heading,
  content,
  onClick,
  buttonLabel,
  isOpen,
  onClose,
}) => {
  return (
    <Modal {...{ heading, onClose }} isModalOpen={isOpen}>
      <div className="flex flex-col gap-5 justify-center items-center p-4">
        <p className="text-black dark:text-white">{content}</p>
        <Button {...{ onClick }} label={buttonLabel} className={"max-w-fit"} />
      </div>
    </Modal>
  );
};

SingleTextAndButtonModal.propTypes = {
  heading: PropTypes.string,
  content: PropTypes.string,
  onClick: PropTypes.func,
  buttonLabel: PropTypes.string,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default SingleTextAndButtonModal;
