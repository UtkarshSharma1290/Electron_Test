//:::::: ASSEMBLY AI FRONTEND INTEGRATION
const ASSEMBLY_AI_EVENT_SPEAKER = "assembly-ai-speaker";
const ASSEMBLY_AI_EVENT_MICROPHONE = "assembly-ai-microphone";
const SOCKET_STATES = {
  OPEN: "open",
  CLOSED: "close",
  ERROR: "error",
  MESSAGE: "message",
};
const DEVICES_TYPES = {
  BLACKHOLE: "Blackhole 2ch",
  MICROPHONE: "External Microphone",
};

const logInfo = (...value) => {
  console.log(value);
  // log.info(value);
};

let assemblyWebsocketForSpeaker;
let assemblyWebsocketForMicrophone;

ipcMain.on(ASSEMBLY_AI_EVENT_SPEAKER, async (event, args) => {
  try {
    assemblyWebsocketForSpeaker = new WebSocket(
      "wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000",
      {
        headers: {
          Authorization: "3c8bf226a973443684dd421fac8bae1e",
        },
      }
    );

    assemblyWebsocketForSpeaker.on(SOCKET_STATES?.OPEN, () => {
      outputStream = new Writable({
        write(chunk, encoding, callback) {
          assemblyWebsocketForSpeaker.send(chunk, (error) => {
            if (error) {
              console.error("Error sending data:", error);
            }
            callback(); // Callback to indicate completion of write
          });
        },
      });
      const MONO = 1;

      recording = recorder.record({
        sampleRate: 16000,
        channels: MONO,
        device: DEVICES_TYPES?.BLACKHOLE,
      });
      recording.stream().pipe(outputStream);

      outputStream.on("finish", () => {
        console.log("Output stream finished.");
        assemblyWebsocketForSpeaker.close();
      });

      outputStream.on("error", (err) => {
        console.error("Output stream error:", err);
        assemblyWebsocketForSpeaker.close();
      });

      assemblyWebsocketForSpeaker.on(SOCKET_STATES?.MESSAGE, (textData) => {
        console.log({ textData });
        if (textData instanceof ArrayBuffer || isArrayBufferView(textData)) {
          let decoder = new TextDecoder("utf-8");
          let assebmlyTextData = decoder.decode(textData).trim();
          assebmlyTextData = assebmlyTextData.replace(/^\s+|\s+$/g, "");
          assebmlyTextData = assebmlyTextData.replace(/\u0000/g, "");
          assebmlyTextData = assebmlyTextData.replace(/\n/g, " ");

          const parsedData = JSON.parse(assebmlyTextData);
          const { text } = parsedData || {};
          console.log(text, { parsedData }, assebmlyTextData);

          let msg = "";
          if (parsedData?.message_type === "FinalTranscript") {
            msg = text;
          }
          event?.reply("transcription", msg);
        }
      });
    });

    assemblyWebsocketForSpeaker.on(SOCKET_STATES?.CLOSED, () => {
      event.reply("stop-recording");
      logInfo("Connection is closed");
    });

    assemblyWebsocketForSpeaker.on(SOCKET_STATES?.ERROR, () => {
      logInfo("error occured while connecting with assembly ai");
    });
  } catch (err) {
    logInfo("Error while connecting with Assembly ai: ", { err });
  }
});

ipcMain.on("stop-recording-assembly-ai", () => {
  assemblyWebsocketForSpeaker?.close();
  assemblyWebsocketForMicrophone?.close();
  outputStream?.end();
  micOutputStream?.end();
  stopRecording(recorder);
});

//:::: FOR MICROPHONE
ipcMain.on(ASSEMBLY_AI_EVENT_MICROPHONE, (event, args) => {
  try {
    assemblyWebsocketForMicrophone = new WebSocket(
      "wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000",
      {
        headers: {
          Authorization: "3c8bf226a973443684dd421fac8bae1e",
        },
      }
    );

    assemblyWebsocketForMicrophone.on(SOCKET_STATES?.OPEN, () => {
      micOutputStream = new Writable({
        write(chunk, encoding, callback) {
          assemblyWebsocketForMicrophone.send(chunk, (error) => {
            if (error) {
              console.error("Error sending data:", error);
            }
            callback(); // Callback to indicate completion of write
          });
        },
      });
      const MONO = 1;

      recordingNew = parRecorder.record({
        sampleRate: 16000,
        channels: MONO,
        device: DEVICES_TYPES?.MICROPHONE,
      });
      recordingNew.stream().pipe(micOutputStream);

      micOutputStream.on("finish", () => {
        console.log("Output stream finished.");
        assemblyWebsocketForMicrophone.close();
      });

      micOutputStream.on("error", (err) => {
        console.error("Output stream error:", err);
        assemblyWebsocketForMicrophone.close();
      });

      assemblyWebsocketForMicrophone.on(SOCKET_STATES?.MESSAGE, (textData) => {
        if (textData instanceof ArrayBuffer || isArrayBufferView(textData)) {
          let decoder = new TextDecoder("utf-8");
          let assebmlyTextData = decoder.decode(textData).trim();
          assebmlyTextData = assebmlyTextData.replace(/^\s+|\s+$/g, "");
          assebmlyTextData = assebmlyTextData.replace(/\u0000/g, "");
          assebmlyTextData = assebmlyTextData.replace(/\n/g, " ");

          const parsedData = JSON.parse(assebmlyTextData);
          const { text } = parsedData || {};
          console.log(text, { parsedData }, assebmlyTextData);

          let msg = "";
          if (parsedData?.message_type === "FinalTranscript") {
            msg = text;
          }
          event?.reply("transcription", msg);
        }
      });
    });

    assemblyWebsocketForMicrophone.on(SOCKET_STATES?.CLOSED, () => {
      event.reply("stop-recording");
      logInfo("Connection is closed");
    });

    assemblyWebsocketForMicrophone.on(SOCKET_STATES?.ERROR, () => {
      logInfo("error occured while connecting with assembly ai");
    });
  } catch (err) {
    logInfo("Error while connecting with Assembly ai: ", { err });
  }
});

///////////////////////////////////////////////////////
