import { useState, useEffect } from "react";
import { throttle } from "../utils/utils";

function useDimension() {
  const [windowSize, setWindowSize] = useState({
    width: document.body.clientWidth,
    height: document.body.clientHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: document.body.clientWidth,
        height: document.body.clientHeight,
      });
    }

    window.addEventListener("resize", throttle(handleResize));

    // Call handler right away so state gets updated with initial window size
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

export default useDimension;
