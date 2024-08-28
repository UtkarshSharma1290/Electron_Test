import useWhisper from "@chengsokdara/use-whisper";
import React, { useEffect, useState } from "react";

const TestingReactWisperSpeaker = () => {
  const [systemStream, setSystemStream] = useState(null);

  const {
    recording: systemRecording,
    speaking: systemSpeaking,
    transcribing: systemTranscribing,
    transcript: systemTranscript,
    pauseRecording: pauseSystemRecording,
    startRecording: startSystemRecording,
    stopRecording: stopSystemRecording,

  } = useWhisper({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    audioStream: systemStream,
    streaming: true,
    timeSlice: 1_000, // 1 second
    whisperConfig: {
      language: "en",
    },
  });

  // Get the system audio stream (BlackHole)
  useEffect(() => {
    const getSystemStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: "Mac mini Speakers", // Replace with your BlackHole device ID
          },
        });
        setSystemStream(stream);
      } catch (err) {
        console.error("Error accessing system audio: ", err);
      }
    };
    getSystemStream();
  }, []);

  // Start recording when streams are ready
  useEffect(() => {
    if (systemStream) {
      startSystemRecording();
    }
    return () => {
      stopSystemRecording();
    };
  }, [systemStream]);

  return (
    <div className="text-white bg-slate-600 p-4 w-[30vw]">
      <h1>Whisper Transcription</h1>
      <div className="flex flex-col gap-4">
        <h2>System Audio</h2>
        <button
          onClick={startSystemRecording}
          disabled={systemRecording}
          className="bg-fuchsia-400 rounded"
        >
          Start System Recording
        </button>
        <button
          onClick={stopSystemRecording}
          disabled={!systemRecording}
          className="bg-fuchsia-500 rounded"
        >
          Stop System Recording
        </button>
        <button
          onClick={pauseSystemRecording}
          disabled={!systemRecording}
          className="bg-fuchsia-600 rounded"
        >
          Pause System Recording
        </button>
        {!!systemTranscribing && <p>Transcribing system audio...</p>}
        {systemTranscript && <p>System Transcript: {systemTranscript?.text}</p>}
      </div>
    </div>
  );
};
export default TestingReactWisperSpeaker;
