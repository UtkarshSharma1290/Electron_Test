/**
 * An array containing the names of the background process which are related to screen recording
 * @type {Array<String>}
 */
const recordingProcesses = [
  "QuickTime Player",
  "Screen Recorder Robot",
  "OBS",
  "Monosnap",
  "vlc",
  "ActivePresenter",
  "Apowersoft Screen Recorder",
  "TinyTake",
  "Snagit32",
  "Screenflick",
  "MovaviScreenRecorder",
  "ScreenRec",
  "Screencast-O-Matic",
  "icecreamscreenrecorder",
  "Peek360",
  "Screen Capture",
  "Apowersoft Free Online Screen Recorder",
  "screenapp",
  "Loom",
  "Screencastify",
  "AwesomeScreenshot",
  "Wondershare Filmora Mac",
];
/**
 * Name of the custom protocol used to launch out application
 * @type {String}
 */
const CUSTOM_PROTOCOL_NAME = "interviewappdesktop";
const RESPONSE_END_MESSAGE = "streaming_completed";
const PARTIAL_MESSAGE = "PartialTranscript";
const FINAL_MESSAGE = "FinalTranscript";

module.exports = {
  recordingProcesses,
  CUSTOM_PROTOCOL_NAME,
  RESPONSE_END_MESSAGE,
  PARTIAL_MESSAGE,
  FINAL_MESSAGE,
};
