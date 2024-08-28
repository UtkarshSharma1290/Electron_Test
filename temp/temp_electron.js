const { app, BrowserWindow, ipcMain, systemPreferences } = require("electron");
const path = require("path");
const url = require("url");
const express = require("express");

//this is for rec.js using blackhole
const recorder = require("node-record-lpcm16");

//this is for sox.js using  external mic
const parRecorder = require("node-record-lpcm16/parallelRecorder");
const { exec } = require("child_process");
require("dotenv").config();
const WebSocket = require("ws");
const log = require("electron-log/main");
const net = require("net");
const { isArrayBufferView } = require("node:util/types");
const { Writable } = require("stream");
const client = new net.Socket();
const client2 = new net.Socket();
const psListPromise = import("ps-list");

//un-used imports ---------------------------
const cors = require("cors");
const wav = require("wav");
const { io } = require("socket.io-client");
const fs = require("fs");
const { readFile } = require("fs");
const { join } = require("path");
const FormData = require("form-data");
const localServerApp = express();
const PORT = 3000;
const { default: axios } = require("axios");
const { time } = require("console");
const {
  recordingProcesses,
  CUSTOM_PROTOCOL_NAME,
} = require("./utils/constants");
//-------------------------------------------

//Global variables---------------------------
let outputStream;
let micOutputStream;
let i = 0;
let win;
let recording;
let recordingNew;
let responseTimeout;
const host = "216.48.190.99"; //server
// const host = "10.10.1.107"; //dev
const port = 1068;
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

function hiddenOrShowAppContent({ isHideContent }) {
  if (isHideContent) {
    // --> hidding the application content
    win.webContents
      .executeJavaScript(
        'document.getElementById("root").classList.add("hidden")'
      )
      .catch((err) => {
        console.error("Error executing JavaScript to show content:", err);
      });
    // --> makeing the background as black
    win.webContents
      .executeJavaScript('document.body.classList.add("black-screen")')
      .catch((err) => {
        console.error("Error executing JavaScript to show content:", err);
      });
    // --> showing the application close message
    win.webContents
      .executeJavaScript(
        'document.getElementById("application-close-message").classList.remove("hidden")'
      )
      .catch((err) => {
        console.error("Error executing JavaScript to show content:", err);
      });
    return;
  }
  win.webContents
    .executeJavaScript(
      'document.getElementById("root").classList.remove("hidden")'
    )
    .catch((err) => {
      console.error("Error executing JavaScript to show content:", err);
    });

  win.webContents.executeJavaScript(
    'document.body.classList.remove("black-screen")'
  );

  win.webContents
    .executeJavaScript(
      'document.getElementById("application-close-message").classList.add("hidden")'
    )
    .catch((err) => {
      console.error("Error executing JavaScript to show content:", err);
    });
}

async function monitorForScreenRecorderBackgroundProcesses() {
  try {
    const psList = await psListPromise;
    const processes = await psList.default();
    const isRecording = processes.filter((p) =>
      recordingProcesses.includes(p.name)
    );
    if (isRecording?.length) {
      console.log(isRecording, "found");
      hiddenOrShowAppContent({ isHideContent: true });
    } else {
      hiddenOrShowAppContent({ isHideContent: false });
      console.log(isRecording, "not found");
    }
  } catch (error) {
    console.log(error);
  }
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
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      devTools: false,
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

  // isBrewInstalled();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  let setIntervalIdForBackgroundProcessMonitoring;
  win.webContents.on("did-finish-load", () => {
    win.setContentProtection(true);
    // below function is used to detect any background process used to capture the screen-recording
    // if (!setIntervalIdForBackgroundProcessMonitoring) {
    //   setIntervalIdForBackgroundProcessMonitoring = setInterval(() => {
    //     monitorForScreenRecorderBackgroundProcesses();
    //   }, 3000);
    // }
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
      client.write(chunk);
      callback();
    },
  });
  const MONO = 1;
  const deviceId = "Blackhole 2ch";

  // const outputFile = "recorder.wav";
  // const fileWriter = new wav.FileWriter(outputFile, {
  //   channels: MONO,
  //   sampleRate: 16000,
  //   bitDepth: 16,
  // });

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
  outputStream = new Writable({
    write(chunk, encoding, callback) {
      client.write(chunk);
      callback();
    },
  });
  const MONO = 1;
  const deviceId = "External Microphone";

  // const outputFile = "recorder.wav";
  // const fileWriter = new wav.FileWriter(outputFile, {
  //   channels: MONO,
  //   sampleRate: 16000,
  //   bitDepth: 16,
  // });

  recordingNew = parRecorder.record({
    sampleRate: 16000,
    channels: MONO,
    device: deviceId,
  });

  // recordingNew.stream().pipe(fileWriter);

  recordingNew.stream().pipe(outputStream);
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
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::

async function startRecording(ws) {
  const MONO = 1;
  const deviceId = "External Microphone";

  recordingNew = parRecorder.record({
    sampleRate: 16000,
    channels: MONO,
    device: deviceId,
  });
  recordingNew.start();

  // recordingNew.stream().pipe(outputStream); for writing the output to the input text

  console.log("Recording...");
  // sending the data to the python backend
  recordingNew.stream().on("data", (chunk) => {
    console.log("Chunk of the web-socket: ", { chunk });
    const base64AudioData = chunk.toString("base64");
    ws.send(base64AudioData);
  });

  //recieving the data from python backend
  // note: with WebSocket we have to listen to "message" event in-order to get the data from the backend
  ws.on("message", (chunk) => {
    const parsedData = JSON.parse(chunk);
    const textData = parsedData?.text;
    console.log("getting microphone text from backend: ", {
      responseData: textData,
    });

    if (chunk instanceof ArrayBuffer || isArrayBufferView(chunk)) {
      let decoder = new TextDecoder("utf-8");
      let chunkData = decoder.decode(chunk).trim();
      chunkData = chunkData.replace(/^\s+|\s+$/g, "");
      chunkData = chunkData.replace(/\u0000/g, "");
      chunkData = chunkData.replace(/\n/g, " ");
      // event.reply("transcription", chunkData);
      console.log(chunkData);
      console.log("Audio getting form the speaker: ", chunkData);
    }
  });
}

//:::::- for starting the recording from new "Web-Socket" instead of old "net.Socket"
ipcMain.on("start-recording", async (event, args) => {
  // const userid = localStorage?.getItem("emailForSignIn");
  //local: ws://10.10.1.107:1066

  // const ws = new WebSocket(`ws://216.48.190.99:1068/audio/${userid}`);
  // const ws = new WebSocket(`ws://10.10.1.107:8765`);
  console.log("connected with the new");
  const ws = new WebSocket("ws://0.tcp.in.ngrok.io:18719/ws");

  try {
    ws.on("open", () => {
      console.log("Connected to server from web-socket------------------");
      startRecording(ws);
    });

    ws.on("close", () => {
      console.log("Connection closed from web-socket");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      stopRecording(recorder);
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
      // console.log("checking recording running", i++);
      if (chunk instanceof ArrayBuffer || isArrayBufferView(chunk)) {
        let decoder = new TextDecoder("utf-8");
        let chunkData = decoder.decode(chunk).trim();
        chunkData = chunkData.replace(/^\s+|\s+$/g, "");
        chunkData = chunkData.replace(/\u0000/g, "");
        chunkData = chunkData.replace(/\n/g, " ");
        event.reply("transcription", chunkData);
        // console.log(chunkData);
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
      // console.log("checking recording running", i++);
      if (chunk instanceof ArrayBuffer || isArrayBufferView(chunk)) {
        let decoder = new TextDecoder("utf-8");
        let chunkData = decoder.decode(chunk).trim();
        chunkData = chunkData.replace(/^\s+|\s+$/g, "");
        chunkData = chunkData.replace(/\u0000/g, "");
        chunkData = chunkData.replace(/\n/g, " ");
        // event.reply("transcription", chunkData); // --> for sending the text to the frontend input box
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
  // client.end(); // Close the client connection
  console.log("Connection closed");
  client.end();
  outputStream.end();
  // j = j - 1;
  stopRecording(recorder);
  event.reply("stop-recording", "Recording stopped.");
  console.log("=========Stopping recording from IPCMAIN======");
  log.info("=========Stopping recording from IPCMAIN======");
});

const stopRecording = () => {
  if (recording) {
    recording.stop();
    recording = null;
  }

  if (recordingNew) {
    recordingNew.stop();
    recordingNew = null;
  }
};

//:::::- "regenrate-response" is used to create a new response
ipcMain?.on("regenrate-response", (event, value) => {
  const userId = value?.email;
  const sessionId = value?.session_id;
  const encryptedResponseMessage = "ai-interview-openai";

  log.info(
    "connecting with re-generating socket...... 1",
    encryptedResponseMessage,
    value
  );

  const regenrateSocket = new WebSocket(
    // `http://${host}:1066/openai/regenerate/${userId}/${sessionId}/${encryptedResponseMessage}` //dev
    `https://ai-interview.hestawork.com/openai/regenerate/${userId}/${sessionId}/${encryptedResponseMessage}` // staging
  );

  console.log("about to create a connection");
  regenrateSocket.addEventListener("open", () => {
    log.info("connecting with re-generating socket...... 2");
    console.log("Connection with regenrate websocket is stablished...");
    console.log({ question: value?.userPrompt });
    regenrateSocket.send(value?.userPrompt);
  });

  regenrateSocket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
    log.info("connecting with re-generating socket...... 4 error", { error });
    event.reply(
      "bot-regenrated-response",
      (error =
        "Sorry, we are expierencing some issues. Please try again in a while.")
    );
  });

  regenrateSocket.addEventListener("message", (data) => {
    event.reply("bot-regenrated-response", data.data);
    log.info("connecting with re-generating socket......  5 message", { data });
    clearInterval(responseTimeout);
    responseTimeout = setTimeout(() => {
      regenrateSocket.close();
    }, 2000);
  });

  regenrateSocket.addEventListener("close", (data) => {
    log.info("connecting with re-generating socket...... 3 closed..");
    console.log("The connection has been closed successfully.");
    // Clear the inactivity timeout if the connection is manually closed
    event.reply("bot-regenated-close", "closed-connection");
    clearTimeout(responseTimeout);
  });
});
//:::::::::::::::::::::::::::::::::::::::::::::

//:::::- websocket for getting the response of the user question from the bot
ipcMain.on("voice-recording", (event, args) => {
  console.log("called the input text websocket");
  const encrypted_message = "ai-interview-openai";
  log.info("connecting with voice-recording....  111", encrypted_message);
  const WS = new WebSocket(
    // `http://10.10.1.107:1066/openai/response/${args?.email}/${
    //   args?.session_id
    // }/${"devops"}/${encrypted_message}` // local
    `https://ai-interview.hestawork.com/openai/response/${args.email}/${args.session_id}/${encrypted_message}` // staging
  );
  WS.addEventListener("open", () => {
    log.info("connecting with voice-recording....  1 open");
    console.log("WebSocket connection opened");
    log.info(
      "connecting with voice-recording....  1",
      encrypted_message,
      args.userPrompt
    );
    WS.send(args.userPrompt);
  });

  WS.addEventListener("error", (error) => {
    log.info("connecting with voice-recording.... ", error);
    console.error("WebSocket error:", error);
    event.reply(
      "botResponse",
      (error =
        "Sorry, we are expierencing some issues. Please try again in a while.")
    );
  });
  WS.addEventListener("message", (data) => {
    log.info("connecting with voice-recording....  3 response", data);
    event.reply("botResponse", data.data);
    clearInterval(responseTimeout);
    responseTimeout = setTimeout(() => {
      WS.close();
    }, 2000);
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
