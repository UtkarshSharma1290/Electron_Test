import React, { useEffect } from "react";
import PropTypes from "prop-types";

import Modal from "./Modal";
import Button from "../molecules/Button";

import { TIME_TO_WAIT_BEFORE_USER_CLICK_CONTINUE } from "../../constant/const";

const SilenceDetectionModal = ({ isOpen, onClose, onContinue, onQuit }) => {
  useEffect(() => {
    const timeOutId = setTimeout(() => {
      onQuit?.();
    }, TIME_TO_WAIT_BEFORE_USER_CLICK_CONTINUE);

    return () => {
      clearTimeout(timeOutId);
    };
  }, []);

  return (
    <Modal {...{ onClose }} isModalOpen={isOpen} heading="Still there?">
      <div className="flex flex-col gap-4 p-3 w-full">
        <div className="p-2 w-full">
          <p className="text-[16px] dark:text-white">
            It looks like there hasn't been any activity for 10 minutes. If you
            need more time, please click the button below to continue your
            session. Otherwise, you'll be automatically logged out in 2 minutes
            for security reasons.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            label="Continue Session"
            onClick={onContinue}
            className={"max-w-fit"}
          />
        </div>
      </div>
    </Modal>
  );
};

SilenceDetectionModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onContinue: PropTypes.func,
  onQuit: PropTypes.func,
};

export default SilenceDetectionModal;
