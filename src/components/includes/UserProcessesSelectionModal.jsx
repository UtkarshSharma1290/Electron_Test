import React from "react";
import PropTypes from "prop-types";

import Modal from "./Modal";
import UserProcesses from "./UserProcesses";

const UserProcessesSelectionModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isModalOpen={isOpen}
      {...{ onClose }}
      heading="Auto Send Questions"
      className="pt-0 min-w-[971px]"
      isRemoveCrossIcon
    >
      <div className="p-6">
        <UserProcesses
          onSubmit={onClose}
          isShowDescription
          activeTab="#seven"
        />
      </div>
    </Modal>
  );
};

UserProcessesSelectionModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default UserProcessesSelectionModal;
