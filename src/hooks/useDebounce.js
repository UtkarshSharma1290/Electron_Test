import { useRef, useCallback } from "react";

const useDebounce = (callback, wait=300) => {
  const timeoutId = useRef(null);

  const debouncedFunction = useCallback(
    (...args) => {
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current);
      }
      timeoutId.current = window.setTimeout(() => {
        callback(...args);
      }, wait);
    },
    [callback, wait]
  );

  return debouncedFunction;
};

export default useDebounce;
