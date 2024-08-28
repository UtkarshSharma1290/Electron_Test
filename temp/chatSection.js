//global variables
let enterCounter = 0;

const handleInputEnterClicks = (event) => {
  const { key } = event;
  if (key !== "Enter") {
    return;
  }
  event?.preventDefault();

  const doubleClicksThresholdValues = 300;

  if (key === "Enter") {
    enterCounter++;
  }

  const timerId = setTimeout(() => {
    if (enterCounter >= 2 && !isApiResponseLoading) {
      handleSubmit(event);
      enterCounter = 0;
      clearTimeout(timerId);
      return;
    }
    enterCounter = 0;
    event.target.value += "\n";
    putCursorFocusAtTheEnd(textAreaInputRef, event?.target?.value);
    clearTimeout(timerId);
  }, doubleClicksThresholdValues);
};
