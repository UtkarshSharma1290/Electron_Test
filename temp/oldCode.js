function handleAutomaticSubmit() {
  if (inputTextRef.current?.inputText === "") {
    return;
  }
  setIsApiResponseLoading(true);
  const userPrompt = inputTextRef.current?.inputText;
  setInputText("");
  setChatLog([
    ...(chatLogRef?.current?.chatLog || []),
    {
      chatPrompt: userPrompt,
      botResponse: "",
      chatId: chatLog?.length + 1,
      icon: "userIcon",
    },
  ]);

  const inputBody = {
    userPrompt: userPrompt,
    email: localStorage.getItem(USER_EMAIL),
    session_id: localStorage.getItem(SESSION_ID),
    token: process.env.REACT_APP_SECURITY_MESSAGE_OPENAI,
  };

  ipcRenderer.send("voice-recording", inputBody);
  ipcRenderer.on("botResponse", (event, response) => {
    setChatLog([
      ...(chatLogRef?.current?.chatLog || []),
      {
        chatPrompt: userPrompt,
        botResponse: response,
        chatId: chatLog?.length + 1,
        icon: "recordingIcon",
      },
    ]);
  });

  ipcRenderer.on("botResponseClosed", (event, response) => {
    setIsApiResponseLoading(false);
    ipcRenderer?.removeAllListeners("botResponse");
    fetchUserChatsHistory({});
  });
}
