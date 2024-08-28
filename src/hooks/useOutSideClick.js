import { useEffect, useRef } from "react";

const useOutsideClick = (props) => {
  const { callback } = props;
  const ref = useRef();
  const shouldNotConsiderRef = useRef();

  useEffect(() => {
    const outsideClickhandler = (event) => {
      if (
        ref?.current?.contains(event?.target) === false &&
        shouldNotConsiderRef?.current?.contains(event?.target) === false
      ) {
        callback();
      }
    };

    document?.addEventListener("mousedown", outsideClickhandler);

    return () => {
      document?.removeEventListener("mousedown", outsideClickhandler);
    };
  }, []);

  return { ref, shouldNotConsiderRef };
};

export default useOutsideClick;
