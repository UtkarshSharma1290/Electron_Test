import { createContext, useMemo, useState } from "react";
import PropTypes from "prop-types";

import { PROCESS_TYPES, PROCESS_TYPE_KEY } from "../../constant/const";

const initialState = {
  process: PROCESS_TYPES?.AUTOMATIC,
};

export const ProcessContext = createContext();

const ProcessContextProvider = ({ children }) => {
  const [processDetails, setProcessDetails] = useState(() => {
    let processType = localStorage?.getItem(PROCESS_TYPE_KEY);
    processType = +processType || 9999;
    if (
      +processType === PROCESS_TYPES?.AUTOMATIC ||
      +processType === PROCESS_TYPES?.MANUAL
    ) {
      return { process: processType };
    }
    return initialState;
  });

  const toggleProcesses = () => {
    const newProcessType =
      processDetails?.process === PROCESS_TYPES?.MANUAL
        ? PROCESS_TYPES?.AUTOMATIC
        : PROCESS_TYPES?.MANUAL;
    setProcessDetails({
      process: newProcessType,
    });
    localStorage?.setItem(PROCESS_TYPE_KEY, newProcessType);
  };

  const value = useMemo(
    () => ({ processDetails, setProcessDetails, toggleProcesses }),
    [processDetails, setProcessDetails]
  );

  return (
    <ProcessContext.Provider value={value}>{children}</ProcessContext.Provider>
  );
};

ProcessContextProvider.propTypes = {
  children: PropTypes.node,
};

export default ProcessContextProvider;
