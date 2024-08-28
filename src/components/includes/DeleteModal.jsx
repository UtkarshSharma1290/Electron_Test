import React from "react";
import PropTypes from "prop-types";

import Button from "../molecules/Button";
import Modal from "./Modal";

const DeleteModal = ({
  chatTitle,
  onClose,
  isModalOpen,
  onDelete,
  disabledBtn,
}) => {
  return (
    <Modal heading="Delete Chat?" {...{ onClose, isModalOpen }}>
      <div className="flex flex-col gap-2 justify-between w-full items-center p-[24px]">
        <p className="w-full dark:text-white">
          This will delete ({chatTitle}) chat permanently
        </p>
        <Button label="Delete" onClick={onDelete} disabled={disabledBtn} className={"max-w-fit"}/>
      </div>
    </Modal>
  );
};

DeleteModal.propTypes = {
  chatTitle: PropTypes.string,
  onClose: PropTypes.func,
  isModalOpen: PropTypes.bool,
  onDelete: PropTypes.func,
  disabledBtn: PropTypes.bool,
};

export default DeleteModal;
