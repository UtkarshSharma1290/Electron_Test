// ----- X ----- ----- X ----- ----- X ----- ----- X ----- ----- X ----- ----- X -----
let chunks = [];
const onTranscribing = async (event) => {
  console.log("transcribing speech");
  try {
    //my-blog
    const combinedBuffer = Buffer.concat(chunks);

    // Create a Blob from the combined Buffer
    let blob = new Blob([combinedBuffer], {
      type: "application/octet-stream",
    });
    console.log({ chunks, blob });

    const buffer = await blob.arrayBuffer();
    console.log({ wav: buffer.byteLength });
    const { Mp3Encoder } = await import("lamejs");
    const encoder = new Mp3Encoder(1, 16000, 96);
    const mp3 = encoder.encodeBuffer(new Int16Array(buffer));
    blob = new Blob([mp3], { type: "audio/mpeg" });
    console.log({ blob, mp3: mp3.byteLength });

    const file = new File([blob], "speech.mp3", {
      type: "audio/mpeg",
    });
    // Have to pass my generated blog here
    const text = await onWhispered(file);
    console.log("---------onTranscribing", { text });
    event?.reply("transcription", text);
  } catch (err) {
    console.info(err);
  }
};

const onWhispered = async (file) => {
  // Whisper only accept multipart/form-data currently
  const body = new FormData();
  body.append("file", file);
  body.append("model", "whisper-1");
  body.append("language", "en");

  const mode = "transcriptions";
  try {
    const headers = {};
    const apiKey = "";
    headers["Content-Type"] = "multipart/form-data";
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }
    const { default: axios } = await import("axios");
    const response = await axios.post(
      "https://api.openai.com/v1/audio/" + mode,
      body,
      {
        headers,
      }
    );
    if (response?.data?.text?.toLowerCase() === "you") {
      return "";
    }
    return response.data.text;
  } catch (err) {
    console.log("my error: ", { err });
    return "error";
  }
};

const initialiseRecorder = (event) => {
  outputStream = new Writable({
    write(chunk, encoding, callback) {
      console.log("adding chunk to array: ", { chunk });
      chunks.push(chunk);
      callback();
    },
  });
  const MONO = 1;
  const deviceId = "Blackhole 2ch";

  recording = recorder.record({
    sampleRate: 16000,
    channels: MONO,
    device: deviceId,
  });
  recording.start();
  recording.stream().pipe(outputStream);

  const intervalId = setInterval(() => {
    onTranscribing(event);
  }, 1000);

  console.log("Recording...");
  outputStream.on("finish", () => {
    console.log("Output stream finished.");
    onTranscribing(event);
    clearInterval(intervalId);
  });

  // Handle errors on the outputStream
  outputStream.on("error", (err) => {
    console.error("Output stream error:", err);
  });
};

ipcMain.on("speaker-testing", (event) => {
  initialiseRecorder(event);
});

ipcMain.on("clear-chunks", () => {
  chunks = [];
});

// ----- X ----- ----- X ----- ----- X ----- ----- X ----- ----- X ----- ----- X -----
