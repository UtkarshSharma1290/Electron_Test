const { app, BrowserWindow, ipcMain, systemPreferences } = require("electron");
const path = require("path");
const url = require("url");
require("dotenv").config();
const WebSocket = require("ws");
const log = require("electron-log/main");
const net = require("net");
const { isArrayBufferView } = require("node:util/types");
const { Writable } = require("stream");
/**
 * "node-recorder-lpcm16" recorder for getting the audio from system speaker
 */
const recorder = require("node-record-lpcm16");
/**
 * "node-recorder-lpcm16/parallelRecorder" recorder for getting the audio from system microphone
 */
const parRecorder = require("node-record-lpcm16/parallelRecorder");
const customDeviceRecorder = require("node-record-lpcm16/customDeviceRecorder");
/**
 * For executing the commands on the user's system for installing the required dependencies
 */
const { exec } = require("child_process");
/**
 * An instance of net.Socket() for connecting with the server web-socket for getting the transcription from audio coming out of user's speaker
 */
const client = new net.Socket();
/**
 * An instance of net.Socket() for connecting with the server web-socket for getting the transcription from audio coming out of user's microphone
 */
const client2 = new net.Socket();
const {
  CUSTOM_PROTOCOL_NAME,
  RESPONSE_END_MESSAGE,
  PARTIAL_MESSAGE,
  FINAL_MESSAGE,
} = require("./utils/constants");

//Global variables---------------------------
/**
 * (Speaker)
 * Instance of Writable for getting the audio in chunks and sending it to the server's web-socket for transcription
 */
let outputStream;
/**
 * (Microphone)
 * Instance of Writable for getting the audio in chunks and sending it to the server's web-socket for transcription
 */
let micOutputStream;
let i = 0;
/**
 * An instance of WebSocket
 */
let win;
/**
 * (Speaker)
 * Instance of "recorder", getting used to capturing the audio in chunks from the "blackhole"
 */
let recording;
/**
 * (Microphone)
 * Instance of "recorder", getting used to capturing the audio in chunks from the "blackhole"
 */
let recordingNew;
let responseTimeout;
const IS_DEV = false;
/**
 * IP of the our server
 */
const host = IS_DEV ? "10.10.1.110" : "216.48.190.99"; //server
/**
 * PORT of our server
 */
const port = 1068;
/**
 * WebSocket instance for taking speaker audio
 */
let assemblyAiSpeakerWebSocket;
/**
 * WebSocket instance for taking microphone audio
 */
let assemblyAiMicrophoneWebSocket;
//-------------------------------------------

app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL_NAME);
app.commandLine.appendSwitch("disable-features", "IOSurfaceCapturer");

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL_NAME, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
  // test-comment
} else {
  app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL_NAME);
}

function createWindow() {
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true,
    });
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      // devTools: false,
      contextIsolation: false,
      enableRemoteModule: true,
      nativeWindowOpen: true,
    },
  });
  win.loadURL(startUrl);
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  systemPreferences
    .askForMediaAccess("microphone")
    .then((granted) => {
      if (granted) {
        log.info("Microphone access granted");
      } else {
        log.info("Microphone access denied");
      }
    })
    .catch((err) => {
      console.error("Error asking for microphone permission:", err);
    });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  win.webContents.on("did-finish-load", () => {
    win.setContentProtection(true);
  });
});

app.on("open-url", (event, url) => {
  log.info("fire url event");
  log.info("url", url);
  win.webContents.send("external-url-opened", url);
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

async function connectToServer(client) {
  console.log("connect to server called");
  return new Promise((resolve, reject) => {
    client.connect(port, host, () => {
      log.info("Connected to server");
      console.log("Connected to server");
      resolve();
    });

    client.on("error", (err) => {
      log.info("Error:", err);
      console.error("errorssssss!:", err);
      reject(err);
    });
  });
}

//::::::::::- function for recording the audio of the interviewer/speaker
async function startSecRecording(client) {
  outputStream = new Writable({
    write(chunk, encoding, callback) {
      console.log("sending to backend: ", { chunk });
      client.write(chunk);
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

  recording.stream().pipe(outputStream);
  console.log("Recording...");
  outputStream.on("finish", () => {
    console.log("Output stream finished.");
    client.end();
  });

  // Handle errors on the outputStream
  outputStream.on("error", (err) => {
    console.error("Output stream error:", err);
    client.end();
  });
}
//

//::::::::::- function for start taking the audio from the external microphone
async function startSecParallelRecording(client) {
  micOutputStream = new Writable({
    write(chunk, encoding, callback) {
      client.write(chunk);
      callback();
    },
  });
  const MONO = 1;
  const deviceId = "External Microphone";

  recordingNew = parRecorder.record({
    sampleRate: 16000,
    channels: MONO,
    device: deviceId,
  });

  recordingNew.stream().pipe(micOutputStream);
  console.log("Recording...");

  micOutputStream.on("finish", () => {
    console.log("Output stream finished.");
    client.end();
  });

  // Handle errors on the outputStream
  micOutputStream.on("error", (err) => {
    console.error("Output stream error:", err);
    client.end();
  });
}
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::

async function startRecordingForMicrophone(ws) {
  try {
    const MONO = 1;
    const deviceId = "External Microphone";

    console.log("before error");

    // recordingNew = parRecorder.record({
    //   sampleRate: 16000,
    //   channels: MONO,
    //   device: deviceId,
    // });
    // recordingNew.start();

    //----------------------------------
    recordingNew = customDeviceRecorder.record({
      sampleRate: 16000,
      channels: MONO,
      device: deviceId,
    });
    // recordingNew.switchInputDevice("External Microphone");
    recordingNew.switchInputDevice("default");
    recordingNew.start();
    //----------------------------------

    // recordingNew.stream().pipe(outputStream); for writing the output to the input text

    console.log("Recording...");
    // sending the data to the python backend
    recordingNew.stream().on("data", (chunk) => {
      console.log("Chunk of the web-socket  microphone: ", { chunk });
      const base64AudioData = chunk.toString("base64");
      ws.send(base64AudioData);
    });
  } catch (err) {
    console.log("No microphone found!", { err });
  }

  //recieving the data from python backend
  // note: with WebSocket we have to listen to "message" event in-order to get the data from the backend
}

async function startRecordingForSpeaker(ws) {
  try {
    const MONO = 1;
    const deviceId = "Blackhole 2ch";
    const frameSize = 3200;
    const sampleRate = 16000;

    const recording = recorder.record({
      sampleRate: sampleRate,
      channels: MONO,
      device: deviceId,
    });

    recording.start();

    console.log("Recording...");

    let buffer = Buffer.alloc(0);

    // sending the data to the Python backend
    recording.stream().on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      while (buffer.length >= frameSize) {
        const frame = buffer?.slice(0, frameSize);
        buffer = buffer?.slice(frameSize);

        const base64AudioData = frame.toString("base64");
        ws.send(base64AudioData);
      }
    });

    recording.stream().on("end", () => {
      // Send remaining data if any
      if (buffer.length > 0) {
        const base64AudioData = buffer.toString("base64");
        ws.send(base64AudioData);
      }
    });
  } catch (err) {
    console.log("Error occurred while sending speaker audio: ", { err });
  }
}

ipcMain.on("send-recording-stop-message", () => {
  try {
    assemblyAiSpeakerWebSocket?.send("terminate_session");
  } catch (err) {
    console.log("Error while sending message to backend: ", { err });
  }
});

//:::::- for starting the recording from new "Web-Socket" instead of old "net.Socket"
ipcMain.on("start-recording-microphone", async (event, args) => {
  const encryptedMessage = "ai-interview-audio";
  const connectionURL = IS_DEV
    ? `ws://${host}:1066/audio/assembly/microphone/${args?.userId}/${encryptedMessage}`
    : `ws://ai-interview.hestawork.com/audio/assembly/microphone/${args?.userId}/${encryptedMessage}`;
  assemblyAiMicrophoneWebSocket = new WebSocket(connectionURL);

  try {
    assemblyAiMicrophoneWebSocket.on("open", () => {
      console.log("Connected to server from web-socket microphone");
      startRecordingForMicrophone(assemblyAiMicrophoneWebSocket);
    });

    assemblyAiMicrophoneWebSocket.on("close", () => {
      console.log("Connection closed from web-socket-microphone");
      event.reply("stop-recording");
    });

    assemblyAiMicrophoneWebSocket.on("message", (chunk) => {
      const parsedObject = JSON.parse(chunk);
      const textData = parsedObject?.text;
      const message_type = parsedObject?.message_type;
      console.log(
        "getting microphone text from backend %$%$%$%$%$%$%$%$%$%$%$%$%$%$%$%$%$%: ",
        {
          responseData: textData,
        }
      );

      event.reply("microphone-text", { textData, message_type });
    });

    assemblyAiMicrophoneWebSocket.on("error", (error) => {
      console.error("WebSocket error:", error);
      stopRecording(recorder);
      assemblyAiMicrophoneWebSocket.close();
      event.reply("stop-recording", "Recording stopped.");
      event.reply("recordingError");
    });
  } catch (err) {
    console.error("Failed to connect or start recording:--------------", err);
  }
});
//:::::::::::::::::::::::::::::::::::::::::::::

//:::::- for starting the recording from new "Web-Socket" instead of old "net.Socket"
ipcMain.on("start-recording-speaker", async (event, args) => {
  const encryptedMessage = "ai-interview-audio";
  const connectionURL = IS_DEV
    ? `ws://${host}:1066/audio/assembly/speaker/${args?.userId}/${encryptedMessage}`
    : `ws://ai-interview.hestawork.com/audio/assembly/speaker/${args?.userId}/${encryptedMessage}`;
  assemblyAiSpeakerWebSocket = new WebSocket(connectionURL);

  try {
    assemblyAiSpeakerWebSocket.on("open", () => {
      console.log("Connected to server from web-socket------------------");
      startRecordingForSpeaker(assemblyAiSpeakerWebSocket);
    });

    assemblyAiSpeakerWebSocket.on("close", () => {
      console.log("Connection closed from web-socket");
      event.reply("stop-recording");
    });

    assemblyAiSpeakerWebSocket.on("message", (chunk) => {
      const parsedObject = JSON.parse(chunk);
      console.log({ fff: parsedObject });
      const textData = parsedObject?.text;
      const message_type = parsedObject?.message_type;
      console.log("getting speaker text from backend: ", {
        responseData: textData,
      });
      event.reply("transcription", { textData, message_type });
    });

    assemblyAiSpeakerWebSocket.on("error", (error) => {
      console.error("WebSocket error:", error);
      stopRecording(recorder);
      assemblyAiSpeakerWebSocket.close();
      event.reply("stop-recording", "Recording stopped.");
      event.reply("recordingError");
    });
  } catch (err) {
    console.error("Failed to connect or start recording:--------------", err);
  }
});
//:::::::::::::::::::::::::::::::::::::::::::::

async function checkingRecording(event, args) {
  try {
    log.info("secondary Recording called.");

    // Remove existing listeners before connecting
    ipcMain.removeListener("secondaryRecording", checkingRecording);

    console.log("trying to connect with the server");
    await connectToServer(client);
    await startSecRecording(client);

    client.removeAllListeners("data"); // Remove data listener before adding new one
    client.on("data", (chunk) => {
      if (chunk instanceof ArrayBuffer || isArrayBufferView(chunk)) {
        let decoder = new TextDecoder("utf-8");
        let chunkData = decoder.decode(chunk).trim();
        chunkData = chunkData.replace(/^\s+|\s+$/g, "");
        chunkData = chunkData.replace(/\u0000/g, "");
        chunkData = chunkData.replace(/\n/g, " ");
        event.reply("transcription", chunkData);
      }
    });

    client.on("close", () => {
      console.log("Connection closed from main");
      ipcMain.removeListener("secondaryRecording", checkingRecording); // Remove listener again
    });
  } catch (err) {
    log.info(err);
    event.reply("recordingError");
    console.error("Failed to connect or start recording:", err);
  }
}

async function checkingParallelRecording(event, args) {
  try {
    log.info("secondary Recording called.");
    // Remove existing listeners before connecting
    ipcMain.removeListener("checkingParallelRecording", checkingRecording);

    await connectToServer(client2);
    await startSecParallelRecording(client2);

    client2.removeAllListeners("data"); // Remove data listener before adding new one
    client2.on("data", (chunk) => {
      if (chunk instanceof ArrayBuffer || isArrayBufferView(chunk)) {
        let decoder = new TextDecoder("utf-8");
        let chunkData = decoder.decode(chunk).trim();
        chunkData = chunkData.replace(/^\s+|\s+$/g, "");
        chunkData = chunkData.replace(/\u0000/g, "");
        chunkData = chunkData.replace(/\n/g, " ");
        event.reply("microphone-text", chunkData);
        console.log(chunkData);
      }
    });

    client2.on("close", () => {
      console.log("Connection closed from main");
      ipcMain.removeListener("secondaryRecording", checkingRecording); // Remove listener again
    });
  } catch (err) {
    log.info(err);
    event.reply("recordingError");
    console.error("Failed to connect or start recording:", err);
  }
}

ipcMain.on("secondaryRecording", async (event, args) => {
  checkingRecording(event, args);
});

ipcMain.on("parallelRecording", async (event, args) => {
  checkingParallelRecording(event, args);
});

ipcMain.on("stop-recording", async (event, args) => {
  ipcMain.removeListener("secondaryRecording", checkingRecording);
  console.log("Connection closed");
  client.end();
  outputStream?.end();
  micOutputStream?.end();
  stopRecording();
  assemblyAiMicrophoneWebSocket?.close();
  assemblyAiSpeakerWebSocket?.close();
  event.reply("stop-recording", "Recording stopped.");
  console.log("=========Stopping recording from IPCMAIN======");
  log.info("=========Stopping recording from IPCMAIN======");
});

const stopRecording = () => {
  if (recording) {
    recording?.stop();
    recording = null;
  }

  if (recordingNew) {
    recordingNew?.stop();
    recordingNew = null;
  }
};

//:::::- "regenerated-response" is used to create a new response
ipcMain?.on("regenerated-response", (event, value) => {
  const userId = value?.email;
  const sessionId = value?.session_id;
  const questionNumber = value?.questionNumber;
  const encryptedResponseMessage = "ai-interview-openai";

  log.info(
    "connecting with re-generating socket...... 1",
    encryptedResponseMessage,
    value
  );

  const connectionURL = IS_DEV
    ? `http://${host}:1066/openai/regenerate/${userId}/${sessionId}/${questionNumber}/ai-interview-openai`
    : `https://ai-interview.hestawork.com/openai/regenerate/${userId}/${sessionId}/${questionNumber}/ai-interview-openai`; // staging

  const regeneratedSocket = new WebSocket(connectionURL);

  console.log("about to create a connection");
  regeneratedSocket.addEventListener("open", () => {
    log.info("connecting with re-generating socket...... 2");
    console.log("Connection with regenrate websocket is stablished...");
    console.log({ question: value?.userPrompt });
    regeneratedSocket.send(value?.userPrompt);
  });

  regeneratedSocket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
    log.info("connecting with re-generating socket...... 4 error", { error });
    event.reply(
      "bot-regenerated-response",
      (error =
        "Sorry, we are expierencing some issues. Please try again in a while.")
    );
  });

  //TODO: Have to do the changes here same as done on the voice-recording
  regeneratedSocket.addEventListener("message", (data) => {
    event.reply("bot-regenerated-response", data.data);
    clearInterval(responseTimeout);
    responseTimeout = setTimeout(() => {
      regeneratedSocket.close();
    }, 2000);
  });

  regeneratedSocket.addEventListener("close", (data) => {
    log.info("connecting with re-generating socket...... 3 closed..");
    console.log("The connection has been closed successfully.");
    // Clear the inactivity timeout if the connection is manually closed
    event.reply("bot-regenerated-close", "closed-connection");
    clearTimeout(responseTimeout);
  });
});
//:::::::::::::::::::::::::::::::::::::::::::::

/*
 * websocket for getting the response of the user question from the bot
 */
ipcMain.on("voice-recording", (event, args) => {
  const tags = args?.tags;
  console.log("tags get from frontend: ", { tags, args });

  const connectionURL = IS_DEV
    ? `http://${host}:1066/openai/generate/${args?.email}/${args?.session_id}/ai-interview-openai`
    : `https://ai-interview.hestawork.com/openai/generate/${args?.email}/${args?.session_id}/ai-interview-openai`; // staging

  const WS = new WebSocket(connectionURL);

  WS.addEventListener("open", () => {
    console.log("WebSocket connection opened");
    log.info(args.userPrompt);
    WS.send(`${args.userPrompt}`);
  });

  WS.addEventListener("error", (error) => {
    log.info("connecting with voice-recording.... ", error);
    console.error("WebSocket error:", error);
    event.reply(
      "botResponse",
      (error =
        "Sorry, we are experiencing some issues. Please try again in a while.")
    );
  });
  WS.addEventListener("message", (data) => {
    log.info(
      "connecting with voice-recording....  3 response",
      JSON.stringify(data),
      data.data
    );

    let textData = data?.data;
    if (textData?.includes(RESPONSE_END_MESSAGE)) {
      event.reply("botResponseClosed");
      WS.close();
      return;
    }

    event.reply("botResponse", data.data);
    // clearInterval(responseTimeout);
    // responseTimeout = setTimeout(() => {
    //   WS.close();
    // }, 2000);
  });

  // Event listener for WebSocket close
  WS.addEventListener("close", (data) => {
    log.info("connecting with voice-recording....  4 close");
    console.log("The connection has been closed successfully.");
    // Clear the inactivity timeout if the connection is manually closed
    event.reply("botResponseClosed", "closed-connection");
    clearTimeout(responseTimeout);
  });
});
//:::::::::::::::::::::::::::::::::::::::::::::

//:::::- "install-blackhole" for installing the dependencies of the user's platform/pc
ipcMain.on("install-blackhole", (event, args) => {
  installBrew();
});

function isBlackholeInstalled(callback) {
  const { exec } = require("child_process");
  // brew list
  exec("system_profiler SPAudioDataType", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      callback(false);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      callback(false);
      return;
    }
    if (stdout.includes("blackhole-2ch") || stdout.includes("BlackHole 2ch")) {
      callback(true);
    } else {
      callback(false);
    }
  });
}
//:::::::::::::::::::::::::::::::::::::::::::::

function executeInTerminal(commands) {
  const joinedCommands = commands.join(" && ");
  const osaScript = `tell application "Terminal" to do script "${joinedCommands}"`;
  exec(
    `osascript -e 'tell application "Terminal" to activate' -e '${osaScript}'`,
    (error, stdout, stderr) => {
      if (error) {
        console.error("Failed to execute commands in terminal:", error);
        return;
      }
      const myInterval = setInterval(isBrewInstall, 2000);
      function isBrewInstall() {
        exec("/opt/homebrew/bin/sox --version", (error, stdout, stderr) => {
          if (error) {
            console.log("Homebrew is not installed. Installing Homebrew...");
            log.info("Homebrew is not installed. Installing Homebrew...");
          } else {
            // If there's no error, Homebrew is installed
            console.log("installed");
            console.log("dependencies are installed.");
            log.info("dependencies are installed.");
            win.webContents.send("brew", false);
            win.webContents.send("sox", false);
            win.webContents.send("blackhole", false);
            clearInterval(myInterval);
          }
        });
      }
      console.log("Commands executed successfully in terminal.");
    }
  );
}

async function installBrew() {
  const command =
    '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
  const escapedCommand = command.replace(/"/g, '\\"');

  const command2 = "brew install sox"; // Correct command definition
  const escapedCommand2 = command2.replace(/"/g, '\\"'); // Correct escape usage
  const setPathCmd = 'eval "$(/opt/homebrew/bin/brew shellenv)"';
  const escapedCommand3 = setPathCmd.replace(/"/g, '\\"');
  const command3 = "brew install blackhole-2ch";
  const escapedCommand4 = command3.replace(/"/g, '\\"');
  const allCommands = [
    escapedCommand,
    escapedCommand3,
    escapedCommand2,
    escapedCommand4,
  ];

  executeInTerminal(allCommands);
}

ipcMain.on("isBlackholeInstalled", (event, args) => {
  console.log("isBlackholeInstalled");
});
ipcMain.on("isBrewInstalled", (event, args) => {
  console.log("Checking if Homebrew is installed...");
  const { exec } = require("child_process");
  exec("/opt/homebrew/bin/brew --version", (error, stdout, stderr) => {
    if (stderr) {
      console.error("Error occurred:", stderr);
      console.log("Homebrew is not installed. Installing Homebrew...");
      log.info("Homebrew is not installed. Installing Homebrew...");
    } else {
      event.sender.send("brew", false);
      console.log("Homebrew is already installed.");
      log.info("Homebrew is already installed.");
    }
  });
});

ipcMain.on("isSoxInstalled", (event, args) => {
  log.info("Checking if sox is installed...");
  console.log("Checking if sox is installed...");
  const { exec } = require("child_process");
  exec("/opt/homebrew/bin/sox --version", (error, stdout, stderr) => {
    if (stderr) {
      console.error("Error occurred:", stderr);
      console.log("sox is not installed. Installing sox...");
      log.info("sox is not installed. Installing sox...");
      isBlackholeInstalled((installed) => {
        if (installed) {
          win.webContents.send("blackhole", false);
        }
      });
    } else {
      event.sender.send("sox", false);
      console.log("sox is already installed.");
      log.info("sox is already installed.");
      isBlackholeInstalled((installed) => {
        if (installed) {
          win.webContents.send("blackhole", false);
        }
      });
    }
  });
});

isBlackholeInstalled((installed) => {
  if (!installed) {
    console.log("inside callback");
    win.webContents.on("did-finish-load", function () {
      win.webContents.send("blackhole", true);
    });
  } else {
    win.webContents.on("did-finish-load", function () {
      win.webContents.send("blackhole", false);
    });
  }
});
