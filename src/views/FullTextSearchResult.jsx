import React from "react";
import { HIGHLIGHTED_TEXT_CLASS_NAME } from "../constant/const";

export const DATA = [
  [{ key: "content-1" }, { key: "content-2" }, { key: "content-3" }],
  [
    {
      content:
        "What strategies do you believe are most effective in <span class='content-1'> implementing </span> DevOps principles within a large-scale organization?",
    },
    {
      content:
        "<span class='content-2'> Implementing </span> DevOps principles within a large-scale organization requires a holistic approach. Firstly, fostering a culture of collaboration and communication among development, operations, and other relevant teams is crucial. ",
    },
    {
      content:
        "What strategies do you believe are most effective in <span class='content-3'> implementing </span> DevOps principles within a large-scale organization?",
    },
  ],
];

const FullTextSearchResult = () => {
  const [currentSelectedKeyIndex, setCurrentSelectedKeyIndex] = useState(0);
  const [currentSelectedId, setCurrentSelectedId] = useState("");

  const moveFocusOnText = (isUP) => {
    const keysArray = DATA?.[0];
    const alreadySelectedSpanElement = document?.getElementsByClassName(
      keysArray[currentSelectedKeyIndex]?.key
    )?.[0];
    alreadySelectedSpanElement?.classList?.remove(HIGHLIGHTED_TEXT_CLASS_NAME);
    if (isUP) {
      const prevKey =
        currentSelectedKeyIndex - 1 >= 0
          ? currentSelectedKeyIndex - 1
          : currentSelectedKeyIndex;
      setCurrentSelectedKeyIndex(prevKey);
      setCurrentSelectedId(keysArray[prevKey]?.key);
      const spanElement = document?.getElementsByClassName(
        keysArray[prevKey]?.key
      )?.[0];
      spanElement.scrollIntoView({ behavior: "smooth", block: "center" });
      spanElement?.classList?.add(HIGHLIGHTED_TEXT_CLASS_NAME);
      return;
    }
    const nextKey =
      currentSelectedKeyIndex + 1 < keysArray?.length
        ? currentSelectedKeyIndex + 1
        : currentSelectedKeyIndex;
    setCurrentSelectedKeyIndex(nextKey);
    setCurrentSelectedId(keysArray[nextKey].key);
    const spanElement = document?.getElementsByClassName(
      keysArray[nextKey]?.key
    )?.[0];
    spanElement.scrollIntoView({ behavior: "smooth", block: "center" });
    spanElement?.classList?.add(HIGHLIGHTED_TEXT_CLASS_NAME);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          overflowY: "scroll",
          maxHeight: "200px",
        }}
      >
        {DATA?.[1]?.map((text) => {
          return (
            <p
              key={text?.content}
              style={{
                padding: "40px 16px",
              }}
              dangerouslySetInnerHTML={{ __html: text?.content }}
            ></p>
          );
        })}
      </div>
      <div>
        <button onClick={() => moveFocusOnText(true)}>UP</button>
        <button onClick={() => moveFocusOnText(false)}>Down</button>
      </div>
    </div>
  );
};

export default FullTextSearchResult;
