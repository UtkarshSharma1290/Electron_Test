import React, { useState } from "react";
import { delay } from "../../utils/utils";

let myToast;

const ToastNotification = () => {
  const [content, setContent] = useState("");

  myToast = async (data) => {
    if (typeof data !== "string") return;
    setContent(data);
    await delay(3000);
    setContent("");
  };

  if (!content) return;

  return (
    <div className="px-4 py-2 bg-white dark:bg-primaryBG absolute top-4 left-[50%] border-[1px] border-primaryBG dark:border-[#F2F4F740] rounded-lg">
      <p className="dark:text-white font-normal text-[16px]">
        {content || "No Message"}
      </p>
    </div>
  );
};

export { ToastNotification, myToast };
