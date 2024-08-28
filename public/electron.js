const { app, BrowserWindow, ipcMain, systemPreferences } = require("electron");
const path = require("path");
const url = require("url");
require("dotenv").config();
const WebSocket = require("ws");
const log = require("electron-log/main");
const os = require('os');
const net = require("net");
require("./utils/audioDeviceAutomation");
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
} = require("./utils/constants");
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
/**
 * Variable for turning on/off the development mode
 */
const IS_DEV = false;
/**
 * Variable for turning on/off the logs
 */
const LOG_INFO = false;
/**
 * IP of the our server
 */
const host = IS_DEV ? "10.10.1.236" : "216.48.190.99"; //server
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
/**
 * Function for printing the output to the console
 * @param {String | number | Array |Object} value
 * @returns
 */
const print = (value) => {
  // if (!IS_DEV) {
  //   return;
  // }
  if (LOG_INFO) {
    log.info(value);
    return;
  }
  console.log(value);
};

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL_NAME, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL_NAME);
}
/**
 * Function for creating a new window instance for our electron app.
 */
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
    minWidth: 500,
    minHeight: 350,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      // devTools: false, //enable this feature while creating a build
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
        print("Microphone access granted");
      } else {
        print("Microphone access denied");
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

ipcMain.on("change-window-opacity", (event, value) => {
  win.setOpacity(value?.opacity);
});

ipcMain.on("get-env", (event, value)=>{
  console.log({value});
  log.info(JSON.stringify(value))
  if(process){
    process.env = value;
  }
})

app.on("open-url", (event, url) => {
  print("fire url event");
  print({ url });
  win.webContents.send("external-url-opened", url);
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
/**
 * Function for taking audio chunk from the selected microphone and sending it to python backend
 * @param {WebSocket} ws
 */
async function startRecordingForMicrophone(ws) {
  try {
    const MONO = 1;
    const deviceId = "External Microphone";

    recordingNew = customDeviceRecorder.record({
      sampleRate: 16000,
      channels: MONO,
      device: deviceId,
    });
    recordingNew.switchInputDevice("default");
    recordingNew.start();

    // recordingNew.stream().pipe(outputStream); for writing the output to the input text

    print("Started taking audio input from microphone");
    // sending the data to the python backend
    recordingNew.stream().on("data", (chunk) => {
      // print({ "Chunk of the web-socket  microphone ": chunk });
      const base64AudioData = chunk.toString("base64");
      ws.send(base64AudioData);
    });
  } catch (err) {
    print({ "No microphone found!": err });
  }
}
/**
 * Function for taking audio chunk from the selected speaker and sending it to python backend
 * @param {WebSocket} ws
 */
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

    print("Start taking audio from the speaker");

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
    print({ "Error occurred while sending speaker audio: ": err });
  }
}

ipcMain.on("send-recording-stop-message", () => {
  try {
    assemblyAiSpeakerWebSocket?.send("terminate_session");
  } catch (err) {
    print({ "Error while sending message to backend: ": err });
  }
});

/*
 * For starting the recording from new "Web-Socket" instead of old "net.Socket" for microphone
 */
ipcMain.on("start-recording-microphone", async (event, args) => {
  const connectionURL = IS_DEV
    ? `ws://${host}:1066/audio/assembly/microphone/${args?.userId}/ai-interview-audio`
    : `ws://ai-interview.hestawork.com/audio/assembly/microphone/${args?.userId}/ai-interview-audio`;

  assemblyAiMicrophoneWebSocket = new WebSocket(connectionURL);

  try {
    assemblyAiMicrophoneWebSocket.on("open", () => {
      print("Connected to server from web-socket microphone");
      startRecordingForMicrophone(assemblyAiMicrophoneWebSocket);
    });

    assemblyAiMicrophoneWebSocket.on("close", () => {
      print("Connection closed from web-socket-microphone");
      event.reply("stop-recording");
    });

    assemblyAiMicrophoneWebSocket.on("message", (chunk) => {
      const parsedObject = JSON.parse(chunk);
      const textData = parsedObject?.text;
      const message_type = parsedObject?.message_type;

      event.reply("microphone-text", { textData, message_type });
    });

    assemblyAiMicrophoneWebSocket.on("error", (error) => {
      console.error("WebSocket error:", error);
      stopRecording();
      assemblyAiMicrophoneWebSocket.close();
      event.reply("stop-recording", "Recording stopped.");
      event.reply("recordingError");
    });
  } catch (err) {
    console.error("Failed to connect or start recording: ", err);
  }
});

/*
 * for starting the recording from new "Web-Socket" instead of old "net.Socket" for speaker
 */
ipcMain.on("start-recording-speaker", async (event, args) => {
  const connectionURL = IS_DEV
    ? `ws://${host}:1066/audio/assembly/speaker/${args?.userId}/ai-interview-audio`
    : `ws://ai-interview.hestawork.com/audio/assembly/speaker/${args?.userId}/ai-interview-audio`;

  assemblyAiSpeakerWebSocket = new WebSocket(connectionURL);

  try {
    assemblyAiSpeakerWebSocket.on("open", () => {
      print("Connected to server from web-socket:");
      startRecordingForSpeaker(assemblyAiSpeakerWebSocket);
    });

    assemblyAiSpeakerWebSocket.on("close", () => {
      print("Connection closed from web-socket");
      event.reply("stop-recording");
    });

    assemblyAiSpeakerWebSocket.on("message", (chunk) => {
      const parsedObject = JSON.parse(chunk);
      const textData = parsedObject?.text;
      const message_type = parsedObject?.message_type;

      event.reply("transcription", { textData, message_type });
    });

    assemblyAiSpeakerWebSocket.on("error", (error) => {
      console.error("WebSocket error:", error);
      stopRecording();
      assemblyAiSpeakerWebSocket.close();
      event.reply("stop-recording", "Recording stopped.");
      event.reply("recordingError");
    });
  } catch (err) {
    console.error("Failed to connect or start recording: ", err);
  }
});

ipcMain.on("stop-recording", async (event, args) => {
  print("Connection closed");
  client?.end();
  outputStream?.end();
  micOutputStream?.end();
  stopRecording();
  assemblyAiMicrophoneWebSocket?.close();
  assemblyAiSpeakerWebSocket?.close();
  event.reply("stop-recording");
  print("=========Stopping recording from IPCMAIN======");
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

/*
 * "regenerated-response" is used to create a new response for same old question.
 */
ipcMain?.on("regenerated-response", (event, value) => {
  const userId = value?.email;
  const sessionId = value?.session_id;
  const questionNumber = value?.questionNumber;
  const resume = value?.resume || "";
  const aiContext = value?.aiContext || "";
  const userInstructions = value?.userInstructions || "";

  const connectionURL = IS_DEV
    ? `http://${host}:1066/openai/regenerate/v2/${userId}/${sessionId}/${questionNumber}/ai-interview-openai`
    : `https://ai-interview.hestawork.com/openai/regenerate/${userId}/${sessionId}/${questionNumber}/ai-interview-openai`; // staging

  const regeneratedSocket = new WebSocket(connectionURL);

  print("about to create a connection");
  regeneratedSocket.addEventListener("open", () => {
    print("Connection with regenrate websocket is stablished...");
    print({ question: value?.userPrompt });
    regeneratedSocket.send(
      `user_question:${value?.userPrompt}:user_question user_resume:${resume}:user_resume user_aiResponse:${aiContext}:user_aiResponse user_instructions:${userInstructions}:user_instructions`
    );
  });

  regeneratedSocket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
    event.reply(
      "bot-regenerated-response",
      (error =
        "Sorry, we are expierencing some issues. Please try again in a while.")
    );
  });

  regeneratedSocket.addEventListener("message", (data) => {
    event.reply("bot-regenerated-response", data.data);
    clearInterval(responseTimeout);
    responseTimeout = setTimeout(() => {
      regeneratedSocket.close();
    }, 2000);
  });

  regeneratedSocket.addEventListener("close", (data) => {
    print("The connection has been closed successfully.");
    // Clear the inactivity timeout if the connection is manually closed
    event.reply("bot-regenerated-close", "closed-connection");
    clearTimeout(responseTimeout);
  });
});

/*
 * websocket for getting the response of the user question from the bot
 */
ipcMain.on("voice-recording", (event, args) => {
  const tags = args?.tags;
  const resume = args?.resume || "";
  const aiContext = args?.aiContext || "";
  const userInstructions = args?.userInstructions || "";
  const isViaRecording = args?.isViaRecording ? "true" : "false";
  print({ "tags get from frontend: ": { tags, args } });

  const connectionURL = IS_DEV
    ? `http:${host}:1066/openai/generate/v2/${args?.email}/${args?.session_id}/${isViaRecording}/ai-interview-openai`
    : `https://ai-interview.hestawork.com/openai/generate/${args?.email}/${args?.session_id}/${isViaRecording}/ai-interview-openai`; // staging

  const userPromptWebSocket = new WebSocket(connectionURL);

  userPromptWebSocket.addEventListener("open", () => {
    print("WebSocket connection opened");
    print(args.userPrompt);
    userPromptWebSocket.send(
      `user_question:${args.userPrompt}:user_question user_resume:${resume}:user_resume user_aiResponse:${aiContext}:user_aiResponse user_instructions:${userInstructions}:user_instructions`
    );
  });

  userPromptWebSocket.addEventListener("error", (error) => {
    print({ "WebSocket error:": error });
    event.reply(
      "botResponse",
      (error =
        "Sorry, we are experiencing some issues. Please try again in a while.")
    );
  });
  userPromptWebSocket.addEventListener("message", (data) => {
    let textData = data?.data;
    if (textData?.includes(RESPONSE_END_MESSAGE)) {
      event.reply("botResponseClosed");
      userPromptWebSocket.close();
      return;
    }

    event.reply("botResponse", data.data);
  });

  // Event listener for WebSocket close
  userPromptWebSocket.addEventListener("close", (data) => {
    print("The connection has been closed successfully.");
    // Clear the inactivity timeout if the connection is manually closed
    event.reply("botResponseClosed", "closed-connection");
    clearTimeout(responseTimeout);
  });
});

/*
 *  For installing the dependencies of the user's platform/pc
 */
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

function brewPath() {
  return isAppleSilicon() ? "/opt/homebrew/bin/brew" : "/usr/local/bin/brew";
}

function soxPath() {
  return isAppleSilicon() ? "/opt/homebrew/bin/sox" : "/usr/local/bin/sox";
}

function isAppleSilicon() {
  log.info({system: process.arch})
  console.log({system: process.arch})
  const cpus = os.cpus();
  const cpuModel = cpus[0]?.model?.toLowerCase();
  console.log({cpuModel})
  log.info({cpuModel})

  if(cpuModel.includes("apple")){
  return true;
  }

  return false;
}

/**
 * Function for executing command for downloading dependencies
 * @param {String} commands
 */
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
        exec(`${soxPath()} --version`, (error, stdout, stderr) => {
          if (error) {
            print("Homebrew is not installed. Installing Homebrew...");
          } else {
            // If there's no error, Homebrew is installed
            print("dependencies are installed.");
            win.webContents.send("brew", false);
            win.webContents.send("sox", false);
            win.webContents.send("blackhole", false);
            clearInterval(myInterval);
          }
        });
      }
      print("Commands executed successfully in terminal.");
    }
  );
}

/**
 * Function for installing dependencies
 */
async function installBrew() {
  const command =
    '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
  const escapedCommand = command.replace(/"/g, '\\"');

  const command2 = "brew install sox"; // Correct command definition
  const escapedCommand2 = command2.replace(/"/g, '\\"'); // Correct escape usage
  const setPathCmd = `eval "$(${brewPath()} shellenv)"`;
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
/**
 * Function for checking is blackhole is installed
 */
ipcMain.on("isBlackholeInstalled", (event, args) => {
  print("isBlackholeInstalled");
});
ipcMain.on("isBrewInstalled", (event, args) => {
  print("Checking if Homebrew is installed...");
  const { exec } = require("child_process");
  exec(`${brewPath()} --version`, (error, stdout, stderr) => {
    if (stderr) {
      print({ "Error occurred": stderr });
      print("Homebrew is not installed. Installing Homebrew...");
    } else {
      event.sender.send("brew", false);
      print("Homebrew is already installed.");
    }
  });
});
/**
 * Function for checking is sox installed
 */
ipcMain.on("isSoxInstalled", (event, args) => {
  print("Checking if sox is installed...");
  const { exec } = require("child_process");
  exec(`${soxPath()} --version`, (error, stdout, stderr) => {
    if (stderr) {
      print({ "Error occurred": stderr });
      print("sox is not installed. Installing sox...");
      isBlackholeInstalled((installed) => {
        if (installed) {
          win.webContents.send("blackhole", false);
        }
      });
    } else {
      event.sender.send("sox", false);
      print("sox is already installed.");
      isBlackholeInstalled((installed) => {
        if (installed) {
          win.webContents.send("blackhole", false);
        }
      });
    }
  });
});


