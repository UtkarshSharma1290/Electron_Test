import { useEffect } from "react";

const useObserver = ({ callback, targetRef }) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback?.();
          }
        });
      },
      { threshold: 0.1 } // Adjust this threshold as needed
    );

    if (targetRef) {
      observer.observe(targetRef);
    }

    // Cleanup the observer on component unmount
    return () => {
      if (targetRef) {
        observer.unobserve(targetRef);
      }
    };
  }, [targetRef]);
};

export default useObserver;
